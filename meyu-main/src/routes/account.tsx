import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { useShop } from "@/lib/use-shop";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { authReady, user, profile, customizations, orders, signOut } = useShop();

  useEffect(() => {
    if (authReady && !user) {
      navigate({ to: "/auth", search: { redirect: "/account" } });
    }
  }, [authReady, navigate, user]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              Account
            </div>
            <h1 className="mt-3 font-display text-4xl text-white">Welcome back</h1>
            <div className="mt-6 space-y-4 text-sm text-white/75">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Name</div>
                <div className="mt-1">{profile?.full_name ?? "Not set"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Email</div>
                <div className="mt-1">{profile?.email ?? user?.email ?? "-"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Phone</div>
                <div className="mt-1">{profile?.phone ?? "Not set"}</div>
              </div>
            </div>
            <button
              onClick={() => void signOut().then(() => navigate({ to: "/" }))}
              className="mt-6 w-full rounded-full border border-[var(--gold)]/50 py-3 text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              Logout
            </button>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
                    Quick Actions
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-white">Shopping shortcuts</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/cart"
                    className="rounded-full border border-[var(--gold)]/40 px-5 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/75"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
                Recent Orders
              </div>
              <div className="mt-4 space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm text-white/60">
                    Place an order to see it here.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-black/15 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
                            Order #{order.id.slice(0, 8)}
                          </div>
                          <div className="mt-2 text-sm text-white/80">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                            {order.status}
                          </div>
                          <div className="mt-2 text-lg text-[var(--gold)]">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-white/65">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4">
                            <span className="min-w-0 truncate">
                              {item.name} x {item.quantity}
                            </span>
                            <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
                Saved Customizations
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {customizations.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm text-white/60">
                    Start from any product page and use the Customize button to save a design.
                  </div>
                )}
                {customizations.map((item) => (
                  <Link
                    key={item.id}
                    to="/customize/$productId"
                    params={{ productId: item.productId }}
                    className="rounded-2xl border border-white/10 bg-black/15 p-5 transition-colors hover:border-[var(--gold)]/40"
                  >
                    <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
                      {item.name}
                    </div>
                    <div className="mt-2 text-sm text-white/75">{item.productId}</div>
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-white/10"
                        style={{ backgroundColor: item.baseColor }}
                      />
                      <span className="text-xs text-white/55">{item.layers.length} layers</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
