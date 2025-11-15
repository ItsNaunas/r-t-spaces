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
      setMessage("Thanks! We’ll confirm within 24 hours.");
      setFormData(initialPayload);
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
      className="space-y-4 rounded-[32px] border border-zinc-200 p-6"
    >
      <Field
        label="Name"
        name="name"
        type="text"
        placeholder="Rose and Teddy"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@email.com"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Preferred date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
        <Field
          label="Hours needed"
          name="hours"
          type="text"
          placeholder="e.g. 8 AM – 2 PM"
          value={formData.hours}
          onChange={handleChange}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full border border-black bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:border-black/50 disabled:bg-black/50 disabled:text-white"
      >
        {isSubmitting ? "Sending..." : "Send enquiry"}
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

      <p className="text-xs text-zinc-500">
        We respond within 24 hours. For last-minute bookings, DM{" "}
        <a
          href="https://www.instagram.com/randtspace"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-black"
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
      <label className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-black outline-none transition focus:border-black"
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
      <label className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500">
        {label}
      </label>
      <textarea
        {...props}
        className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-black outline-none transition focus:border-black"
      />
    </div>
  );
}

