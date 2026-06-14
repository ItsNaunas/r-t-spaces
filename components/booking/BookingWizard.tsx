"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendlyWidget } from "@/components/CalendlyWidget";
import {
  calculateHours,
  calculatePrice,
  calculateDeposit,
  calculateBalance,
  getPackagePriceForHours,
  getDepositForPackage,
  getBalanceForPackage,
  getHourlyRateForPackage,
  BOOKING_PACKAGES,
  HIRE_RATE_IDS,
  ADDONS,
  computeAddonsTotal,
  type BookingPackage,
  type SelectedAddon,
} from "@/lib/pricing";

const SESSION_PACKAGE_IDS = [
  "essential-studio",
  "signature-studio",
  "luxury-studio",
  "engagement-story",
];

type Offer = "hire" | "session";
type Step = "offer" | "option" | "time" | "pay";

type BookingPrefill = { offer?: Offer; packageId?: string } | null;

type CalendlyEvent = {
  event: string;
  payload: {
    event_type: string;
    invitee: { email: string; name: string; uri: string };
    scheduled_event: { start_time: string; end_time: string; location: string };
    event: { uri: string };
  };
};

type FormState = {
  name: string;
  email: string;
  date: string;
  hours: string;
  notes: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  pendingBookingId?: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  date: "",
  hours: "",
  notes: "",
  calendlyEventUri: "",
  calendlyInviteeUri: "",
  pendingBookingId: "",
};

/** Lowest possible price for a package (used for "from £X" before a time is chosen). */
function fromPrice(pkg: BookingPackage): number {
  if (pkg.priceFromTime) {
    const min = pkg.minimumHours ?? 2;
    return min * getHourlyRateForPackage(pkg);
  }
  return pkg.price;
}

export function BookingWizard({
  prefill,
  onClose,
}: {
  prefill?: BookingPrefill;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<Step>("offer");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [paymentMode, setPaymentMode] = useState<"request" | "pay">("pay");

  const [formData, setFormData] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [calendlyTimeSelected, setCalendlyTimeSelected] = useState(false);
  const [calendlyData, setCalendlyData] = useState<{
    eventType: string;
    startTime: string;
    endTime: string;
    inviteeEmail: string;
    inviteeName: string;
  } | null>(null);

  const [selectedPackage, setSelectedPackage] = useState<BookingPackage | null>(null);
  const [bookingPrice, setBookingPrice] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number | null>(null);

  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [requestPrintsAlbums, setRequestPrintsAlbums] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  const [pendingBookingExpiresAt, setPendingBookingExpiresAt] = useState<Date | null>(null);
  const pendingCreationRef = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const [livePackages, setLivePackages] = useState<BookingPackage[]>(BOOKING_PACKAGES);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
    discountAmount: number;
    finalPrice: number;
    finalDeposit: number;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK || "";

  const selectedAddons: SelectedAddon[] = ADDONS.filter(
    (a) => a.price != null && a.id !== "prints-albums"
  )
    .map((a) => ({
      id: a.id,
      quantity: a.unit ? addonQuantities[a.id] ?? 0 : addonQuantities[a.id] ? 1 : 0,
    }))
    .filter((s) => (s.quantity ?? 0) > 0);
  const { total: addonsTotal, summary: addonsSummary } = computeAddonsTotal(selectedAddons);

  const displayPrice = appliedDiscount ? appliedDiscount.finalPrice : bookingPrice;
  const displayDeposit = appliedDiscount ? appliedDiscount.finalDeposit : depositAmount;
  const displayBalance =
    displayPrice != null && displayDeposit != null ? displayPrice - displayDeposit : balanceAmount;

  const optionList = useMemo(() => {
    const ids = offer === "hire" ? HIRE_RATE_IDS : SESSION_PACKAGE_IDS;
    return ids
      .map((id) => livePackages.find((p) => p.id === id))
      .filter((p): p is BookingPackage => Boolean(p));
  }, [offer, livePackages]);

  // Load live packages (admin-managed), fall back to static.
  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => {
        if (data.packages?.length) setLivePackages(data.packages);
      })
      .catch(() => {});
  }, []);

  // Apply prefill once.
  useEffect(() => {
    if (!prefill) return;
    if (prefill.offer) {
      setOffer(prefill.offer);
      setStep("option");
    }
    if (prefill.packageId) {
      const pkg = (livePackages.length ? livePackages : BOOKING_PACKAGES).find(
        (p) => p.id === prefill.packageId
      );
      if (pkg) {
        setSelectedPackage(pkg);
        setOffer(HIRE_RATE_IDS.includes(pkg.id) ? "hire" : "session");
        setStep("time");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, livePackages.length]);

  // Pricing: total = package + add-ons; deposit on package only.
  useEffect(() => {
    if (paymentMode !== "pay") {
      setBookingPrice(null);
      setDepositAmount(null);
      setBalanceAmount(null);
      return;
    }
    if (selectedPackage) {
      const isTimeBased =
        selectedPackage.priceFromTime && calendlyData?.startTime && calendlyData?.endTime;
      if (selectedPackage.priceFromTime && !isTimeBased) {
        setBookingPrice(null);
        setDepositAmount(null);
        setBalanceAmount(null);
        return;
      }
      const hours = isTimeBased
        ? calculateHours(calendlyData!.startTime, calendlyData!.endTime, selectedPackage.minimumHours)
        : selectedPackage.hours;
      const packagePrice = isTimeBased
        ? getPackagePriceForHours(selectedPackage, hours)
        : selectedPackage.price;
      const packageDeposit = getDepositForPackage(selectedPackage, packagePrice);
      const packageBalance = getBalanceForPackage(selectedPackage, packagePrice, packageDeposit);
      setBookingPrice(packagePrice + addonsTotal);
      setDepositAmount(packageDeposit);
      setBalanceAmount(packageBalance + addonsTotal);
    } else if (calendlyData?.startTime && calendlyData?.endTime) {
      const hours = calculateHours(calendlyData.startTime, calendlyData.endTime);
      const totalPrice = calculatePrice(hours);
      const deposit = calculateDeposit(totalPrice);
      setBookingPrice(totalPrice);
      setDepositAmount(deposit);
      setBalanceAmount(calculateBalance(totalPrice, deposit));
    } else {
      setBookingPrice(null);
      setDepositAmount(null);
      setBalanceAmount(null);
    }
  }, [selectedPackage, calendlyData, paymentMode, addonsTotal]);

  // Create a pending booking once package + time are both set (pay mode).
  useEffect(() => {
    if (
      paymentMode === "pay" &&
      calendlyTimeSelected &&
      calendlyData &&
      selectedPackage &&
      bookingPrice &&
      depositAmount &&
      calendlyData.inviteeName &&
      calendlyData.inviteeEmail &&
      !formData.pendingBookingId &&
      formData.calendlyEventUri &&
      !pendingCreationRef.current
    ) {
      // Guard against a duplicate POST: the effect re-runs when deps like
      // addonsTotal change before the first request resolves and pendingBookingId
      // is set. The ref blocks a second in-flight creation.
      pendingCreationRef.current = true;
      const create = async () => {
        try {
          const response = await fetch("/api/pending-bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              calendlyEventUri: formData.calendlyEventUri,
              calendlyInviteeUri: formData.calendlyInviteeUri,
              customerName: calendlyData.inviteeName,
              customerEmail: calendlyData.inviteeEmail,
              startTime: calendlyData.startTime,
              endTime: calendlyData.endTime,
              packageId: selectedPackage.id,
              packageTitle: selectedPackage.title,
              totalPrice: bookingPrice,
              depositAmount,
              addonsTotal: addonsTotal || 0,
              addonsSummary: addonsSummary || "",
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setFormData((prev) => ({ ...prev, pendingBookingId: data.id }));
            setPendingBookingExpiresAt(new Date(data.expiresAt));
          } else {
            pendingCreationRef.current = false; // allow retry
          }
        } catch (error) {
          pendingCreationRef.current = false; // allow retry
          console.error("Failed to create pending booking:", error);
        }
      };
      create();
    }
  }, [
    paymentMode,
    calendlyTimeSelected,
    calendlyData,
    selectedPackage,
    bookingPrice,
    depositAmount,
    addonsTotal,
    addonsSummary,
    formData.calendlyEventUri,
    formData.calendlyInviteeUri,
    formData.pendingBookingId,
  ]);

  // Reset discount when the basis changes.
  useEffect(() => {
    setAppliedDiscount(null);
    setDiscountError("");
  }, [selectedPackage, addonsTotal]);

  // Changing the package/offer invalidates any pending hold we created — clear it
  // so checkout never sends a stale pendingBookingId (which would book/charge the
  // wrong package), and a fresh hold gets created for the new selection.
  useEffect(() => {
    setFormData((prev) => (prev.pendingBookingId ? { ...prev, pendingBookingId: "" } : prev));
    setPendingBookingExpiresAt(null);
    pendingCreationRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage?.id, offer]);

  // Countdown for the payment hold.
  useEffect(() => {
    if (!pendingBookingExpiresAt) {
      setTimeRemaining(null);
      return;
    }
    const tick = () => {
      const diff = pendingBookingExpiresAt.getTime() - Date.now();
      setTimeRemaining(Math.max(0, Math.floor(diff / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pendingBookingExpiresAt]);

  const handleApplyDiscount = async () => {
    if (!discountInput.trim() || !bookingPrice) return;
    setDiscountLoading(true);
    setDiscountError("");
    setAppliedDiscount(null);
    try {
      const res = await fetch("/api/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountInput.trim(),
          packageId: selectedPackage?.id ?? "global",
          basePrice: bookingPrice,
        }),
      });
      const data = await res.json();
      if (data.valid) setAppliedDiscount(data);
      else setDiscountError(data.error ?? "Invalid code");
    } catch {
      setDiscountError("Unable to validate. Please try again.");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleCalendlyEvent = async (event: CalendlyEvent | { event?: string; payload?: unknown }) => {
    try {
      if (event?.event !== "calendly.event_scheduled") return;
      const payload = (event as CalendlyEvent).payload;
      if (!payload?.event?.uri || !payload?.invitee?.uri) return;

      const eventUri = payload.event.uri;
      const inviteeUri = payload.invitee.uri;

      try {
        const response = await fetch("/api/calendly-event-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventUri, inviteeUri }),
        });
        if (!response.ok) throw new Error("Failed to fetch event details");
        const eventData = await response.json();
        if (!eventData.start_time || !eventData.end_time || !eventData.invitee)
          throw new Error("Incomplete event data");

        const start = new Date(eventData.start_time);
        const end = new Date(eventData.end_time);
        const dateStr = start.toISOString().split("T")[0];
        const fmt = (d: Date) =>
          d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        setCalendlyData({
          eventType: eventData.event_type || "",
          startTime: eventData.start_time,
          endTime: eventData.end_time,
          inviteeEmail: eventData.invitee.email,
          inviteeName: eventData.invitee.name,
        });
        setFormData((prev) => ({
          ...prev,
          name: eventData.invitee.name || prev.name,
          email: eventData.invitee.email || prev.email,
          date: dateStr,
          hours: `${fmt(start)} – ${fmt(end)}`,
          calendlyEventUri: eventUri,
          calendlyInviteeUri: inviteeUri,
        }));
        setCalendlyTimeSelected(true);
      } catch (error) {
        console.error("Error fetching Calendly event details:", error);
        setFormData((prev) => ({
          ...prev,
          calendlyEventUri: eventUri,
          calendlyInviteeUri: inviteeUri,
        }));
        setMessage("Time selected, but some details could not be loaded. Please add your name and email.");
        setStatus("error");
        setCalendlyTimeSelected(true);
      }
    } catch (err) {
      console.error("Error handling Calendly event:", err);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (paymentMode === "pay") {
      if (!selectedPackage) return fail("Please choose an option first.");
      if (!calendlyTimeSelected || !calendlyData) return fail("Please pick a time first.");
      if (!bookingPrice || !depositAmount) return fail("Unable to calculate pricing. Pick an option and time.");
    }
    if (paymentMode === "request" && !calendlyTimeSelected) return fail("Please pick a time first.");
    if (!formData.name || !formData.email)
      return fail("Please complete the calendar step so we have your name and email.");

    setStatus("loading");
    setMessage("");

    try {
      if (paymentMode === "pay") {
        const notesWithAddons = requestPrintsAlbums
          ? (formData.notes || "").trim() + (formData.notes ? "\n\n" : "") + "Prints & albums requested."
          : formData.notes;
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            notes: notesWithAddons,
            startTime: calendlyData?.startTime,
            endTime: calendlyData?.endTime,
            totalPrice: bookingPrice,
            depositAmount,
            selectedPackage: selectedPackage?.id,
            packageTitle: selectedPackage?.title,
            addonsTotal: addonsTotal || 0,
            addonsSummary: addonsSummary || "",
            pendingBookingId: formData.pendingBookingId,
            calendlyEventUri: formData.calendlyEventUri,
            calendlyInviteeUri: formData.calendlyInviteeUri,
            discountCode: appliedDiscount?.code ?? "",
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Something went wrong");
        }
        const { url } = await response.json();
        if (url) window.location.href = url;
        else throw new Error("No checkout URL received");
      } else {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Something went wrong");
        }
        setStatus("success");
        setMessage("Thanks! We'll confirm within 24 hours.");
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to send. Please email enquires@rtspaces.co.uk."
      );
    }
  };

  function fail(msg: string) {
    setMessage(msg);
    setStatus("error");
  }

  // ---- derived UI state ----
  const steps: Step[] = paymentMode === "request" ? ["offer", "time", "pay"] : ["offer", "option", "time", "pay"];
  const stepIndex = steps.indexOf(step);
  const canContinue =
    step === "offer"
      ? Boolean(offer)
      : step === "option"
        ? Boolean(selectedPackage)
        : step === "time"
          ? calendlyTimeSelected
          : false;

  const goBack = () => {
    const prev = steps[Math.max(0, stepIndex - 1)];
    setStep(prev);
    setStatus("idle");
    setMessage("");
  };
  const goNext = () => {
    const next = steps[Math.min(steps.length - 1, stepIndex + 1)];
    setStep(next);
    setStatus("idle");
    setMessage("");
  };

  const startEnquiry = () => {
    setPaymentMode("request");
    setSelectedPackage(null);
    setStep("time");
  };

  const footerPrice =
    paymentMode === "pay"
      ? displayPrice != null
        ? `£${displayPrice.toFixed(2)}`
        : selectedPackage
          ? `From £${fromPrice(selectedPackage).toFixed(0)}`
          : null
      : null;

  return (
    <div className="flex h-full flex-col bg-[var(--base)]">
      {/* Progress */}
      <div className="shrink-0 border-b border-[var(--lavender)] bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-[var(--primary)]" : "bg-[var(--lavender)]/50"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
          Step {stepIndex + 1} of {steps.length}
          {step === "offer" && " · What do you need?"}
          {step === "option" && (offer === "hire" ? " · Pick your hire" : " · Pick your session")}
          {step === "time" && " · Pick a date & time"}
          {step === "pay" && (paymentMode === "pay" ? " · Review & pay" : " · Your details")}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === "offer" && (
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-[var(--primary)]">What would you like to do?</h3>
            <div className="grid gap-4">
              <OfferCard
                title="Hire the studio"
                blurb="Bring your own camera and crew. Full run of the space and all equipment, by the hour or day."
                price="From £55/hr"
                active={offer === "hire"}
                onClick={() => {
                  setOffer("hire");
                  setSelectedPackage(null);
                  goNext();
                }}
              />
              <OfferCard
                title="Book a photo session"
                blurb="We shoot it for you. Direction, lighting, and edited images delivered in a private gallery."
                price="From £110"
                active={offer === "session"}
                onClick={() => {
                  setOffer("session");
                  setSelectedPackage(null);
                  goNext();
                }}
              />
            </div>
            <button
              type="button"
              onClick={startEnquiry}
              className="mt-2 text-sm text-[var(--muted-plum)] underline underline-offset-2 hover:text-[var(--primary)]"
            >
              Not sure yet? Send an enquiry instead
            </button>
          </div>
        )}

        {step === "option" && (
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-[var(--primary)]">
              {offer === "hire" ? "Choose your hire" : "Choose your session"}
            </h3>
            <div className="grid gap-3">
              {optionList.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]"
                        : "border-[var(--lavender)] bg-white hover:border-[var(--primary)]/60"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 left-4 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-text)]">
                        Most popular
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading font-semibold text-[var(--primary)]">{pkg.title}</p>
                        <p className="text-sm text-[var(--muted-plum)]">{pkg.duration}</p>
                      </div>
                      <p className="shrink-0 font-heading text-lg font-semibold text-[var(--primary)]">
                        {pkg.priceFromTime ? `£${getHourlyRateForPackage(pkg)}/hr` : `£${pkg.price}`}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {pkg.includes.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[var(--muted-plum)]">
                          <span className="mt-0.5 text-[var(--primary)]">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <p className="mt-2 text-sm font-semibold text-[var(--primary)]">✓ Selected</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Optional extras */}
            {selectedPackage && (
              <div className="rounded-2xl border-2 border-[var(--lavender)] bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddons((v) => !v)}
                  className="flex w-full items-center justify-between p-4 text-left"
                  aria-expanded={showAddons}
                >
                  <span className="font-medium text-[var(--primary)]">Add extras (optional)</span>
                  <span className={`transition-transform ${showAddons ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {showAddons && (
                  <div className="space-y-4 border-t border-[var(--lavender)] p-4">
                    {ADDONS.filter((a) => a.id !== "prints-albums").map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[var(--primary)]">{addon.label}</p>
                          {addon.price != null && (
                            <p className="text-xs text-[var(--muted-plum)]">
                              {addon.unit === "person"
                                ? `£${addon.price} per person`
                                : addon.unit === "image"
                                  ? `£${addon.price} each`
                                  : addon.unit === "hour"
                                    ? `£${addon.price} per hour`
                                    : `£${addon.price}`}
                            </p>
                          )}
                        </div>
                        {addon.unit ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAddonQuantities((q) => ({
                                  ...q,
                                  [addon.id]: Math.max(0, (q[addon.id] ?? 0) - 1),
                                }))
                              }
                              className="h-8 w-8 border border-[var(--lavender)] font-medium text-[var(--primary)]"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-semibold text-[var(--primary)]">
                              {addonQuantities[addon.id] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setAddonQuantities((q) => ({ ...q, [addon.id]: (q[addon.id] ?? 0) + 1 }))
                              }
                              className="h-8 w-8 border border-[var(--lavender)] font-medium text-[var(--primary)]"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <input
                            type="checkbox"
                            checked={!!addonQuantities[addon.id]}
                            onChange={(e) =>
                              setAddonQuantities((q) => ({ ...q, [addon.id]: e.target.checked ? 1 : 0 }))
                            }
                          />
                        )}
                      </div>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-[var(--muted-plum)]">
                      <input
                        type="checkbox"
                        checked={requestPrintsAlbums}
                        onChange={(e) => setRequestPrintsAlbums(e.target.checked)}
                      />
                      Enquire about prints &amp; albums
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "time" && (
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-[var(--primary)]">Pick a date &amp; time</h3>
            <p className="text-sm text-[var(--muted-plum)]">
              Choose an available slot. Open daily 8 AM – 11 PM.
            </p>
            {calendlyUrl ? (
              <div className="rounded-2xl border-2 border-[var(--lavender)] bg-white">
                <CalendlyWidget url={calendlyUrl} onEventScheduled={handleCalendlyEvent} />
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[var(--lavender)] bg-white p-6 text-sm text-[var(--muted-plum)]">
                Online scheduling is being set up. Please email{" "}
                <a className="underline" href="mailto:enquires@rtspaces.co.uk">
                  enquires@rtspaces.co.uk
                </a>{" "}
                or DM @rtspaces to book.
              </div>
            )}
            {calendlyTimeSelected && calendlyData && (
              <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                ✓ {new Date(calendlyData.startTime).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                at{" "}
                {new Date(calendlyData.startTime).toLocaleTimeString("en-GB", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        )}

        {step === "pay" && (
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-heading text-2xl text-[var(--primary)]">
              {paymentMode === "pay" ? "Review & pay your deposit" : "Confirm your enquiry"}
            </h3>

            {calendlyData && (
              <div className="space-y-1 border border-[var(--lavender)] bg-white p-4 text-sm">
                <p className="font-semibold text-[var(--primary)]">{calendlyData.inviteeName}</p>
                <p className="text-[var(--muted-plum)]">{calendlyData.inviteeEmail}</p>
                <p className="text-[var(--muted-plum)]">
                  {new Date(calendlyData.startTime).toLocaleString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {paymentMode === "pay" && selectedPackage && displayPrice != null && displayDeposit != null && (
              <div className="space-y-2 border border-[var(--lavender)] bg-white p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-plum)]">{selectedPackage.title}</span>
                  <span className="font-semibold text-[var(--primary)]">
                    £{(selectedPackage.priceFromTime ? bookingPrice! - addonsTotal : selectedPackage.price).toFixed(2)}
                  </span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-plum)]">Add-ons</span>
                    <span className="font-semibold text-[var(--primary)]">£{addonsTotal}</span>
                  </div>
                )}
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span className="font-semibold">-£{appliedDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[var(--lavender)] pt-2">
                  <span className="font-medium text-[var(--muted-plum)]">Total</span>
                  <span className="font-heading text-lg font-semibold text-[var(--primary)]">
                    £{displayPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-plum)]">Pay now (deposit)</span>
                  <span className="font-semibold text-[var(--primary)]">£{displayDeposit.toFixed(2)}</span>
                </div>
                {displayBalance != null && displayBalance > 0 && (
                  <div className="flex justify-between text-xs text-[var(--muted-plum)]">
                    <span>Balance on the day</span>
                    <span>£{displayBalance.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Discount */}
            {paymentMode === "pay" && bookingPrice != null && selectedPackage && !appliedDiscount && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  placeholder="Discount code"
                  className="flex-1 rounded-xl border border-[var(--lavender)] bg-white px-3 py-2 text-sm text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountInput.trim()}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {discountLoading ? "…" : "Apply"}
                </button>
              </div>
            )}
            {discountError && <p className="text-xs text-red-600">{discountError}</p>}

            {paymentMode === "pay" && timeRemaining !== null && timeRemaining > 0 && (
              <p className="text-xs text-[var(--muted-plum)]">
                We&apos;re holding this slot for {Math.floor(timeRemaining / 60)}:
                {(timeRemaining % 60).toString().padStart(2, "0")} while you pay.
              </p>
            )}

            <label className="flex items-start gap-3 text-sm text-[var(--primary)]">
              <input
                type="checkbox"
                checked={agreedToPolicies}
                onChange={(e) => setAgreedToPolicies(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the{" "}
                <Link href="/policies" target="_blank" className="underline underline-offset-2">
                  studio policies
                </Link>
                .
              </span>
            </label>

            {message && (
              <div
                className={`border p-3 text-sm ${
                  status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Sticky footer — hidden on the offer step, where the cards auto-advance */}
      {step !== "offer" && (
      <div className="shrink-0 border-t border-[var(--lavender)] bg-white px-5 py-4">
        {footerPrice && (
          <div className="mb-3 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm text-[var(--muted-plum)]">
                {selectedPackage?.title ?? "Studio booking"}
              </span>
              {displayPrice != null && (
                <span className="shrink-0 text-sm text-[var(--muted-plum)]">
                  Total £{displayPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
                {displayDeposit != null ? "Deposit due now" : "From"}
              </span>
              <span className="font-heading text-xl font-semibold text-[var(--primary)]">
                {displayDeposit != null ? `£${displayDeposit.toFixed(2)}` : footerPrice}
              </span>
            </div>
            {paymentMode === "pay" && (
              <p className="text-[11px] leading-snug text-[var(--muted-plum)]">
                Pay just the deposit now. Balance before your session · deposit non-refundable.
              </p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="btn-secondary flex-1"
              disabled={status === "loading"}
            >
              Back
            </button>
          )}
          {step !== "pay" ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="btn-primary flex-[2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          ) : status === "success" ? (
            <button type="button" onClick={onClose} className="btn-primary flex-[2]">
              Done
            </button>
          ) : (
            <button
              type="submit"
              form="booking-form"
              disabled={
                status === "loading" ||
                !agreedToPolicies ||
                (paymentMode === "pay" && (!selectedPackage || !bookingPrice))
              }
              className="btn-primary flex-[2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading"
                ? paymentMode === "pay"
                  ? "Processing…"
                  : "Sending…"
                : paymentMode === "pay"
                  ? displayDeposit != null
                    ? `Pay £${displayDeposit.toFixed(2)} deposit`
                    : "Pay deposit"
                  : "Send enquiry"}
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

function OfferCard({
  title,
  blurb,
  price,
  active,
  onClick,
}: {
  title: string;
  blurb: string;
  price: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full border-2 p-5 text-left transition-all ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--lavender)] bg-white hover:border-[var(--primary)]/60 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-lg font-semibold text-[var(--primary)]">{title}</p>
        <span className="shrink-0 text-sm font-semibold text-[var(--gold-text)]">{price}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--muted-plum)]">{blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
        Choose this
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </span>
    </button>
  );
}
