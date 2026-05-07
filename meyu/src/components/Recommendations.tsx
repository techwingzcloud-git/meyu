import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";

interface Props {
  title?: string;
  category?: string;
  excludeId?: string;
  limit?: number;
}

export const Recommendations = ({ title = "You may also like", category, excludeId, limit = 6 }: Props) => {
  const [items, setItems] = useState<ProductCardProduct[]>([]);

  useEffect(() => {
    (async () => {
      let q = supabase.from("products").select("id,name,price,original_price,images,category,is_on_sale").limit(limit + 1);
      if (category) q = q.eq("category", category);
      const { data } = await q;
      setItems(((data || []) as any).filter((p: any) => p.id !== excludeId).slice(0, limit));
    })();
  }, [category, excludeId, limit]);

  if (items.length === 0) return null;

  return (
    <section className="container py-16">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-2">✦ Curated for you</p>
        <h2 className="font-display text-2xl md:text-4xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
};
