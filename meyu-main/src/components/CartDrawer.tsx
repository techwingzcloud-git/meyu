import { useShop } from "@/lib/use-shop";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    cartTotal,
    user,
    beginCheckoutFromCart,
  } = useShop();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--gold)]/30 bg-[oklch(0.12_0.005_60)] shadow-2xl"
        style={{ animation: "slide-in-right 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--gold)]/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--gold)]" />
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Cart <span className="text-[var(--gold)]">({cart.length})</span>
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-2 text-white/70 hover:text-[var(--gold)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-sm text-white/60">Your cart is empty</p>
              <Link
                to="/"
                onClick={() => setCartOpen(false)}
                className="mt-4 rounded-full border border-[var(--gold)]/60 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map(({ product, qty }) => (
                <li
                  key={product.id}
                  className="flex gap-3 rounded-lg border border-[var(--gold)]/15 bg-black/30 p-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-20 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          {product.brand}
                        </div>
                        <div className="text-sm text-white">{product.name}</div>
                      </div>
                      <button
                        aria-label="Remove"
                        onClick={() => removeFromCart(product.id)}
                        className="text-white/50 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-1">
                        <button
                          aria-label="Decrease"
                          onClick={() => updateQty(product.id, qty - 1)}
                          className="p-1.5 text-white/80 hover:text-[var(--gold)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm">{qty}</span>
                        <button
                          aria-label="Increase"
                          onClick={() => updateQty(product.id, qty + 1)}
                          className="p-1.5 text-white/80 hover:text-[var(--gold)]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-medium text-[var(--gold)]">
                        ₹{(product.price * qty).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[var(--gold)]/20 p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-white/60">Total</span>
              <span className="font-display text-2xl text-[var(--gold)]">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={(event) => {
                setCartOpen(false);
                if (!user) {
                  event.preventDefault();
                  navigate({ to: "/auth", search: { redirect: "/cart" } });
                  return;
                }
                beginCheckoutFromCart();
              }}
              className="block w-full rounded-full bg-[var(--gold)] py-3 text-center text-xs font-medium uppercase tracking-[0.3em] text-black transition-all hover:shadow-[0_8px_30px_-8px_var(--gold)]"
            >
              Checkout →
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
