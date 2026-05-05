 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendlyWidget } from "./CalendlyWidget";
import { calculateHours, calculatePrice, calculateDeposit, calculateBalance, getPackagePriceForHours, getDepositForPackage, getBalanceForPackage, BOOKING_PACKAGES, HIRE_RATE_IDS, ADDONS, computeAddonsTotal, type BookingPackage, type SelectedAddon } from "@/lib/pricing";

const MAIN_PACKAGE_IDS = ["essential-studio", "signature-studio", "luxury-studio", "engagement-story"];

function buildSections(packages: BookingPackage[]) {
  const hirePackages = packages.filter((p) => HIRE_RATE_IDS.includes(p.id));
  const mainPackages = packages.filter((p) => MAIN_PACKAGE_IDS.includes(p.id));
  return [
    { id: "basic" as const, label: "Basic", description: "Studio hire by the hour or block", packages: hirePackages },
    { id: "package" as const, label: "Package", description: "Session packages with time & images", packages: mainPackages },
  ];
}

type BookingPayload = {
  name: string;
  email: string;
  date: string;
  hours: string;
  notes: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  pendingBookingId?: string;
};

type CalendlyEvent = {
  event: string;
  payload: {
    event_type: string;
    invitee: {
      email: string;
      name: string;
      uri: string;
    };
    scheduled_event: {
      start_time: string;
      end_time: string;
      location: string;
    };
    event: {
      uri: string;
    };
  };
};

const initialPayload: BookingPayload = {
  name: "",
  email: "",
  date: "",
  hours: "",
  notes: "",
  calendlyEventUri: "",
  calendlyInviteeUri: "",
  pendingBookingId: "",
};

export function BookingForm() {
  const [formData, setFormData] = useState<BookingPayload>(initialPayload);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"request" | "pay">("pay");
  const [calendlyTimeSelected, setCalendlyTimeSelected] = useState(false);
  const [calendlyData, setCalendlyData] = useState<{
    eventType: string;
    startTime: string;
    endTime: string;
    inviteeEmail: string;
    inviteeName: string;
  } | null>(null);
  const [bookingPrice, setBookingPrice] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<BookingPackage | null>(null);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [expandedPricingSection, setExpandedPricingSection] = useState<"basic" | "package" | "offers" | null>("package");
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [requestPrintsAlbums, setRequestPrintsAlbums] = useState(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [pendingBookingExpiresAt, setPendingBookingExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [livePackages, setLivePackages] = useState<BookingPackage[]>(BOOKING_PACKAGES);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string; type: 'percentage' | 'fixed'; value: number;
    discountAmount: number; finalPrice: number; finalDeposit: number;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const searchParams = useSearchParams();

  const selectedAddons: SelectedAddon[] = ADDONS.filter((a) => a.price != null && a.id !== "prints-albums")
    .map((a) => ({
      id: a.id,
      quantity: a.unit ? (addonQuantities[a.id] ?? 0) : (addonQuantities[a.id] ? 1 : 0),
    }))
    .filter((s) => (s.quantity ?? 0) > 0);
  const { total: addonsTotal, summary: addonsSummary } = computeAddonsTotal(selectedAddons);

  const displayPrice = appliedDiscount ? appliedDiscount.finalPrice : bookingPrice;
  const displayDeposit = appliedDiscount ? appliedDiscount.finalDeposit : depositAmount;
  const displayBalance = displayPrice != null && displayDeposit != null ? displayPrice - displayDeposit : balanceAmount;

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK || "";

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => { if (data.packages?.length) setLivePackages(data.packages); })
      .catch(() => {/* keep static fallback */});
  }, []);

  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg) {
      setFormData((prev) =>
        prev.notes
          ? prev
          : {
              ...prev,
              notes: `Interested in package: ${pkg}\n`,
            },
      );
    }
  }, [searchParams]);

  // Calculate pricing: total = package + add-ons; deposit on package only; balance = package balance + add-ons total
  useEffect(() => {
    if (paymentMode === "pay") {
      if (selectedPackage) {
        const isTimeBased = selectedPackage.priceFromTime && calendlyData?.startTime && calendlyData?.endTime;
        if (selectedPackage.priceFromTime && !isTimeBased) {
          setBookingPrice(null);
          setDepositAmount(null);
          setBalanceAmount(null);
        } else {
          const hours = isTimeBased
            ? calculateHours(
                calendlyData!.startTime,
                calendlyData!.endTime,
                selectedPackage.minimumHours
              )
            : selectedPackage.hours;
          const packagePrice = isTimeBased
            ? getPackagePriceForHours(selectedPackage, hours)
            : selectedPackage.price;
          const packageDeposit = getDepositForPackage(selectedPackage, packagePrice);
          const packageBalance = getBalanceForPackage(selectedPackage, packagePrice, packageDeposit);
          const totalPrice = packagePrice + addonsTotal;
          const balance = packageBalance + addonsTotal;
          setBookingPrice(totalPrice);
          setDepositAmount(packageDeposit);
          setBalanceAmount(balance);
        }
      } else if (calendlyData && calendlyData.startTime && calendlyData.endTime) {
        const hours = calculateHours(calendlyData.startTime, calendlyData.endTime);
        const totalPrice = calculatePrice(hours);
        const deposit = calculateDeposit(totalPrice);
        const balance = calculateBalance(totalPrice, deposit);
        setBookingPrice(totalPrice);
        setDepositAmount(deposit);
        setBalanceAmount(balance);
      } else {
        setBookingPrice(null);
        setDepositAmount(null);
        setBalanceAmount(null);
      }
    } else {
      setBookingPrice(null);
      setDepositAmount(null);
      setBalanceAmount(null);
      setSelectedPackage(null);
    }
  }, [selectedPackage, calendlyData, paymentMode, addonsTotal]);

  // Create pending booking when both package is selected AND Calendly event is scheduled (Pay & Book Now only)
  useEffect(() => {
    if (
      paymentMode === "pay" &&
      calendlyTimeSelected &&
      calendlyData &&
      selectedPackage &&
      bookingPrice &&
      depositAmount &&
      calendlyData.inviteeName &&
      calendlyData.inviteeEmail
    ) {
      // Check if we already have a pending booking
      if (!formData.pendingBookingId && formData.calendlyEventUri) {
        const createPendingBooking = async () => {
          try {
            const response = await fetch("/api/pending-bookings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
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
                depositAmount: depositAmount,
                addonsTotal: addonsTotal || 0,
                addonsSummary: addonsSummary || "",
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setFormData((prev) => ({
                ...prev,
                pendingBookingId: data.id,
              }));
              // Set expiration time (15 minutes from now)
              const expiresAt = new Date(data.expiresAt);
              setPendingBookingExpiresAt(expiresAt);
            }
          } catch (error) {
            console.error("Failed to create pending booking:", error);
          }
        };
        
        createPendingBooking();
      }
    }
  }, [paymentMode, calendlyTimeSelected, calendlyData, selectedPackage, bookingPrice, depositAmount, addonsTotal, addonsSummary, formData.calendlyEventUri, formData.pendingBookingId]);

  // Reset discount when package or add-ons change
  useEffect(() => {
    setAppliedDiscount(null);
    setDiscountError('');
  }, [selectedPackage, addonsTotal]);

  const handleApplyDiscount = async () => {
    if (!discountInput.trim() || !bookingPrice) return;
    setDiscountLoading(true);
    setDiscountError('');
    setAppliedDiscount(null);
    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountInput.trim(),
          packageId: selectedPackage?.id ?? 'global',
          basePrice: bookingPrice,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount(data);
      } else {
        setDiscountError(data.error ?? 'Invalid code');
      }
    } catch {
      setDiscountError('Unable to validate. Please try again.');
    } finally {
      setDiscountLoading(false);
    }
  };

  // Countdown timer for pending booking
  useEffect(() => {
    if (!pendingBookingExpiresAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = pendingBookingExpiresAt.getTime() - now.getTime();
      const secondsRemaining = Math.max(0, Math.floor(diff / 1000));
      setTimeRemaining(secondsRemaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [pendingBookingExpiresAt]);

  const handleCalendlyEvent = async (event: CalendlyEvent | any) => {
    try {
      if (event?.event !== "calendly.event_scheduled") {
        return;
      }

      const payload = event?.payload;

      // Calendly now sends only URIs in the payload, not full event data
      // We need to fetch the event details from the API
      if (!payload || !payload.event?.uri || !payload.invitee?.uri) {
        console.error("Unexpected Calendly event payload:", event);
        return;
      }

      const eventUri = payload.event.uri;
      const inviteeUri = payload.invitee.uri;

      // Fetch full event details from Calendly API
      try {
        const response = await fetch('/api/calendly-event-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventUri,
            inviteeUri,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData?.error || `Failed to fetch event details (${response.status})`;
          console.error('API error response:', errorData);
          throw new Error(errorMessage);
        }

        const eventData = await response.json();

        if (!eventData.start_time || !eventData.end_time || !eventData.invitee) {
          throw new Error('Incomplete event data received');
        }

        const startTime = new Date(eventData.start_time);
        const endTime = new Date(eventData.end_time);
        
        // Format date and time
        const dateStr = startTime.toISOString().split("T")[0];
        const startTimeStr = startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const endTimeStr = endTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        
        setCalendlyData({
          eventType: eventData.event_type || "",
          startTime: eventData.start_time,
          endTime: eventData.end_time,
          inviteeEmail: eventData.invitee.email,
          inviteeName: eventData.invitee.name,
        });
        
        // Pre-fill form with Calendly data
        setFormData((prev) => ({
          ...prev,
          name: eventData.invitee.name || prev.name,
          email: eventData.invitee.email || prev.email,
          date: dateStr,
          hours: `${startTimeStr} – ${endTimeStr}`,
          calendlyEventUri: eventUri,
          calendlyInviteeUri: inviteeUri,
        }));
        
        setCalendlyTimeSelected(true);
      } catch (error) {
        console.error('Error fetching Calendly event details:', error);
        // Still store the URIs so we can use them later
        setFormData((prev) => ({
          ...prev,
          calendlyEventUri: eventUri,
          calendlyInviteeUri: inviteeUri,
        }));
        setMessage('Time selected, but some details could not be loaded. Please fill in your name and email manually.');
        setStatus('error');
      }
    } catch (err) {
      console.error("Error handling Calendly event:", err, event);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (paymentMode === "pay") {
      // For payment mode, require package selection
      if (!selectedPackage) {
        setMessage("Please select a package first.");
        setStatus("error");
        return;
      }
      
      // Require Calendly time selection
      if (!calendlyTimeSelected || !calendlyData) {
        setMessage("Please select a time from the calendar above first.");
        setStatus("error");
        return;
      }
      
      if (!bookingPrice || !depositAmount) {
        setMessage("Unable to calculate pricing. Please select a package and time.");
        setStatus("error");
        return;
      }
    }
    
    if (paymentMode === "request" && !calendlyTimeSelected) {
      setMessage("Please select a time from the calendar above first.");
      setStatus("error");
      return;
    }
    
    // Ensure we have name and email from Calendly
    if (!formData.name || !formData.email) {
      setMessage("Please complete the Calendly form above to provide your name and email.");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    setMessage("");

    try {
      if (paymentMode === "pay") {
        // Use checkout flow for payment
        const notesWithAddons = requestPrintsAlbums
          ? (formData.notes || "").trim() + (formData.notes ? "\n\n" : "") + "Prints & albums requested."
          : formData.notes;
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            notes: notesWithAddons,
            startTime: calendlyData?.startTime,
            endTime: calendlyData?.endTime,
            totalPrice: bookingPrice,
            depositAmount: depositAmount,
            selectedPackage: selectedPackage?.id,
            packageTitle: selectedPackage?.title,
            addonsTotal: addonsTotal || 0,
            addonsSummary: addonsSummary || "",
            pendingBookingId: formData.pendingBookingId,
            calendlyEventUri: formData.calendlyEventUri,
            calendlyInviteeUri: formData.calendlyInviteeUri,
            discountCode: appliedDiscount?.code ?? '',
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Something went wrong");
        }

        const { url } = await response.json();
        if (url) {
          // Redirect to Stripe Checkout
          window.location.href = url;
        } else {
          throw new Error("No checkout URL received");
        }
      } else {
        // Use regular booking request flow
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Something went wrong");
        }

        setStatus("success");
        setMessage("Thanks! We'll confirm within 24 hours.");
        setFormData(initialPayload);
        setCalendlyTimeSelected(false);
        setCalendlyData(null);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send enquiry. Please email enquires@rtspaces.co.uk.",
      );
    }
  };

  const isSubmitting = status === "loading";

  return (
    <div className="space-y-8">
      {paymentMode === "pay" && (
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-plum)]">
          <span className="font-medium text-[var(--primary)]">1</span>
          <span>—</span>
          <span>2</span>
          <span>—</span>
          <span>3</span>
          <span>—</span>
          <span>4</span>
          <span>—</span>
          <span>5</span>
        </div>
      )}
      {/* Step 1: Booking Type Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
            Step 1: Choose Booking Type
          </h3>
          <p className="text-sm text-[var(--muted-plum)] mb-4">
            Select how you'd like to book your studio time.
          </p>
        </div>

        {/* Payment Mode Selection */}
        <div className="border-t border-[var(--primary)]/30 pt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`group flex items-start gap-4 p-5 border-2 cursor-pointer transition-all duration-300 ${
              paymentMode === "request" 
                ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                : "border-[var(--primary)]/40 hover:border-[var(--primary)]/70 bg-white"
            }`}>
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name="paymentMode"
                  value="request"
                  checked={paymentMode === "request"}
                  onChange={(e) => setPaymentMode(e.target.value as "request" | "pay")}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  paymentMode === "request"
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[var(--muted-plum)]/40 group-hover:border-[var(--primary)]/60"
                }`}>
                  {paymentMode === "request" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-base mb-1.5 transition-colors ${
                  paymentMode === "request" ? "text-[var(--primary)]" : "text-[var(--primary)]"
                }`}>
                  Request Booking
                </div>
                <div className="text-sm text-[var(--muted-plum)] leading-relaxed">
                  Free enquiry. We&apos;ll confirm availability within 24 hours.
                </div>
              </div>
            </label>
            <label className={`group flex items-start gap-4 p-5 border-2 cursor-pointer transition-all duration-300 ${
              paymentMode === "pay" 
                ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                : "border-[var(--primary)]/40 hover:border-[var(--primary)]/70 bg-white"
            }`}>
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name="paymentMode"
                  value="pay"
                  checked={paymentMode === "pay"}
                  onChange={(e) => setPaymentMode(e.target.value as "request" | "pay")}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  paymentMode === "pay"
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[var(--muted-plum)]/40 group-hover:border-[var(--primary)]/60"
                }`}>
                  {paymentMode === "pay" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-base mb-1.5 transition-colors ${
                  paymentMode === "pay" ? "text-[var(--primary)]" : "text-[var(--primary)]"
                }`}>
                  Pay & Book Now
                </div>
                <div className="text-sm text-[var(--muted-plum)] leading-relaxed">
                  Secure payment. Booking confirmed immediately after payment.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Step 2: Package Selection - Expandable accordion cards (Pay & Book Now only) */}
      {paymentMode === "pay" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
                Step 2: Choose Your Package
              </h3>
              <p className="text-sm text-[var(--muted-plum)]">
                Expand Basic, Package, or Offers to see options; then expand a session for details and select.
              </p>
            </div>
            <Link 
              href="/services#packages" 
              className="text-sm text-[var(--primary)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors whitespace-nowrap ml-4"
            >
              See Full Pricing →
            </Link>
          </div>
          
          <div className="space-y-2 pt-4" role="list">
            {buildSections(livePackages).map((sec) => {
              const sectionExpanded = expandedPricingSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className="border-2 border-[var(--accent)]/20 bg-white overflow-hidden transition-all duration-300 hover:border-[var(--primary)]/50"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedPricingSection(sectionExpanded ? null : sec.id)}
                    aria-expanded={sectionExpanded}
                    aria-controls={`booking-section-${sec.id}`}
                    id={`booking-section-header-${sec.id}`}
                    className="w-full flex items-center gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="font-heading text-[var(--primary)] font-semibold block">
                        {sec.label}
                      </span>
                      <span className="text-sm text-[var(--muted-plum)]">
                        {sec.description}
                      </span>
                    </span>
                    <span
                      className={`flex-shrink-0 transition-transform duration-200 ${sectionExpanded ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <svg className="h-5 w-5 text-[var(--muted-plum)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={`booking-section-${sec.id}`}
                    role="region"
                    aria-labelledby={`booking-section-header-${sec.id}`}
                    className={`grid transition-all duration-300 ease-out ${sectionExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-[var(--accent)]/20 p-3 space-y-2">
                        {sec.packages.map((pkg) => {
                          const isExpanded = expandedPackageId === pkg.id;
                          const isSelected = selectedPackage?.id === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              className={`relative border-2 transition-all duration-300 ${
                                isSelected
                                  ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md ring-2 ring-[var(--primary)]"
                                  : "border-[var(--accent)]/20 bg-white hover:border-[var(--primary)]/50"
                              } ${pkg.limitedOffer && !isSelected ? "ring-2 ring-[var(--primary)]/20" : ""}`}
                            >
                              {pkg.limitedOffer && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                  <span className="bg-[var(--primary)] text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                                    Limited offer
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`package-details-${pkg.id}`}
                                id={`package-header-${pkg.id}`}
                                className="w-full flex items-center gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                              >
                                <span className="flex-1 min-w-0">
                                  <span className="font-heading text-[var(--primary)] font-medium block truncate">
                                    {pkg.title}
                                  </span>
                                  <span className="text-sm text-[var(--muted-plum)]">
                                    {pkg.duration}
                                  </span>
                                </span>
                                <span className="text-lg font-semibold text-[var(--primary)] whitespace-nowrap">
                                  £{pkg.price}
                                </span>
                                <span
                                  className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  aria-hidden
                                >
                                  <svg className="h-5 w-5 text-[var(--muted-plum)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </span>
                                {isSelected && (
                                  <span className="flex-shrink-0 text-sm font-semibold text-[var(--primary)]">✓ Selected</span>
                                )}
                              </button>
                              <div
                                id={`package-details-${pkg.id}`}
                                role="region"
                                aria-labelledby={`package-header-${pkg.id}`}
                                className={`grid transition-all duration-300 ease-out ${
                                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <div className="border-t border-[var(--accent)]/20 p-4 pt-4 bg-white/50">
                                    <ul className="space-y-2 mb-4 text-sm text-[var(--muted-plum)]">
                                      {pkg.includes.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <svg
                                            className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    {pkg.bestFor && (
                                      <p className="text-sm text-[var(--muted-plum)] mb-2">
                                        <span className="font-medium text-[var(--primary)]">Best for:</span> {pkg.bestFor}
                                      </p>
                                    )}
                                    {pkg.availabilityNote && (
                                      <p className="text-xs text-[var(--muted-plum)] mb-4">{pkg.availabilityNote}</p>
                                    )}
                                    {pkg.depositAmount != null && pkg.balanceOnDay != null && (
                                      <p className="text-xs text-[var(--muted-plum)] mb-4">
                                        £{pkg.depositAmount} non-refundable deposit to book. Remaining £{pkg.balanceOnDay} paid on the day.
                                      </p>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPackage(pkg);
                                        setExpandedPackageId(null);
                                      }}
                                      className={`w-full sm:w-auto px-4 py-2 font-medium transition-colors ${
                                        isSelected
                                          ? "bg-[var(--primary)]/20 text-[var(--primary)] cursor-default"
                                          : "bg-[var(--primary)] text-white hover:opacity-90"
                                      }`}
                                    >
                                      {isSelected ? "✓ Selected" : "Select this package"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Add-ons - Pay & Book Now only */}
      {paymentMode === "pay" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
              Step 3: Add-ons
            </h3>
            <p className="text-sm text-[var(--muted-plum)]">
              Add extra images, time, or people. Add-ons are paid with your balance on the day.
            </p>
          </div>
          <div className="border-2 border-[var(--accent)]/20 bg-white p-6 space-y-6">
            {ADDONS.filter((a) => a.id !== "prints-albums").map((addon) => (
              <div key={addon.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--accent)]/10 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-[var(--primary)]">{addon.label}</p>
                  {addon.price != null && (
                    <p className="text-sm text-[var(--muted-plum)]">
                      {addon.unit === "person" ? `£${addon.price} per person` : addon.unit === "image" ? `£${addon.price} each` : addon.unit === "hour" ? `£${addon.price} per hour` : `£${addon.price}`}
                    </p>
                  )}
                </div>
                {addon.unit ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddonQuantities((q) => ({ ...q, [addon.id]: Math.max(0, (q[addon.id] ?? 0) - 1) }))}
                      className="w-8 h-8 border border-[var(--accent)]/40 text-[var(--primary)] font-medium hover:bg-[var(--accent)]/10"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-[var(--primary)]">{addonQuantities[addon.id] ?? 0}</span>
                    <button
                      type="button"
                      onClick={() => setAddonQuantities((q) => ({ ...q, [addon.id]: (q[addon.id] ?? 0) + 1 }))}
                      className="w-8 h-8 border border-[var(--accent)]/40 text-[var(--primary)] font-medium hover:bg-[var(--accent)]/10"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!addonQuantities[addon.id]}
                      onChange={(e) => setAddonQuantities((q) => ({ ...q, [addon.id]: e.target.checked ? 1 : 0 }))}
                      className="border-[var(--accent)]/40 text-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--muted-plum)]">Add</span>
                  </label>
                )}
              </div>
            ))}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requestPrintsAlbums}
                  onChange={(e) => setRequestPrintsAlbums(e.target.checked)}
                  className="border-[var(--accent)]/40 text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--muted-plum)]">I&apos;d like to enquire about prints & albums</span>
              </label>
            </div>
            {addonsTotal > 0 && (
              <p className="text-sm font-semibold text-[var(--primary)] pt-2 border-t border-[var(--accent)]/20">
                Add-ons total: £{addonsTotal}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 4/2: Select Time via Calendly - Show for both booking types */}
      {calendlyUrl && (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
              {paymentMode === "pay" ? "Step 4: Select Your Preferred Time" : "Step 2: Select Your Preferred Time"}
            </h3>
            <p className="text-sm text-[var(--muted-plum)] mb-4">
              {paymentMode === "request" 
                ? "Choose an available time slot from the calendar below. After selecting a time, you'll complete your booking details."
                : "Choose an available time slot from the calendar below. After selecting a time, you'll complete your details and proceed to payment."
              }
            </p>
          </div>
          <div className="border-2 border-[var(--primary)]/40 bg-white overflow-hidden">
            <CalendlyWidget 
              url={calendlyUrl} 
              onEventScheduled={handleCalendlyEvent}
            />
          </div>
          <p className="text-xs text-[var(--muted-plum)]">
            If the calendar shows as unavailable, the calendar owner can{" "}
            <a href="https://calendly.com/login" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--primary)]">log in to Calendly</a>{" "}
            to turn availability back on and set open hours.
          </p>
          {calendlyTimeSelected && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4">
                <p className="text-sm font-medium">
                  ✓ Time selected! {paymentMode === "request" ? "Please complete your details below." : "Please complete your details below to proceed with payment."}
                </p>
              </div>
              {paymentMode === "pay" && timeRemaining !== null && timeRemaining > 0 && (
                <div className={`border-2 p-4 ${
                  timeRemaining < 300 
                    ? "bg-red-50 border-red-300 text-red-800" 
                    : "bg-yellow-50 border-yellow-300 text-yellow-800"
                }`}>
                  <p className="text-sm font-semibold mb-1">
                    ⏰ Payment Window: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining
                  </p>
                  <p className="text-xs">
                    {timeRemaining < 300 
                      ? "⚠️ Complete payment within the next few minutes or your booking will be automatically cancelled."
                      : "Please complete payment within 15 minutes to secure your booking time."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking Form Section */}
      <div className={`transition-all duration-300 ${
        calendlyTimeSelected ? "opacity-100" : "opacity-50 pointer-events-none"
      }`}>
        <div className="mb-6">
          <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
            {paymentMode === "request" ? "Step 3: Review & Submit" : "Step 5: Review & Proceed to Payment"}
          </h3>
          <p className="text-sm text-[var(--muted-plum)]">
            {paymentMode === "pay" 
              ? "Review your selected package and pricing below, then proceed to payment."
              : "Review your booking details below and submit your request."
            }
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 sm:space-y-7"
        >

      {/* Booking Details Summary */}
      {calendlyTimeSelected && calendlyData && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-3">
            Booking Details
          </p>
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-plum)] mb-1">
                Name
              </p>
              <p className="text-base font-semibold text-[var(--primary)]">
                {calendlyData.inviteeName || formData.name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-plum)] mb-1">
                Email
              </p>
              <p className="text-base text-[var(--primary)]">
                {calendlyData.inviteeEmail || formData.email}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-plum)] mb-1">
                Selected Time
              </p>
              <p className="text-base font-semibold text-[var(--primary)]">
                {new Date(calendlyData.startTime).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-[var(--muted-plum)]">
                {new Date(calendlyData.startTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} – {new Date(calendlyData.endTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Package Display */}
      {paymentMode === "pay" && selectedPackage && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
            Selected Package
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--primary)]">{selectedPackage.title}</span>
              <span className="text-base font-semibold text-[var(--primary)]">
                £{bookingPrice != null && selectedPackage.priceFromTime ? (bookingPrice - addonsTotal).toFixed(2) : selectedPackage.price}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-plum)]">{selectedPackage.duration}</p>
          </div>
        </div>
      )}

      {/* Discount Code Input */}
      {paymentMode === "pay" && bookingPrice != null && selectedPackage && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">Discount Code</p>
          {appliedDiscount ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-700 font-medium">
                ✓ {appliedDiscount.code} — saving £{appliedDiscount.discountAmount.toFixed(2)}
                {appliedDiscount.type === 'percentage' ? ` (${appliedDiscount.value}% off)` : ' off'}
              </p>
              <button
                type="button"
                onClick={() => { setAppliedDiscount(null); setDiscountInput(''); }}
                className="text-xs text-[var(--muted-plum)] underline hover:text-[var(--primary)]"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyDiscount())}
                  placeholder="Enter code"
                  className="flex-1 border border-[var(--primary)]/40 bg-white px-3 py-2 text-sm text-[var(--primary)] placeholder:text-[var(--muted-plum)]/50 outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountInput.trim()}
                  className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {discountLoading ? '…' : 'Apply'}
                </button>
              </div>
              {discountError && (
                <p className="text-xs text-red-600">{discountError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pricing Display */}
      {paymentMode === "pay" && displayPrice != null && displayDeposit != null && displayBalance != null && selectedPackage && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
            Payment Summary
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted-plum)]">{selectedPackage.title}:</span>
              <span className="text-base font-semibold text-[var(--primary)]">£{selectedPackage.priceFromTime ? (bookingPrice! - addonsTotal).toFixed(2) : selectedPackage.price}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-plum)]">Add-ons:</span>
                <span className="text-base font-semibold text-[var(--primary)]">£{addonsTotal}</span>
              </div>
            )}
            {appliedDiscount && (
              <div className="flex justify-between items-center text-emerald-700">
                <span className="text-sm">Discount ({appliedDiscount.code}):</span>
                <span className="text-base font-semibold">-£{appliedDiscount.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-[var(--accent)]/20">
              <span className="text-sm font-medium text-[var(--muted-plum)]">Total:</span>
              <span className="text-lg font-semibold text-[var(--primary)]">£{displayPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted-plum)]">
                {selectedPackage.depositAmount != null ? "Deposit:" : "Deposit (50%):"}
              </span>
              <span className="text-base font-semibold text-[var(--primary)]">£{displayDeposit.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--accent)]/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--muted-plum)]">Balance due on the day:</span>
                <span className="text-sm text-[var(--muted-plum)]">
                  £{displayBalance.toFixed(2)}
                  {addonsTotal > 0 ? " (includes add-ons)" : selectedPackage.balanceOnDay != null ? " (on the day of your session)" : " (48h before booking)"}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-plum)] pt-2">
              * You'll pay the deposit now. The remaining balance is due on the day of your session{addonsTotal > 0 ? " (includes add-ons)" : selectedPackage.balanceOnDay != null ? "" : " (48 hours before your booking)"}.
            </p>
          </div>
        </div>
      )}

      {/* Studio Policies – link to full page, checkbox required before payment / submit */}
      {calendlyTimeSelected && (
        <div className="border-2 border-[var(--accent)]/20 bg-white p-4 space-y-4">
          <p className="text-sm text-[var(--muted-plum)]">
            Before proceeding, please read our studio policies.
          </p>
          <Link
            href="/policies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            View Studio Policies &amp; Important Information
          </Link>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToPolicies}
              onChange={(e) => setAgreedToPolicies(e.target.checked)}
              className="mt-1 border-[var(--accent)]/40 text-[var(--primary)]"
              required
            />
            <span className="text-sm text-[var(--primary)] group-has-[:checked]:font-medium">
              I have read and agree to the Studio Policies &amp; Important Information.
            </span>
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !calendlyTimeSelected || !agreedToPolicies || (paymentMode === "pay" && (!selectedPackage || !bookingPrice))}
        className="btn-primary btn-full relative overflow-hidden group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {paymentMode === "pay" ? "Processing..." : "Sending..."}
            </>
          ) : (
            <>
              {paymentMode === "pay" 
                ? (selectedPackage && displayPrice ? `Proceed to Payment (£${displayDeposit?.toFixed(2)})` : "Select Package & Time First")
                : "Send enquiry"
              }
              {paymentMode === "pay" && bookingPrice && (
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </>
          )}
        </span>
      </button>

      {message && (
        <div className={`p-4 border ${
          status === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
      )}

      <p className="text-sm text-[var(--muted-plum)] leading-relaxed pt-2">
        We respond within 24 hours. For last-minute bookings, DM{" "}
        <a
          href="https://www.instagram.com/rtspaces/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors underline underline-offset-2"
        >
          @rtspaces
        </a>
        .
      </p>
    </form>
      </div>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function Field({ label, ...props }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--muted-plum)]">
        {label}
        {props.required && <span className="text-[var(--primary)] ml-1">*</span>}
      </label>
      <input
        {...props}
        className="w-full border-2 border-[var(--primary)]/40 bg-white px-4 py-3.5 text-base text-[var(--primary)] placeholder:text-[var(--muted-plum)]/50 outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white"
        style={{ fontSize: '16px' }}
      />
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

function Textarea({ label, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--muted-plum)]">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full border-2 border-[var(--primary)]/40 bg-white px-4 py-3.5 text-base text-[var(--primary)] placeholder:text-[var(--muted-plum)]/50 outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white resize-y"
        style={{ fontSize: '16px' }}
      />
    </div>
  );
}

