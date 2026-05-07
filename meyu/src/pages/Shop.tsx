import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Black", "Gold", "Beige", "White", "Red", "Navy", "Emerald"];

type Sort = "newest" | "price-asc" | "price-desc";

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [size, setSize] = useState<string[]>([]);
  const [color, setColor] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 50000]);
  const [sort, setSort] = useState<Sort>("newest");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (searchInput) next.set("search", searchInput); else next.delete("search");
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from("products").select("id,name,price,original_price,images,category,is_on_sale,sizes,colors");
      if (category === "sale") q = q.eq("is_on_sale", true);
      else if (category === "new-arrivals") q = q.eq("is_new_arrival", true);
      else if (category) q = q.eq("category", category);
      if (search) q = q.ilike("name", `%${search}%`);
      const { data } = await q;
      setProducts((data || []) as any);
      setLoading(false);
    })();
  }, [category, search]);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.price >= price[0] && p.price <= price[1]);
    if (size.length) list = list.filter((p: any) => p.sizes?.some((s: string) => size.includes(s)));
    if (color.length) list = list.filter((p: any) => p.colors?.some((c: string) => color.includes(c)));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, size, color, price, sort]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const title = useMemo(() => {
    if (search) return `Results for "${search}"`;
    const cat = CATEGORIES.find(c => c.slug === category);
    return cat ? cat.label : "All Products";
  }, [category, search]);

  const FiltersPanel = (
    <aside className={cn(
      "space-y-8",
      filtersOpen ? "" : "hidden lg:block"
    )}>
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-4">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map(c => (
            <button
              key={c.slug}
              onClick={() => {
                const next = new URLSearchParams(params);
                if (category === c.slug) next.delete("category"); else next.set("category", c.slug);
                setParams(next);
              }}
              className={cn(
                "block text-sm w-full text-left transition-colors",
                category === c.slug ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-4">Price (₹)</h3>
        <Slider
          value={price}
          min={0} max={50000} step={500}
          onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹{price[0]}</span><span>₹{price[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => toggle(size, s, setSize)}
              className={cn(
                "h-9 w-9 text-xs border rounded-sm transition-all",
                size.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              )}
            >{s}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-4">Color</h3>
        <div className="space-y-2">
          {COLORS.map(c => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
              <input type="checkbox" checked={color.includes(c)} onChange={() => toggle(color, c, setColor)}
                className="accent-primary" />
              {c}
            </label>
          ))}
        </div>
      </div>

      {(size.length > 0 || color.length > 0 || category) && (
        <Button variant="goldOutline" size="sm" className="w-full" onClick={() => {
          setSize([]); setColor([]); setPrice([0, 50000]);
          setParams(new URLSearchParams());
        }}>Clear all filters</Button>
      )}
    </aside>
  );

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">✦ The MEYU Edit</p>
          <h1 className="font-display text-3xl md:text-5xl">{title}</h1>
        </div>

        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="goldOutline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(v => !v)}>
              {filtersOpen ? <X className="h-3 w-3 mr-1" /> : <SlidersHorizontal className="h-3 w-3 mr-1" />}
              Filters
            </Button>
            <p className="text-xs text-muted-foreground">{filtered.length} products</p>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search MEYU..." className="h-10 bg-card border-border" />
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
            className="h-10 px-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">{FiltersPanel}</div>

          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-card animate-pulse rounded-md" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-2xl mb-2">Nothing found</p>
                <p className="text-muted-foreground text-sm">Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Shop;
