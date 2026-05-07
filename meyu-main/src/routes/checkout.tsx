import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { type AddressForm, type PaymentMethod } from "@/lib/shop-context-store";
import { useShop } from "@/lib/use-shop";

type CheckoutSearch = {
  step?: "cart" | "address" | "payment" | "summary";
};

const checkoutSteps = ["cart", "address", "payment", "summary"] as const;

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    step:
      search.step === "cart" ||
      search.step === "address" ||
      search.step === "payment" ||
      search.step === "summary"
        ? search.step
        : undefined,
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { step } = Route.useSearch();
  const {
    authReady,
    user,
    cart,
    checkoutDraft,
    beginCheckoutFromCart,
    updateCheckoutDraft,
    placeOrder,
  } = useShop();
  const [placing, setPlacing] = useState(false);
  const currentStep = step ?? checkoutDraft.step ?? "cart";

  useEffect(() => {
    if (authReady && !user) {
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
    }
  }, [authReady, navigate, user]);

  useEffect(() => {
    if (checkoutDraft.items.length === 0 && cart.length > 0) {
      beginCheckoutFromCart();
    }
  }, [beginCheckoutFromCart, cart.length, checkoutDraft.items.length]);

  const total = useMemo(
    () => checkoutDraft.items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [checkoutDraft.items],
  );

  const setStep = (nextStep: CheckoutSearch["step"]) => {
    if (!nextStep) return;
    updateCheckoutDraft({ step: nextStep });
    navigate({ to: "/checkout", search: { step: nextStep } });
  };

  const submitOrder = async () => {
    setPlacing(true);
    const result = await placeOrder();
    setPlacing(false);
    if (result.ok) {
      setStep("summary");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">Checkout</div>
          <h1 className="mt-3 font-display text-4xl text-white">Complete your order</h1>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-4">
          {checkoutSteps.map((item, index) => (
            <button
              key={item}
              onClick={() => setStep(item)}
              className={`rounded-2xl border px-4 py-3 text-left ${
                currentStep === item
                  ? "border-[var(--gold)]/60 bg-[var(--gold)]/10"
                  : "border-white/10 bg-card"
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
                Step {index + 1}
              </div>
              <div className="mt-1 text-sm capitalize text-white">
                {item === "summary" ? "Order Summary" : item}
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            {currentStep === "cart" && (
              <div className="space-y-4">
                {checkoutDraft.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-black/15 p-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-28 w-24 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                        {item.product.brand}
                      </div>
                      <div className="mt-1 truncate text-white">{item.product.name}</div>
                      <div className="mt-2 text-sm text-white/60">Qty: {item.qty}</div>
                      {item.customization && (
                        <div className="mt-2 text-xs text-[var(--gold)]">
                          {item.customization.name}
                        </div>
                      )}
                    </div>
                    <div className="text-[var(--gold)]">
                      ₹{(item.product.price * item.qty).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setStep("address")}
                  className="rounded-full bg-[var(--gold)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-black"
                >
                  Continue to Address
                </button>
              </div>
            )}

            {currentStep === "address" && (
              <AddressStep
                value={checkoutDraft.address}
                onChange={(address) => updateCheckoutDraft({ address })}
                onContinue={() => setStep("payment")}
              />
            )}

            {currentStep === "payment" && (
              <PaymentStep
                value={checkoutDraft.paymentMethod}
                onChange={(paymentMethod) => updateCheckoutDraft({ paymentMethod })}
                onContinue={() => setStep("summary")}
              />
            )}

            {currentStep === "summary" && (
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
                    Address
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {checkoutDraft.address.fullName || "Name pending"}
                    <br />
                    {checkoutDraft.address.line1 || "Address pending"}
                    {checkoutDraft.address.line2 ? (
                      <>
                        <br />
                        {checkoutDraft.address.line2}
                      </>
                    ) : null}
                    <br />
                    {[
                      checkoutDraft.address.city,
                      checkoutDraft.address.state,
                      checkoutDraft.address.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
                    Payment
                  </div>
                  <div className="mt-2 text-sm capitalize text-white/70">
                    {checkoutDraft.paymentMethod}
                  </div>
                </div>
                <button
                  onClick={() => void submitOrder()}
                  disabled={placing}
                  className="rounded-full bg-[var(--gold)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-black disabled:opacity-60"
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              Order Summary
            </div>
            <div className="mt-6 space-y-4">
              {checkoutDraft.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 text-sm text-white/70"
                >
                  <span className="min-w-0 truncate">
                    {item.product.name} x {item.qty}
                  </span>
                  <span>₹{(item.product.price * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-display text-3xl text-[var(--gold)]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}

function AddressStep({
  value,
  onChange,
  onContinue,
}: {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  onContinue: () => void;
}) {
  const patch = (key: keyof AddressForm, nextValue: string) =>
    onChange({ ...value, [key]: nextValue });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <CheckoutField
          label="Full Name"
          value={value.fullName}
          onChange={(v) => patch("fullName", v)}
        />
        <CheckoutField label="Phone" value={value.phone} onChange={(v) => patch("phone", v)} />
      </div>
      <CheckoutField
        label="Address Line 1"
        value={value.line1}
        onChange={(v) => patch("line1", v)}
      />
      <CheckoutField
        label="Address Line 2"
        value={value.line2}
        onChange={(v) => patch("line2", v)}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <CheckoutField label="City" value={value.city} onChange={(v) => patch("city", v)} />
        <CheckoutField label="State" value={value.state} onChange={(v) => patch("state", v)} />
        <CheckoutField
          label="Pincode"
          value={value.pincode}
          onChange={(v) => patch("pincode", v)}
        />
      </div>
      <button
        onClick={onContinue}
        className="rounded-full bg-[var(--gold)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-black"
      >
        Continue to Payment
      </button>
    </div>
  );
}

function PaymentStep({
  value,
  onChange,
  onContinue,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  onContinue: () => void;
}) {
  const options: PaymentMethod[] = ["cod", "upi", "card"];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-2xl border px-4 py-4 text-left ${
              value === option
                ? "border-[var(--gold)]/60 bg-[var(--gold)]/10"
                : "border-white/10 bg-black/15"
            }`}
          >
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">Method</div>
            <div className="mt-2 text-sm uppercase text-white">{option}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="rounded-full bg-[var(--gold)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-black"
      >
        Review Order
      </button>
    </div>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/60"
      />
    </label>
  );
}
