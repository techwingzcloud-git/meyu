import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "@/context/ShopContext";
import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ProductCardProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  is_on_sale?: boolean;
}

export const ProductCard = ({ product, index = 0 }: { product: ProductCardProduct; index?: number }) => {
  const { toggleWishlist, inWishlist } = useShop();
  const liked = inWishlist(product.id);
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group product-card-hover"
    >
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-card">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gold-gradient text-primary-foreground text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-sm">
              {discount}% OFF
            </span>
          )}

          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className={cn(
              "absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all",
              liked
                ? "bg-primary text-primary-foreground"
                : "bg-black/40 text-white hover:bg-primary hover:text-primary-foreground"
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <div className="bg-background/90 backdrop-blur-md text-center py-2 text-xs tracking-[0.2em] uppercase border-gold rounded-sm text-primary">
              Quick View
            </div>
          </div>
        </div>

        <div className="pt-4 px-1 space-y-1">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            {product.category.replace(/-/g, " ")}
          </p>
          <h3 className="font-display text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-foreground">{formatINR(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.original_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
