import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { findProducts } from "@/lib/catalog";
import { useShop } from "@/lib/use-shop";

type Search = { gender?: "women" | "men"; category?: string; q?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    gender: s.gender === "men" || s.gender === "women" ? s.gender : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — MEYU" },
      { name: "description", content: "Browse premium fashion at MEYU." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { gender, category, q } = Route.useSearch();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const items = findProducts({ gender, category, q });

  const title = q
    ? `Results for "${q}"`
    : category
      ? category
      : gender
        ? gender === "men"
          ? "Shop Men"
          : "Shop Women"
        : "Shop All";

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.005_60)] text-white">
      <Navbar />
      <section className="mx-auto max-w-[1400px] px-6 pt-28 lg:px-10">
        <nav className="flex items-center gap-2 text-xs text-white/60" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[var(--gold)]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-white/40" />
          {gender && (
            <>
              <Link to={gender === "men" ? "/men" : "/women"} className="hover:text-[var(--gold)]">
                {gender === "men" ? "Men" : "Women"}
              </Link>
              {category && <ChevronRight className="h-3 w-3 text-white/40" />}
            </>
          )}
          {category && <span className="text-[var(--gold)]">{category}</span>}
        </nav>

        <div className="mb-8 mt-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl uppercase tracking-[0.08em] md:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-white/60">{items.length} products</p>
          </div>
          {(gender || category || q) && (
            <button
              onClick={() => navigate({ to: "/products", search: {} })}
              className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center text-white/60">
            No products found. Try a different filter or{" "}
            <Link to="/products" search={{}} className="text-[var(--gold)] hover:underline">
              browse all
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 pb-24 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => {
              const wished = isWishlisted(p.id);
              return (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-lg border border-[var(--gold)]/20 bg-card transition-all duration-500 hover:-translate-y-1 hover:border-[var(--gold)]/70 hover:shadow-[0_15px_40px_-15px_var(--gold)]"
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
                      <span className="absolute left-3 top-3 rounded-full border border-[var(--gold)]/50 bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[var(--gold)]">
                        -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                      </span>
                    )}
                  </Link>
                  <button
                    aria-label="Wishlist"
                    onClick={() => toggleWishlist(p)}
                    className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur-md transition-all active:scale-125 ${
                      wished
                        ? "bg-[var(--gold)] text-black"
                        : "bg-black/60 text-white hover:bg-[var(--gold)] hover:text-black"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
                  </button>
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                      {p.brand}
                    </div>
                    <h3 className="mt-1 truncate text-sm">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-medium text-[var(--gold)]">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      {p.oldPrice && (
                        <span className="text-xs text-white/50 line-through">
                          ₹{p.oldPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/50 py-2 text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] transition-all hover:bg-[var(--gold)] hover:text-black active:scale-95"
                    >
                      <ShoppingBag className="h-3 w-3" /> Add to Cart
                    </button>
                    <Link
                      to="/product/$productId"
                      params={{ productId: p.id }}
                      className="mt-2 block text-center text-[10px] uppercase tracking-[0.25em] text-white/55 hover:text-[var(--gold)]"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
      <AIChat />
    </div>
  );
}
