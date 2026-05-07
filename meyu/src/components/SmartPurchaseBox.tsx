import { useEffect, useMemo, useState } from "react";
import { Truck, Tag, CreditCard, MapPin, Sparkles, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcEmi, EMI_OPTIONS, estimateDelivery, formatINR } from "@/lib/constants";
import { fetchActiveOffers, computeDiscount, Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

interface Props {
  price: number;
  className?: string;
}

export const SmartPurchaseBox = ({ price, className }: Props) => {
  const [pin, setPin] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showEmi, setShowEmi] = useState(false);

  useEffect(() => { fetchActiveOffers().then(setOffers); }, []);

  const eta = useMemo(() => pin.length === 6 ? estimateDelivery(pin) : null, [pin]);
  const bestOffer = useMemo(() => {
    let best: { offer: Offer; discount: number } | null = null;
    offers.forEach(o => {
      const d = computeDiscount(o, price);
      if (d > 0 && (!best || d > best.discount)) best = { offer: o, discount: d };
    });
    return best;
  }, [offers, price]);

  const visibleOffers = showAllOffers ? offers : offers.slice(0, 2);

  return (
    <div className={cn("border border-border rounded-md bg-card/40 divide-y divide-border", className)}>
      {/* Best price */}
      {bestOffer && (
        <div className="p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p>
              Apply <span className="text-primary font-mono">{bestOffer.offer.code}</span> to get
              {" "}<span className="text-primary font-medium">{formatINR(bestOffer.discount)}</span> off
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Final price <span className="text-foreground">{formatINR(price - bestOffer.discount)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Offers */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary">
          <Tag className="h-3 w-3" /> Available Offers
        </div>
        <div className="space-y-2">
          {visibleOffers.map(o => (
            <div key={o.id} className="text-sm flex gap-3">
              <span className="font-mono text-xs px-2 py-1 bg-primary/10 text-primary rounded h-fit border border-primary/30">{o.code}</span>
              <div className="flex-1">
                <p className="text-foreground/90">{o.title}</p>
                {o.description && <p className="text-xs text-muted-foreground">{o.description}</p>}
              </div>
            </div>
          ))}
          {offers.length > 2 && (
            <button onClick={() => setShowAllOffers(s => !s)} className="text-xs text-primary hover:underline">
              {showAllOffers ? "Show less" : `+${offers.length - 2} more offers`}
            </button>
          )}
        </div>
      </div>

      {/* Delivery ETA */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary">
          <Truck className="h-3 w-3" /> Delivery
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter pincode"
              className="h-10 pl-9 bg-background"
            />
          </div>
          {eta ? (
            <div className="flex items-center gap-1.5 px-3 text-xs text-primary">
              <Check className="h-3 w-3" /> Available
            </div>
          ) : null}
        </div>
        {eta && (
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>Delivery to <span className="text-foreground">{eta.city}, {eta.state}</span></p>
            <p>Get it by <span className="text-primary font-medium">{eta.date}</span> {eta.express && <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">EXPRESS</span>}</p>
            <p>{price >= 2999 ? "Free shipping" : `Add ${formatINR(2999 - price)} more for free shipping`}</p>
          </div>
        )}
      </div>

      {/* EMI */}
      {price >= 3000 && (
        <div className="p-4 space-y-3">
          <button onClick={() => setShowEmi(v => !v)} className="w-full flex items-center justify-between text-xs tracking-[0.2em] uppercase text-primary">
            <span className="flex items-center gap-2"><CreditCard className="h-3 w-3" /> EMI from {formatINR(calcEmi(price, 12, 15))}/mo</span>
            <span>{showEmi ? "−" : "+"}</span>
          </button>
          {showEmi && (
            <div className="space-y-1.5 text-xs">
              {EMI_OPTIONS.map(opt => {
                const emi = calcEmi(price, opt.months, opt.rate);
                const total = emi * opt.months;
                return (
                  <div key={opt.months} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span>{opt.months} months @ {opt.rate}%</span>
                    <span className="text-right">
                      <span className="text-foreground font-medium">{formatINR(emi)}/mo</span>
                      <span className="block text-[10px] text-muted-foreground">Total {formatINR(total)}</span>
                    </span>
                  </div>
                );
              })}
              <p className="text-[10px] text-muted-foreground pt-1">EMI available on major credit cards.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
