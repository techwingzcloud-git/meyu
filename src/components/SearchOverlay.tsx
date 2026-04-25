import { useEffect, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useShop } from "@/lib/use-shop";
import { getProduct } from "@/lib/catalog";
import { Link, useNavigate } from "@tanstack/react-router";

const SUGGESTIONS = ["Saree", "Lehenga", "Dress", "Shirt", "Jeans", "Hoodie", "Kurti", "Jacket"];

type SearchResult = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
};

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchOpen) {
      setQ("");
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&sort=popularity`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults((data.results ?? []).slice(0, 8));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(error);
        }
      }
    };

    void run();

    return () => controller.abort();
  }, [q]);

  if (!searchOpen) return null;

  const submit = () => {
    if (!q.trim()) return;
    setSearchOpen(false);
    navigate({ to: "/products", search: { q } });
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setSearchOpen(false)}
      />
      <div
        className="relative mx-auto mt-20 w-full max-w-2xl rounded-2xl border border-[var(--gold)]/30 bg-[oklch(0.12_0.005_60)] p-1 shadow-2xl"
        style={{ animation: "fade-in 0.2s ease-out" }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--gold)]/20 px-5 py-4">
          <Search className="h-5 w-5 text-[var(--gold)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search dresses, sarees, shirts, brands…"
            className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="rounded-full p-2 text-white/70 hover:text-[var(--gold)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {!q.trim() ? (
            <div>
              <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
                Trending Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="rounded-full border border-[var(--gold)]/40 px-3 py-1.5 text-xs text-white/80 hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/60">
              No results for &quot;{q}&quot;
            </div>
          ) : (
            <ul className="space-y-2">
              {results.map((p) => {
                const product = getProduct(p.id);
                if (!product) return null;

                return (
                  <li key={p.id}>
                    <Link
                      to="/product/$productId"
                      params={{ productId: p.id }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-[var(--gold)]/30 hover:bg-black/40"
                    >
                      <img
                        src={product.image}
                        alt={p.name}
                        className="h-14 w-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          {p.brand} · {p.category}
                        </div>
                        <div className="text-sm text-white">{p.name}</div>
                      </div>
                      <div className="text-sm text-[var(--gold)]">
                        ₹{p.price.toLocaleString("en-IN")}
                      </div>
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={submit}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)]/60 py-2.5 text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] hover:bg-[var(--gold)]/10"
                >
                  See all results <ArrowRight className="h-3 w-3" />
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
