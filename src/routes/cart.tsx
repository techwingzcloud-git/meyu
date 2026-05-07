import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { useShop } from "@/lib/use-shop";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { authReady, user, cart, cartTotal, updateQty, removeFromCart, beginCheckoutFromCart } =
    useShop();

  useEffect(() => {
    if (authReady && !user) {
      navigate({ to: "/auth", search: { redirect: "/cart" } });
    }
  }, [authReady, navigate, user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">Cart</div>
            <h1 className="mt-3 font-display text-4xl text-white">Review your bag</h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => {
                beginCheckoutFromCart();
                navigate({ to: "/checkout", search: { step: "address" } });
              }}
              className="rounded-full bg-[var(--gold)] px-6 py-3 text-xs font-medium uppercase tracking-[0.3em] text-black"
            >
              Continue Checkout
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-3xl border border-[var(--gold)]/20 bg-card p-8 text-center">
                <div className="text-sm text-white/60">Your cart is empty.</div>
                <Link
                  to="/products"
                  className="mt-4 inline-flex rounded-full border border-[var(--gold)]/50 px-5 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
                >
                  Shop Products
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-3xl border border-[var(--gold)]/20 bg-card p-4 sm:flex-row"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-40 w-full rounded-2xl object-cover sm:w-32"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                          {item.product.brand}
                        </div>
                        <h2 className="mt-1 truncate text-lg text-white">{item.product.name}</h2>
                        {item.customization && (
                          <div className="mt-2 text-xs text-[var(--gold)]">
                            Customization: {item.customization.name}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/50 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-1">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-2 text-white/70"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-2 text-white/70"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-lg text-[var(--gold)]">
                        ₹{(item.product.price * item.qty).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              Summary
            </div>
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>Free</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/60">Total</span>
              <span className="font-display text-3xl text-[var(--gold)]">
                ₹{cartTotal.toLocaleString("en-IN")}
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
