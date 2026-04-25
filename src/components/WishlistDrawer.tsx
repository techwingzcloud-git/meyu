import { useShop } from "@/lib/use-shop";
import { products } from "@/lib/catalog";
import { X, Heart, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function WishlistDrawer() {
  const { wishlist, wishlistOpen, setWishlistOpen, removeFromWishlist, addToCart } = useShop();
  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  if (!wishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setWishlistOpen(false)}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--gold)]/30 bg-[oklch(0.12_0.005_60)] shadow-2xl"
        style={{ animation: "slide-in-right 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--gold)]/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[var(--gold)]" />
            <h2 className="font-display text-xl uppercase tracking-[0.2em] text-white">
              Wishlist <span className="text-[var(--gold)]">({items.length})</span>
            </h2>
          </div>
          <button
            onClick={() => setWishlistOpen(false)}
            aria-label="Close wishlist"
            className="rounded-full p-2 text-white/70 hover:text-[var(--gold)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Heart className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-sm text-white/60">Your wishlist is empty</p>
              <Link
                to="/"
                onClick={() => setWishlistOpen(false)}
                className="mt-4 rounded-full border border-[var(--gold)]/60 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                Discover Pieces
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="flex gap-3 rounded-lg border border-[var(--gold)]/15 bg-black/30 p-3"
                >
                  <img src={p.image} alt={p.name} className="h-24 w-20 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          {p.brand}
                        </div>
                        <div className="text-sm text-white">{p.name}</div>
                        <div className="mt-1 text-sm font-medium text-[var(--gold)]">
                          ₹{p.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <button
                        aria-label="Remove"
                        onClick={() => removeFromWishlist(p.id)}
                        className="text-white/50 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(p);
                        removeFromWishlist(p.id);
                      }}
                      className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full border border-[var(--gold)]/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
                    >
                      <ShoppingBag className="h-3 w-3" /> Move to Cart
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
