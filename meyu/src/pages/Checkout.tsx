import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { MapPin, CheckCircle2, CreditCard, Wallet, Banknote, Tag, X, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, INDIAN_STATES, estimateDelivery, calcEmi, EMI_OPTIONS } from "@/lib/constants";
import { fetchActiveOffers, validateOffer, computeDiscount, Offer } from "@/lib/offers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile"),
  address: z.string().trim().min(8).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().min(1, "Select a state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type Step = 0 | 1 | 2 | 3;
type PaymentMethod = "upi" | "card" | "cod";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  is_default: boolean;
}

const STEPS = ["Address", "Payment", "Offers", "Review"];

const Checkout = () => {
  const { user, profile } = useAuth();
  const { cart, cartTotal, clearCart } = useShop();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(null);

  // Address
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "", state: "", pincode: "", label: "Home",
  });

  // Payment
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [emiMonths, setEmiMonths] = useState<number | null>(null);

  // Offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupon, setCoupon] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<{ offer: Offer; discount: number } | null>(null);

  useEffect(() => {
    if (cart.length === 0 && !placed) nav("/cart");
  }, [cart, placed, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      const list = (data || []) as any as SavedAddress[];
      setSavedAddresses(list);
      if (list.length === 0) {
        setAddingNew(true);
        if (profile) setForm(f => ({
          ...f,
          name: profile.name || "",
          phone: profile.phone || "",
          address: profile.address_line || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
        }));
      } else {
        setSelectedAddress(list[0].id);
      }
    })();
    fetchActiveOffers().then(setOffers);
  }, [user, profile]);

  const currentAddress = savedAddresses.find(a => a.id === selectedAddress);
  const pincode = addingNew ? form.pincode : currentAddress?.pincode || "";
  const eta = pincode.length === 6 ? estimateDelivery(pincode) : null;

  const subtotal = cartTotal;
  const shipping = subtotal >= 2999 ? 0 : 99;
  const discount = appliedOffer?.discount || 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal + shipping + tax - discount;

  const saveNewAddress = async () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return null; }
    if (!user) return null;
    const { data, error } = await supabase.from("addresses").insert({
      user_id: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      address_line: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      label: form.label,
      is_default: savedAddresses.length === 0,
    }).select().single();
    if (error) { toast.error(error.message); return null; }
    const addr = data as any as SavedAddress;
    setSavedAddresses(s => [addr, ...s]);
    setSelectedAddress(addr.id);
    setAddingNew(false);
    return addr;
  };

  const goNext = async () => {
    if (step === 0) {
      if (addingNew) {
        const a = await saveNewAddress();
        if (!a) return;
      } else if (!selectedAddress) {
        toast.error("Select an address"); return;
      }
    }
    setStep(s => Math.min(3, s + 1) as Step);
  };

  const applyCoupon = async (code?: string) => {
    const c = (code || coupon).trim();
    if (!c) return;
    const r = await validateOffer(c, subtotal, payment);
    if (!r.ok) { toast.error(r.error); return; }
    setAppliedOffer({ offer: r.offer, discount: r.discount });
    setCoupon("");
    toast.success(`${r.offer.code} applied — saved ${formatINR(r.discount)}`);
  };

  const placeOrder = async () => {
    if (!user) return;
    const addr = currentAddress;
    if (!addr) { toast.error("Select an address"); return; }
    setSubmitting(true);

    // Mock payment processing
    if (payment !== "cod") {
      await new Promise(r => setTimeout(r, 1200));
    }

    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total, subtotal, shipping, discount, tax,
      offer_code: appliedOffer?.offer.code || null,
      payment_method: payment,
      payment_status: payment === "cod" ? "pending" : "paid",
      ship_name: addr.name,
      ship_phone: addr.phone,
      ship_address: addr.address_line,
      ship_city: addr.city,
      ship_state: addr.state,
      ship_pincode: addr.pincode,
    }).select().single();

    if (error || !order) {
      setSubmitting(false);
      toast.error(error?.message || "Failed to place order");
      return;
    }

    const items = cart.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      custom_design_id: i.custom_design_id,
      is_custom: !!i.custom_design_id,
      product_name: i.custom_design ? `Custom ${i.custom_design.base_type}` : i.product?.name || "",
      product_image: i.product?.images?.[0] || i.custom_design?.preview_url || null,
      price: i.custom_design?.total_price || i.product?.price || 0,
      quantity: i.quantity,
      size: i.size, color: i.color,
    }));
    const { error: itemErr } = await supabase.from("order_items").insert(items);
    if (itemErr) { toast.error(itemErr.message); setSubmitting(false); return; }

    await clearCart();
    setPlaced({ id: order.id, total });
    setSubmitting(false);
  };

  if (placed) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="container py-24 text-center max-w-lg"
        >
          <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="font-display text-4xl mb-3">Order Confirmed</h1>
          <p className="text-muted-foreground mb-1">Thank you for shopping with MEYU.</p>
          <p className="text-sm mb-2">Total paid <span className="text-primary font-medium">{formatINR(placed.total)}</span></p>
          <p className="text-xs text-muted-foreground mb-10">Order ID: <span className="font-mono text-primary">{placed.id.slice(0, 8).toUpperCase()}</span></p>
          {eta && <p className="text-sm mb-8">Estimated delivery by <span className="text-primary">{eta.date}</span></p>}
          <div className="flex gap-3 justify-center">
            <Button variant="hero" onClick={() => nav("/orders")}>View My Orders</Button>
            <Button variant="goldOutline" onClick={() => nav("/shop")}>Continue Shopping</Button>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10 md:py-16 pb-32">
        <h1 className="font-display text-3xl md:text-5xl mb-2 text-center">Checkout</h1>

        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-12 mt-10">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i < step && setStep(i as Step)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    i <= step ? "text-primary" : "text-muted-foreground",
                    i < step && "cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                    i < step ? "bg-primary border-primary text-primary-foreground" :
                    i === step ? "border-primary" : "border-border"
                  )}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase hidden md:block">{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px mx-2", i < step ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="bg-card border border-border rounded-md p-6 md:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* STEP 0: Address */}
              {step === 0 && (
                <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-xl">Shipping Address</h2>
                  </div>

                  {!addingNew && savedAddresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {savedAddresses.map(a => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedAddress(a.id)}
                          className={cn(
                            "w-full text-left border rounded-md p-4 transition-all",
                            selectedAddress === a.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{a.name}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded uppercase tracking-wider">{a.label}</span>
                              {a.is_default && <span className="text-[10px] text-primary">Default</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">{a.phone}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{a.address_line}, {a.city}, {a.state} - {a.pincode}</p>
                        </button>
                      ))}
                      <button onClick={() => setAddingNew(true)} className="w-full border border-dashed border-border rounded-md p-4 text-sm text-primary hover:border-primary transition-colors flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add new address
                      </button>
                    </div>
                  )}

                  {addingNew && (
                    <div className="space-y-4">
                      {savedAddresses.length > 0 && (
                        <button onClick={() => setAddingNew(false)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 h-11" />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">Phone</Label>
                          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5 h-11" placeholder="10-digit mobile" />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">Address</Label>
                          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1.5 h-11" placeholder="House no, street, area" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">City</Label>
                          <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="mt-1.5 h-11" />
                        </div>
                        <div>
                          <Label className="text-xs tracking-wider uppercase">Pincode</Label>
                          <Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} className="mt-1.5 h-11" />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">State</Label>
                          <select
                            value={form.state}
                            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                            className="mt-1.5 h-11 w-full px-3 bg-input border border-border rounded-md text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="">Select state</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs tracking-wider uppercase">Save as</Label>
                          <div className="flex gap-2 mt-1.5">
                            {["Home", "Work", "Other"].map(l => (
                              <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                                className={cn("px-4 h-9 text-xs border rounded-sm",
                                  form.label === l ? "bg-primary text-primary-foreground border-primary" : "border-border")}
                              >{l}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 1: Payment */}
              {step === 1 && (
                <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-xl mb-6 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: "upi", Icon: Wallet, label: "UPI", desc: "Pay via Google Pay, PhonePe, Paytm, BHIM" },
                      { id: "card", Icon: CreditCard, label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex, RuPay · EMI available" },
                      { id: "cod", Icon: Banknote, label: "Cash on Delivery", desc: "Pay in cash when your order arrives" },
                    ].map(({ id, Icon, label, desc }) => (
                      <button
                        key={id}
                        onClick={() => { setPayment(id as PaymentMethod); setEmiMonths(null); }}
                        className={cn(
                          "w-full text-left border rounded-md p-4 flex items-center gap-4 transition-all",
                          payment === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", payment === id ? "text-primary" : "text-muted-foreground")} />
                        <div className="flex-1">
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <div className={cn("h-4 w-4 rounded-full border-2",
                          payment === id ? "border-primary bg-primary" : "border-border"
                        )} />
                      </button>
                    ))}
                  </div>

                  {payment === "card" && total >= 3000 && (
                    <div className="mt-6 border border-border rounded-md p-4">
                      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">EMI Plan (Optional)</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <button
                          onClick={() => setEmiMonths(null)}
                          className={cn("p-3 border text-xs rounded-md text-center",
                            emiMonths === null ? "border-primary bg-primary/5" : "border-border")}
                        >Pay full</button>
                        {EMI_OPTIONS.map(o => (
                          <button
                            key={o.months}
                            onClick={() => setEmiMonths(o.months)}
                            className={cn("p-3 border text-xs rounded-md text-center",
                              emiMonths === o.months ? "border-primary bg-primary/5" : "border-border")}
                          >
                            <p className="font-medium">{o.months}m</p>
                            <p className="text-[10px] text-muted-foreground">{formatINR(calcEmi(total, o.months, o.rate))}/mo</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: Offers */}
              {step === 2 && (
                <motion.div key="off" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-display text-xl mb-6 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Offers & Coupons
                  </h2>

                  <div className="flex gap-2 mb-6">
                    <Input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="h-11 font-mono" />
                    <Button variant="hero" onClick={() => applyCoupon()}>Apply</Button>
                  </div>

                  {appliedOffer && (
                    <div className="border border-primary bg-primary/5 rounded-md p-4 mb-6 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-primary">{appliedOffer.offer.code} applied</p>
                        <p className="text-xs text-muted-foreground">You saved {formatINR(appliedOffer.discount)}</p>
                      </div>
                      <button onClick={() => setAppliedOffer(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Available offers</p>
                  <div className="space-y-3">
                    {offers.map(o => {
                      const d = computeDiscount(o, subtotal);
                      const eligible = d > 0 && (!o.payment_method || o.payment_method === payment);
                      return (
                        <div key={o.id} className={cn("border rounded-md p-4", eligible ? "border-border" : "border-border/40 opacity-50")}>
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs px-2 py-1 bg-primary/10 text-primary rounded h-fit border border-primary/30">{o.code}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{o.title}</p>
                              {o.description && <p className="text-xs text-muted-foreground mt-0.5">{o.description}</p>}
                              {!eligible && o.payment_method && (
                                <p className="text-[11px] text-destructive mt-1">Requires {o.payment_method.toUpperCase()} payment</p>
                              )}
                            </div>
                            {eligible && (
                              <Button variant="goldOutline" size="sm" onClick={() => applyCoupon(o.code)}>Apply</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {offers.length === 0 && <p className="text-sm text-muted-foreground">No offers available right now.</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Review */}
              {step === 3 && (
                <motion.div key="rev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="font-display text-xl">Review & Place Order</h2>

                  {currentAddress && (
                    <div className="border border-border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs tracking-[0.2em] uppercase text-primary">Delivering to</p>
                        <button onClick={() => setStep(0)} className="text-xs text-muted-foreground hover:text-primary">Change</button>
                      </div>
                      <p className="text-sm">{currentAddress.name} · {currentAddress.phone}</p>
                      <p className="text-sm text-muted-foreground">{currentAddress.address_line}, {currentAddress.city}, {currentAddress.state} - {currentAddress.pincode}</p>
                      {eta && <p className="text-xs mt-2 text-primary">Arriving by {eta.date}</p>}
                    </div>
                  )}

                  <div className="border border-border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs tracking-[0.2em] uppercase text-primary">Payment</p>
                      <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-primary">Change</button>
                    </div>
                    <p className="text-sm capitalize">{payment === "cod" ? "Cash on Delivery" : payment.toUpperCase()}</p>
                    {emiMonths && <p className="text-xs text-muted-foreground">EMI {emiMonths} months</p>}
                  </div>

                  <div className="border border-border rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
                    <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">{cart.length} items</p>
                    {cart.map(i => (
                      <div key={i.id} className="flex gap-3 text-sm">
                        <img src={i.product?.images?.[0] || i.custom_design?.preview_url || "/placeholder.svg"} alt="" className="w-12 h-16 object-cover rounded-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{i.custom_design ? `Custom ${i.custom_design.base_type}` : i.product?.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {i.quantity} {i.size && `· ${i.size}`}</p>
                        </div>
                        <span>{formatINR((i.custom_design?.total_price || i.product?.price || 0) * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step nav */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1) as Step)} disabled={step === 0}>
                Back
              </Button>
              {step < 3 ? (
                <Button variant="hero" onClick={goNext}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={placeOrder} disabled={submitting}>
                  {submitting ? "Processing..." : `Place Order · ${formatINR(total)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="bg-card border border-border rounded-md p-6 space-y-4 lg:sticky lg:top-28 lg:self-start h-fit">
            <h3 className="font-display text-xl">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({cart.length})</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? <span className="text-primary">Free</span> : formatINR(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>{formatINR(tax)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount {appliedOffer && `(${appliedOffer.offer.code})`}</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
            </div>
            <div className="hairline" />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span className="text-gradient-gold text-xl">{formatINR(total)}</span>
            </div>
            {emiMonths && payment === "card" && (
              <p className="text-xs text-primary text-center bg-primary/5 border border-primary/20 rounded-md p-2">
                EMI {formatINR(calcEmi(total, emiMonths, EMI_OPTIONS.find(o => o.months === emiMonths)?.rate || 15))}/mo for {emiMonths} months
              </p>
            )}
            {appliedOffer && (
              <p className="text-xs text-center text-primary">🎉 You saved {formatINR(discount)} on this order</p>
            )}
            <p className="text-[11px] text-muted-foreground text-center">Safe & secure checkout</p>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
