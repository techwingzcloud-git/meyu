import { supabase } from "@/integrations/supabase/client";

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  payment_method: string | null;
  bank_name: string | null;
  expires_at: string | null;
  active: boolean;
}

export const fetchActiveOffers = async (): Promise<Offer[]> => {
  const { data } = await supabase
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("discount_value", { ascending: false });
  return ((data || []) as any).filter((o: Offer) =>
    !o.expires_at || new Date(o.expires_at) > new Date()
  );
};

export const computeDiscount = (offer: Offer, subtotal: number): number => {
  if (subtotal < offer.min_amount) return 0;
  let d = offer.discount_type === "percent"
    ? (subtotal * offer.discount_value) / 100
    : offer.discount_value;
  if (offer.max_discount) d = Math.min(d, offer.max_discount);
  return Math.round(d);
};

export type OfferValidation =
  | { ok: true; offer: Offer; discount: number; error?: undefined }
  | { ok: false; error: string; offer?: undefined; discount?: undefined };

export const validateOffer = async (
  code: string,
  subtotal: number,
  paymentMethod: string,
): Promise<OfferValidation> => {
  const { data } = await supabase
    .from("offers")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (!data) return { ok: false, error: "Invalid coupon code" };
  const offer = data as any as Offer;
  if (offer.expires_at && new Date(offer.expires_at) < new Date())
    return { ok: false, error: "Coupon expired" };
  if (subtotal < offer.min_amount)
    return { ok: false, error: `Minimum order ₹${offer.min_amount} required` };
  if (offer.payment_method && offer.payment_method !== paymentMethod)
    return { ok: false, error: `Valid only on ${offer.payment_method.toUpperCase()}` };
  return { ok: true, offer, discount: computeDiscount(offer, subtotal) };
};
