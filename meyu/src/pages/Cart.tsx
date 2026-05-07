import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/constants";

const Cart = () => {
  const { user } = useAuth();
  const { cart, cartTotal, updateQty, removeFromCart } = useShop();
  const nav = useNavigate();

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-32 text-center">
          <h2 className="font-display text-3xl mb-4">Sign in to view your bag</h2>
          <Button variant="hero" size="lg" onClick={() => nav("/login")}>Sign In</Button>
        </div>
      </MainLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="container py-32 text-center">
          <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl mb-3">Your bag is empty</h2>
          <p className="text-muted-foreground mb-8">Discover the latest MEYU drops</p>
          <Link to="/shop"><Button variant="hero" size="lg">Continue Shopping</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const shipping = cartTotal >= 2999 ? 0 : 99;
  const grand = cartTotal + shipping;

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <h1 className="font-display text-3xl md:text-5xl mb-2">Your Bag</h1>
        <p className="text-muted-foreground text-sm mb-10">{cart.length} item{cart.length > 1 ? "s" : ""}</p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-card border border-border rounded-md p-4">
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0 w-24 md:w-28 aspect-[3/4] rounded-sm overflow-hidden bg-secondary">
                  <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <Link to={`/product/${item.product_id}`} className="font-display text-base md:text-lg hover:text-primary transition-colors">
                      {item.product?.name}
                    </Link>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="inline-flex items-center border border-border rounded-sm">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="h-8 w-8 hover:bg-primary/10"><Minus className="h-3 w-3 mx-auto" /></button>
                      <span className="px-4 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="h-8 w-8 hover:bg-primary/10"><Plus className="h-3 w-3 mx-auto" /></button>
                    </div>
                    <span className="font-medium">{formatINR((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start bg-card border border-border rounded-md p-6 space-y-4">
            <h3 className="font-display text-xl mb-2">Order Summary</h3>
            <div className="hairline" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-[11px] text-primary">Add {formatINR(2999 - cartTotal)} more for free shipping</p>
            )}
            <div className="hairline" />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span className="text-gradient-gold text-xl">{formatINR(grand)}</span>
            </div>
            <Button variant="hero" size="lg" className="w-full mt-2" onClick={() => nav("/checkout")}>
              Proceed to Checkout
            </Button>
            <Link to="/shop" className="block text-center text-xs tracking-wider uppercase text-muted-foreground hover:text-primary">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
