import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Sparkles } from "lucide-react";
import { useShop } from "@/lib/use-shop";

export function LoginPopup() {
  const navigate = useNavigate();
  const { loginOpen, setLoginOpen, authRedirectTo, sendOtp, verifyOtp, user } = useShop();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && loginOpen) {
      setLoginOpen(false);
      navigate({ to: authRedirectTo as never });
    }
  }, [authRedirectTo, loginOpen, navigate, setLoginOpen, user]);

  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setError("");
  }, [mode]);

  if (!loginOpen) return null;

  const close = () => {
    setError("");
    setOtpSent(false);
    setOtp("");
    setLoginOpen(false);
  };

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

    close();
    navigate({ to: authRedirectTo as never });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={close} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/40 bg-card p-6 shadow-[var(--shadow-elegant)] md:p-8">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.14_85)] to-transparent" />

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-3xl">
            Welcome to <span className="text-gold">MEYU</span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to unlock personalized luxury picks.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-full border border-border bg-background/50 p-1">
          <button
            onClick={() => setMode("login")}
            className={`rounded-full py-2 text-xs uppercase tracking-[0.25em] ${mode === "login" ? "bg-gold text-primary-foreground" : "text-foreground/70"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full py-2 text-xs uppercase tracking-[0.25em] ${mode === "signup" ? "bg-gold text-primary-foreground" : "text-foreground/70"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && <Field label="Full Name" value={fullName} onChange={setFullName} />}
          <Field label="Email Or Phone" value={identifier} onChange={setIdentifier} />
          {mode === "signup" && <Field label="Phone" value={phone} onChange={setPhone} />}
          {otpSent && <Field label="OTP" value={otp} onChange={setOtp} />}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-gold py-3 text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground hover:glow-gold disabled:opacity-60"
            >
              {submitting ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-full border border-border py-3 text-xs uppercase tracking-[0.25em] text-foreground/80 hover:border-gold hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
      />
    </div>
  );
}
