import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/constants";

interface Suggestion {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
}

const TRENDING = ["Silk Saree", "Co-ord Set", "Linen Shirt", "Anarkali", "Blazer"];

export const SmartSearch = ({ onClose }: { onClose: () => void }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id,name,price,category,images")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(6);
      setResults((data || []) as any);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/shop?search=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  const pick = (term: string) => {
    nav(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-2xl animate-fade-in">
      <div className="container max-w-3xl pt-20 md:pt-28 pb-10">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:text-primary"><X className="h-6 w-6" /></button>
        <form onSubmit={submit} className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <Input
            ref={ref}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search for dresses, sarees, shirts, brands..."
            className="pl-14 h-16 text-lg bg-card border-primary/30 focus-visible:ring-primary"
          />
        </form>

        <div className="mt-8">
          {q.trim().length < 2 ? (
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" /> Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <button key={t} onClick={() => pick(t)}
                    className="px-4 py-2 text-sm border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products match "{q}"</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">Products</p>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => { nav(`/product/${r.id}`); onClose(); }}
                  className="w-full flex items-center gap-4 p-3 hover:bg-card rounded-md transition-colors text-left"
                >
                  <img src={r.images?.[0]} alt="" className="w-14 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{r.category.replace(/-/g, " ")}</p>
                  </div>
                  <span className="text-sm text-primary">{formatINR(r.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
