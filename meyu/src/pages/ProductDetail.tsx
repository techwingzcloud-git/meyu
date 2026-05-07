import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SmartPurchaseBox } from "@/components/SmartPurchaseBox";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { Recommendations } from "@/components/Recommendations";

interface Product {
  id: string; name: string; description: string;
  price: number; original_price: number | null;
  images: string[]; category: string;
  sizes: string[]; colors: string[]; stock: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, inWishlist } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      setProduct(data as any);
      setLoading(false);
      if (data && user) {
        await supabase.from("user_activity").insert({ user_id: user.id, product_id: id, action: "view" });
      }
    })();
  }, [id, user]);

  if (loading) return <MainLayout><div className="container py-32 text-center text-muted-foreground">Loading...</div></MainLayout>;
  if (!product) return <MainLayout><div className="container py-32 text-center font-display text-2xl">Product not found</div></MainLayout>;

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  const handleAdd = async () => {
    if (!user) { toast.error("Please sign in"); nav("/login"); return; }
    if (product.sizes.length > 0 && !size) { toast.error("Please select a size"); return; }
    if (product.colors.length > 0 && !color) { toast.error("Please select a color"); return; }
    await addToCart(product.id, { size, color, quantity: qty });
  };

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-[3/4] bg-card rounded-md overflow-hidden mb-4"
            >
              <img
                src={product.images[activeImg] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "aspect-square rounded-md overflow-hidden border-2 transition-all",
                      activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">
              {product.category.replace(/-/g, " ")}
            </p>
            <h1 className="font-display text-3xl md:text-5xl mb-4 leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl font-medium">{formatINR(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-muted-foreground line-through">{formatINR(product.original_price)}</span>
                  <span className="text-sm text-primary">({discount}% off)</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-8">Inclusive of all taxes</p>

            <div className="hairline mb-8" />

            <p className="text-sm text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
              {product.description || "A premium MEYU creation, hand-crafted with attention to every detail."}
            </p>

            {product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "h-11 w-11 border text-sm rounded-sm transition-all",
                        size === s
                          ? "bg-primary text-primary-foreground border-primary shadow-gold"
                          : "border-border hover:border-primary"
                      )}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "px-4 h-10 border text-xs rounded-sm transition-all",
                        color === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary"
                      )}
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-border rounded-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-11 w-11 hover:bg-primary/10 transition-colors"><Minus className="h-3 w-3 mx-auto" /></button>
                <span className="px-6 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="h-11 w-11 hover:bg-primary/10 transition-colors"><Plus className="h-3 w-3 mx-auto" /></button>
              </div>
              {product.stock < 10 && product.stock > 0 && (
                <p className="text-xs text-primary mt-3">Only {product.stock} left in stock</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="hero" size="xl" onClick={handleAdd} className="flex-1">
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Bag
              </Button>
              <Button
                variant="goldOutline"
                size="xl"
                onClick={() => toggleWishlist(product.id)}
                className="px-5"
              >
                <Heart className={cn("h-5 w-5", inWishlist(product.id) && "fill-current")} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border">
              {[
                { Icon: Truck, label: "Free Shipping", desc: "Over ₹2999" },
                { Icon: RotateCcw, label: "Easy Returns", desc: "7-day window" },
                { Icon: Shield, label: "Authenticity", desc: "100% genuine" },
              ].map(({ Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <SmartPurchaseBox price={product.price * qty} className="mt-8" />
          </motion.div>
        </div>

        <Recommendations
          title="You may also like"
          category={product.category}
          excludeId={product.id}
        />
      </div>

      <StickyBuyBar
        price={product.price}
        originalPrice={product.original_price}
        onAdd={handleAdd}
        onWishlist={() => toggleWishlist(product.id)}
        inWishlist={inWishlist(product.id)}
      />
    </MainLayout>
  );
};

export default ProductDetail;
