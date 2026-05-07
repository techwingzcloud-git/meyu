import { Heart, ShoppingBag } from "lucide-react";
import { products } from "@/lib/catalog";
import { useShop } from "@/lib/use-shop";
import { Link } from "@tanstack/react-router";

export function ProductGrid() {
  const { toggleWishlist, isWishlisted, addToCart } = useShop();
  const display = products.slice(0, 8);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-primary">Featured</div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Just Dropped</h2>
          </div>
          <Link
            to="/products"
            className="text-xs uppercase tracking-[0.3em] text-foreground/80 transition-colors hover:text-primary"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {display.map((p) => {
            const wished = isWishlisted(p.id);
            return (
              <article
                key={p.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-gold/60 hover:shadow-[var(--shadow-elegant)]"
              >
                <Link
                  to="/product/$productId"
                  params={{ productId: p.id }}
                  className="relative block aspect-[3/4] overflow-hidden"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {p.oldPrice && (
                    <span className="absolute left-3 top-3 rounded-full border border-gold/50 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary backdrop-blur-md">
                      -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                    </span>
                  )}
                </Link>
                <button
                  aria-label="Wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(p);
                  }}
                  className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur-md transition-all active:scale-125 ${
                    wished
                      ? "bg-gold text-primary-foreground"
                      : "bg-background/70 text-foreground hover:bg-gold hover:text-primary-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
                </button>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {p.brand}
                  </div>
                  <h3 className="mt-1 truncate text-sm text-foreground">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-medium text-gold">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    {p.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{p.oldPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 py-2 text-[10px] uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-primary-foreground active:scale-95"
                  >
                    <ShoppingBag className="h-3 w-3" /> Add to Cart
                  </button>
                  <Link
                    to="/product/$productId"
                    params={{ productId: p.id }}
                    className="mt-2 block text-center text-[10px] uppercase tracking-[0.25em] text-foreground/60 transition-colors hover:text-primary"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
