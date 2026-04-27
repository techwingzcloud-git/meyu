import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { getProduct } from "@/lib/catalog";
import { useShop } from "@/lib/use-shop";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const product = getProduct(productId);
  const { addToCart, beginBuyNow, toggleWishlist, isWishlisted, getCustomization } = useShop();

  if (!product) {
    throw notFound();
  }

  const customization = getCustomization(product.id);
  const wished = isWishlisted(product.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-3xl border border-[var(--gold)]/20 bg-card">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              {product.brand}
            </div>
            <h1 className="mt-3 font-display text-4xl text-white">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl text-[var(--gold)]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-white/40 line-through">
                  ₹{product.oldPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
              Crafted for the MEYU edit with premium finish, clean silhouette, and production-ready
              commerce flow.
            </p>

            {customization && (
              <div className="mt-6 rounded-2xl border border-[var(--gold)]/25 bg-black/15 p-4 text-sm text-white/70">
                Saved customization:{" "}
                <span className="text-[var(--gold)]">{customization.name}</span>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => addToCart(product, 1, customization)}
                className="flex items-center justify-center gap-2 rounded-full border border-[var(--gold)]/50 py-3 text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={() => {
                  beginBuyNow(product, customization);
                  navigate({ to: "/checkout", search: { step: "address" } });
                }}
                className="rounded-full bg-[var(--gold)] py-3 text-xs font-medium uppercase tracking-[0.3em] text-black"
              >
                Buy Now
              </button>
              <button
                onClick={() =>
                  navigate({ to: "/customize/$productId", params: { productId: product.id } })
                }
                className="rounded-full border border-white/10 py-3 text-xs uppercase tracking-[0.3em] text-white/80"
              >
                Customize
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-xs uppercase tracking-[0.3em] text-white/80"
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-current text-[var(--gold)]" : ""}`} />{" "}
                Wishlist
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Category", value: product.category },
                { label: "Gender", value: product.gender },
                { label: "Delivery", value: "3-5 business days" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/15 p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm text-white/80">{item.value}</div>
                </div>
              ))}
            </div>

            <Link
              to="/products"
              search={{ gender: product.gender, category: product.category }}
              className="mt-8 inline-block text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              Back to catalog
            </Link>
          </section>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
