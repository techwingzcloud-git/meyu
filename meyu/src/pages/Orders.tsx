import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-primary/20 text-primary",
  shipped: "bg-blue-500/20 text-blue-400",
  delivered: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <div className="text-center mb-12">
          <Package className="h-8 w-8 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-5xl">My Orders</h1>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-16">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            {orders.map(o => (
              <div key={o.id} className="bg-card border border-border rounded-md p-5 md:p-6">
                <div className="flex justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase">Order</p>
                    <p className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase">Placed</p>
                    <p className="text-sm">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground tracking-wider uppercase">Total</p>
                    <p className="text-sm font-medium text-primary">{formatINR(Number(o.total))}</p>
                  </div>
                  <span className={cn("px-3 h-7 inline-flex items-center rounded-full text-[10px] tracking-[0.2em] uppercase font-medium", STATUS_COLORS[o.status])}>
                    {o.status}
                  </span>
                </div>
                <div className="hairline mb-4" />
                <div className="space-y-3">
                  {o.items?.map((it: any) => (
                    <div key={it.id} className="flex gap-3 text-sm">
                      <img src={it.product_image || "/placeholder.svg"} alt="" className="w-14 h-18 object-cover rounded-sm" />
                      <div className="flex-1">
                        <p>{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty {it.quantity}{it.size && ` · ${it.size}`}{it.color && ` · ${it.color}`}
                        </p>
                      </div>
                      <span>{formatINR(Number(it.price) * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Shipping to {o.ship_city}, {o.ship_state} – {o.ship_pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
