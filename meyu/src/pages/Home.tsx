import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";
import { HomeImageGallery } from "@/components/HomeImageGallery";
import { ShopByCategorySection } from "@/components/ShopByCategorySection";

const ScrollRow = ({ title, subtitle, products, viewAllHref }: {
  title: string; subtitle?: string; products: ProductCardProduct[]; viewAllHref: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    ref.current?.scrollBy({ left: dir === "l" ? -400 : 400, behavior: "smooth" });
  };
  return (
    <section className="container py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          {subtitle && <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-2">{subtitle}</p>}
          <h2 className="font-display text-3xl md:text-5xl">{title}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <Link to={viewAllHref} className="hidden md:inline-flex text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors mr-4">
            View all <ArrowRight className="inline h-3 w-3 ml-1" />
          </Link>
          <button onClick={() => scroll("l")} className="hidden md:flex h-10 w-10 rounded-full border border-primary/30 hover:bg-primary hover:text-primary-foreground items-center justify-center transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("r")} className="hidden md:flex h-10 w-10 rounded-full border border-primary/30 hover:bg-primary hover:text-primary-foreground items-center justify-center transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4">
        {products.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 md:w-72 aspect-[3/4] bg-card animate-pulse rounded-md" />
          ))
        ) : products.map((p, i) => (
          <div key={p.id} className="flex-shrink-0 w-64 md:w-72 snap-start">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const [newArrivals, setNew] = useState<ProductCardProduct[]>([]);
  const [bestSellers, setBest] = useState<ProductCardProduct[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: n }, { data: b }] = await Promise.all([
        supabase.from("products").select("id,name,price,original_price,images,category,is_on_sale").eq("is_new_arrival", true).limit(10),
        supabase.from("products").select("id,name,price,original_price,images,category,is_on_sale").eq("is_best_seller", true).limit(10),
      ]);
      setNew((n || []) as any);
      setBest((b || []) as any);
    })();
  }, []);

  return (
    <MainLayout>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0">
          <img src={heroImg} alt="MEYU couture" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>
        <div className="container relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-6 font-cinzel">
              ✦ The Spring Edit ✦
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6">
              Join a <span className="italic text-gradient-gold">Global</span><br />
              Fashion <span className="italic">Movement</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-md leading-relaxed">
              Hand-crafted couture that celebrates the modern Indian woman. Designed to be simply you — and truly yours.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/shop">
                <Button variant="hero" size="xl">Shop Now</Button>
              </Link>
              <Link to="/shop?category=new-arrivals">
                <Button variant="goldOutline" size="xl">New Arrivals</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative corners */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* New arrivals */}
      <ScrollRow
        title="New Arrivals"
        subtitle="✦ Fresh from the atelier"
        products={newArrivals}
        viewAllHref="/shop?category=new-arrivals"
      />

      {/* Best sellers */}
      <div className="bg-card/40">
        <ScrollRow
          title="Best Sellers"
          subtitle="✦ Loved by our community"
          products={bestSellers}
          viewAllHref="/shop"
        />
      </div>

      {/* Lookbook gallery (30+ unique images) */}
      <HomeImageGallery />

      {/* Shop by Category — redesigned */}
      <ShopByCategorySection />

      {/* Brand strip */}
      <section className="bg-gold-gradient text-primary-foreground py-6 overflow-hidden">
        <div className="flex gap-12 animate-shimmer text-sm font-cinzel tracking-[0.4em] uppercase whitespace-nowrap"
          style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 5% / 0.1), transparent)", backgroundSize: "200% 100%" }}>
          <div className="container flex justify-around">
            <span>✦ Free Shipping over ₹2999</span>
            <span className="hidden md:inline">✦ Easy 7-day Returns</span>
            <span className="hidden md:inline">✦ Crafted in India</span>
            <span>✦ Premium Quality</span>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
