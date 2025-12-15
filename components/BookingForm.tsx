 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendlyWidget } from "./CalendlyWidget";
import { calculateHours, calculatePrice, calculateDeposit, calculateBalance, BOOKING_PACKAGES, type BookingPackage } from "@/lib/pricing";

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
  const [pendingBookingExpiresAt, setPendingBookingExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const searchParams = useSearchParams();
  
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK || "";

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

  // Calculate pricing when package or Calendly time changes
  useEffect(() => {
    if (paymentMode === "pay") {
      if (selectedPackage) {
        // Use package price
        const totalPrice = selectedPackage.price;
        const deposit = calculateDeposit(totalPrice);
        const balance = calculateBalance(totalPrice, deposit);
        
        setBookingPrice(totalPrice);
        setDepositAmount(deposit);
        setBalanceAmount(balance);
      } else if (calendlyData && calendlyData.startTime && calendlyData.endTime) {
        // Calculate from Calendly times (fallback if no package selected)
        const hours = calculateHours(calendlyData.startTime, calendlyData.endTime);
        const totalPrice = calculatePrice(hours);
        const deposit = calculateDeposit(totalPrice);
        const balance = calculateBalance(totalPrice, deposit);
        
        setBookingPrice(totalPrice);
        setDepositAmount(deposit);
        setBalanceAmount(balance);
      } else {
        // Reset if no package or time
        setBookingPrice(null);
        setDepositAmount(null);
        setBalanceAmount(null);
      }
    } else {
      // Reset for request mode
      setBookingPrice(null);
      setDepositAmount(null);
      setBalanceAmount(null);
      setSelectedPackage(null);
    }
  }, [selectedPackage, calendlyData, paymentMode]);

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
  }, [paymentMode, calendlyTimeSelected, calendlyData, selectedPackage, bookingPrice, depositAmount, formData.calendlyEventUri, formData.pendingBookingId]);

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
          throw new Error('Failed to fetch event details');
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
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            startTime: calendlyData?.startTime,
            endTime: calendlyData?.endTime,
            totalPrice: bookingPrice,
            depositAmount: depositAmount,
            selectedPackage: selectedPackage?.id,
            packageTitle: selectedPackage?.title,
            pendingBookingId: formData.pendingBookingId,
            calendlyEventUri: formData.calendlyEventUri,
            calendlyInviteeUri: formData.calendlyInviteeUri,
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
          : "Unable to send enquiry. Please email Teddy77723@gmail.com.",
      );
    }
  };

  const isSubmitting = status === "loading";

  return (
    <div className="space-y-8">
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

      {/* Step 2: Package Selection - Only for Pay & Book Now */}
      {paymentMode === "pay" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
                Step 2: Choose Your Package
              </h3>
              <p className="text-sm text-[var(--muted-plum)]">
                Select the package that best fits your needs. All packages include equipment and studio access.
              </p>
            </div>
            <Link 
              href="/services#packages" 
              className="text-sm text-[var(--primary)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors whitespace-nowrap ml-4"
            >
              See Full Pricing →
            </Link>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {BOOKING_PACKAGES.map((pkg) => (
              <label
                key={pkg.id}
                className={`relative flex flex-col border-2 cursor-pointer transition-all duration-300 ${
                  selectedPackage?.id === pkg.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                    : "border-[var(--accent)]/20 hover:border-[var(--primary)]/50 bg-white"
                } ${pkg.popular ? "ring-2 ring-[var(--primary)]/20" : ""}`}
              >
                <input
                  type="radio"
                  name="bookingPackage"
                  value={pkg.id}
                  checked={selectedPackage?.id === pkg.id}
                  onChange={() => setSelectedPackage(pkg)}
                  className="sr-only"
                />
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[var(--primary)] text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                )}
                <div className="p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-plum)] mb-2">
                      {pkg.duration}
                    </p>
                    <h4 className="font-heading text-lg text-[var(--primary)] mb-3">
                      {pkg.title}
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-[var(--primary)]">
                        £{pkg.price}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 flex-grow text-sm text-[var(--muted-plum)]">
                    {pkg.includes.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg
                          className="h-4 w-4 text-[var(--primary)] mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`mt-auto pt-3 border-t border-[var(--accent)]/20 text-center ${
                    selectedPackage?.id === pkg.id ? "text-[var(--primary)] font-semibold" : "text-[var(--muted-plum)]"
                  }`}>
                    {selectedPackage?.id === pkg.id ? "✓ Selected" : "Select"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 2/3: Select Time via Calendly - Show for both booking types */}
      {calendlyUrl && (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-xl text-[var(--primary)] mb-2">
              {paymentMode === "pay" ? "Step 3: Select Your Preferred Time" : "Step 2: Select Your Preferred Time"}
            </h3>
            <p className="text-sm text-[var(--muted-plum)] mb-4">
              {paymentMode === "request" 
                ? "Choose an available time slot from the calendar below. After selecting a time, you'll complete your booking details."
                : "Choose an available time slot from the calendar below. After selecting a time, you'll complete your details and proceed to payment."
              }
            </p>
          </div>
          <div className="border-2 border-[var(--primary)]/40 bg-white rounded-sm overflow-hidden">
            <CalendlyWidget 
              url={calendlyUrl} 
              onEventScheduled={handleCalendlyEvent}
            />
          </div>
          {calendlyTimeSelected && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-sm">
                <p className="text-sm font-medium">
                  ✓ Time selected! {paymentMode === "request" ? "Please complete your details below." : "Please complete your details below to proceed with payment."}
                </p>
              </div>
              {paymentMode === "pay" && timeRemaining !== null && timeRemaining > 0 && (
                <div className={`border-2 p-4 rounded-sm ${
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
            {paymentMode === "request" ? "Step 3: Review & Submit" : "Step 4: Review & Proceed to Payment"}
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
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-sm space-y-3">
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
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-sm space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
            Selected Package
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[var(--primary)]">{selectedPackage.title}</span>
              <span className="text-base font-semibold text-[var(--primary)]">£{selectedPackage.price}</span>
            </div>
            <p className="text-xs text-[var(--muted-plum)]">{selectedPackage.duration}</p>
          </div>
        </div>
      )}

      {/* Pricing Display */}
      {paymentMode === "pay" && bookingPrice && depositAmount && balanceAmount && (
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-sm space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
            Payment Summary
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted-plum)]">Total Price:</span>
              <span className="text-lg font-semibold text-[var(--primary)]">£{bookingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted-plum)]">Deposit (50%):</span>
              <span className="text-base font-semibold text-[var(--primary)]">£{depositAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--accent)]/20">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--muted-plum)]">Balance Due:</span>
                <span className="text-sm text-[var(--muted-plum)]">£{balanceAmount.toFixed(2)} (48h before booking)</span>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-plum)] pt-2">
              * You'll pay the deposit now. The remaining balance will be due 48 hours before your booking.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !calendlyTimeSelected || (paymentMode === "pay" && (!selectedPackage || !bookingPrice))}
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
                ? (selectedPackage && bookingPrice ? `Proceed to Payment (£${depositAmount?.toFixed(2)})` : "Select Package & Time First")
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
        <div className={`p-4 rounded-sm border ${
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
          href="https://www.instagram.com/randtspace"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors underline underline-offset-2"
        >
          @randtspace
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

