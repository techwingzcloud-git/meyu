import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface CustomDesignSummary {
  id: string;
  base_type: string;
  fabric: string;
  color: string;
  collar: string;
  sleeve: string;
  fit: string;
  size: string;
  total_price: number;
  preview_url: string | null;
}

export interface CartItem {
  id: string;
  product_id: string | null;
  custom_design_id: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
  custom_design?: CustomDesignSummary;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product?: any;
}

interface ShopCtx {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: string, opts?: { size?: string; color?: string; quantity?: number }) => Promise<void>;
  addCustomToCart: (designId: string, opts?: { size?: string; color?: string }) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  inWishlist: (productId: string) => boolean;
  refresh: () => Promise<void>;
  logActivity: (productId: string, action: "view" | "wishlist" | "cart" | "purchase") => Promise<void>;
}

const Ctx = createContext<ShopCtx | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart([]); setWishlist([]); return;
    }
    setLoading(true);
    const [{ data: c }, { data: w }] = await Promise.all([
      supabase.from("cart_items")
        .select("*, product:products(id,name,price,images,stock), custom_design:custom_designs(id,base_type,fabric,color,collar,sleeve,fit,size,total_price,preview_url)")
        .eq("user_id", user.id),
      supabase.from("wishlist_items")
        .select("*, product:products(id,name,price,images,stock,category)")
        .eq("user_id", user.id),
    ]);
    setCart((c || []) as any);
    setWishlist((w || []) as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const logActivity: ShopCtx["logActivity"] = async (productId, action) => {
    if (!user) return;
    await supabase.from("user_activity").insert({ user_id: user.id, product_id: productId, action });
  };

  const addToCart: ShopCtx["addToCart"] = async (productId, opts = {}) => {
    if (!user) { toast.error("Please sign in"); return; }
    const { size = null, color = null, quantity = 1 } = opts;
    const existing = cart.find(i => i.product_id === productId && i.size === size && i.color === color);
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, size, color, quantity });
    }
    await logActivity(productId, "cart");
    toast.success("Added to bag");
    refresh();
  };

  const addCustomToCart: ShopCtx["addCustomToCart"] = async (designId, opts = {}) => {
    if (!user) { toast.error("Please sign in"); return; }
    const { size = null, color = null } = opts;
    await supabase.from("cart_items").insert({
      user_id: user.id, custom_design_id: designId, product_id: null, size, color, quantity: 1
    });
    toast.success("Custom design added to bag");
    refresh();
  };

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    refresh();
  };

  const removeFromCart = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    refresh();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    refresh();
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    const existing = wishlist.find(w => w.product_id === productId);
    if (existing) {
      await supabase.from("wishlist_items").delete().eq("id", existing.id);
      toast("Removed from wishlist");
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      await logActivity(productId, "wishlist");
      toast.success("Saved to wishlist");
    }
    refresh();
  };

  const inWishlist = (pid: string) => wishlist.some(w => w.product_id === pid);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;
  const cartTotal = cart.reduce((s, i) => {
    if (i.custom_design) return s + (i.custom_design.total_price || 0) * i.quantity;
    return s + (i.product?.price || 0) * i.quantity;
  }, 0);

  return (
    <Ctx.Provider value={{
      cart, wishlist, cartCount, wishlistCount, cartTotal, loading,
      addToCart, addCustomToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, inWishlist, refresh, logActivity,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useShop = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used within ShopProvider");
  return v;
};
