import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { useShop } from "@/lib/use-shop";

type AuthSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, authReady, setAuthRedirectTo, sendOtp, verifyOtp } = useShop();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAuthRedirectTo(redirect ?? "/account");
  }, [redirect, setAuthRedirectTo]);

  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setError("");
  }, [mode]);

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      navigate({ to: redirect ?? "/account" });
    }
  }, [authReady, navigate, redirect, user]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = otpSent
      ? await verifyOtp({
          identifier,
          otp,
          name: mode === "signup" ? fullName : undefined,
          phone: mode === "signup" ? phone : undefined,
        })
      : await sendOtp({
          identifier,
          name: mode === "signup" ? fullName : undefined,
          phone: mode === "signup" ? phone : undefined,
          mode,
        });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Unable to continue.");
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      return;
    }

    navigate({ to: redirect ?? "/account" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--gold)]/20 bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
          <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
            Secure Access
          </div>
          <h1 className="mt-3 font-display text-4xl text-white">
            {mode === "login" ? "Login to continue" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {mode === "login"
              ? "Access your cart, checkout, and saved customizations."
              : "Register once to keep your cart, orders, and custom designs synced."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-[var(--gold)]/20 bg-black/20 p-1">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] ${
                mode === "login" ? "bg-[var(--gold)] text-black" : "text-white/65"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] ${
                mode === "signup" ? "bg-[var(--gold)] text-black" : "text-white/65"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
              />
            )}
            <Field
              label="Email Or Phone"
              value={identifier}
              onChange={setIdentifier}
              autoComplete="username"
            />
            {mode === "signup" && (
              <Field label="Phone" value={phone} onChange={setPhone} autoComplete="tel" />
            )}
            {otpSent && (
              <Field label="OTP" value={otp} onChange={setOtp} autoComplete="one-time-code" />
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[var(--gold)] py-3 text-xs font-medium uppercase tracking-[0.3em] text-black disabled:opacity-60"
            >
              {submitting ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-[var(--gold)]/20 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--gold)]/70"
      />
    </label>
  );
}
