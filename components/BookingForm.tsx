 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type BookingPayload = {
  name: string;
  email: string;
  date: string;
  hours: string;
  notes: string;
};

const initialPayload: BookingPayload = {
  name: "",
  email: "",
  date: "",
  hours: "",
  notes: "",
};

export function BookingForm() {
  const [formData, setFormData] = useState<BookingPayload>(initialPayload);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"request" | "pay">("request");
  const searchParams = useSearchParams();

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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          body: JSON.stringify(formData),
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4  border border-[var(--accent)]/20 p-6"
    >
      <div className="transition-all duration-300">
        <Field
          label="Name"
          name="name"
          type="text"
          placeholder="Rose and Teddy"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
          inputMode="text"
          required
        />
      </div>
      <div className="transition-all duration-300">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@email.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Preferred date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          autoComplete="off"
          inputMode="none"
        />
        <Field
          label="Hours needed"
          name="hours"
          type="text"
          placeholder="e.g. 8 AM – 2 PM"
          value={formData.hours}
          onChange={handleChange}
          inputMode="text"
        />
      </div>

      <Textarea
        label="Shot list / Notes"
        name="notes"
        placeholder="Let us know what you plan to shoot, kit required, and any crew support needed."
        value={formData.notes}
        onChange={handleChange}
        rows={5}
      />

      {/* Payment Mode Selection */}
      <div className="border-t border-[var(--accent)]/20 pt-4 space-y-4">
        <label className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--accent)]/60">
          Booking Type
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 p-4 border border-[var(--accent)]/20 cursor-pointer hover:border-[var(--primary)] transition-colors">
            <input
              type="radio"
              name="paymentMode"
              value="request"
              checked={paymentMode === "request"}
              onChange={(e) => setPaymentMode(e.target.value as "request" | "pay")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold text-[var(--accent)]">Request Booking</div>
              <div className="text-xs text-[var(--accent)]/60 mt-1">
                Free enquiry. We&apos;ll confirm availability within 24 hours.
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border border-[var(--accent)]/20 cursor-pointer hover:border-[var(--primary)] transition-colors">
            <input
              type="radio"
              name="paymentMode"
              value="pay"
              checked={paymentMode === "pay"}
              onChange={(e) => setPaymentMode(e.target.value as "request" | "pay")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold text-[var(--accent)]">Pay & Book Now</div>
              <div className="text-xs text-[var(--accent)]/60 mt-1">
                Secure payment. Auto-confirmed and added to calendar.
              </div>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary btn-full relative overflow-hidden group"
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
              {paymentMode === "pay" ? "Pay & Book Now" : "Send enquiry"}
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </span>
      </button>

      {message && (
        <p
          className={`text-xs ${
            status === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <p className="text-xs text-[var(--accent)]/60">
        We respond within 24 hours. For last-minute bookings, DM{" "}
        <a
          href="https://www.instagram.com/randtspace"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--primary)]"
        >
          @randtspace
        </a>
        .
      </p>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function Field({ label, ...props }: FieldProps) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--accent)]/60">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full border border-[var(--accent)]/20 px-4 py-3 text-base text-[var(--accent)] outline-none transition focus:border-[var(--primary)]"
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
    <div>
      <label className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--accent)]/60">
        {label}
      </label>
      <textarea
        {...props}
        className="mt-2 w-full border border-[var(--accent)]/20 px-4 py-3 text-base text-[var(--accent)] outline-none transition focus:border-[var(--primary)]"
        style={{ fontSize: '16px' }}
      />
    </div>
  );
}

