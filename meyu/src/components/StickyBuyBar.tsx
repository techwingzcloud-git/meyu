import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  price: number;
  originalPrice?: number | null;
  onAdd: () => void;
  onWishlist: () => void;
  inWishlist: boolean;
}

export const StickyBuyBar = ({ price, originalPrice, onAdd, onWishlist, inWishlist }: Props) => {
  return (
    <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium">{formatINR(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(originalPrice)}</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">Inclusive of taxes</p>
      </div>
      <Button variant="goldOutline" size="sm" onClick={onWishlist} className="h-11 px-3">
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
      </Button>
      <Button variant="hero" size="sm" onClick={onAdd} className="h-11 px-5">
        <ShoppingBag className="h-4 w-4 mr-1.5" /> Add
      </Button>
    </div>
  );
};
