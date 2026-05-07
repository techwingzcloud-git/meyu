import { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, User, Sparkles, ShirtIcon } from "lucide-react";
import { VideoConsultationModal } from "@/components/VideoConsultationModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Consult {
  id: string;
  user_id: string;
  status: string;
  user_notes: string | null;
  created_at: string;
  custom_design_id: string | null;
}

interface Design {
  id: string;
  base_type: string;
  fabric: string;
  color: string;
  collar: string;
  sleeve: string;
  fit: string;
  size: string;
  preview_url: string | null;
}

const Designer = () => {
  const { isAdmin, profile, user } = useAuth();
  const [consults, setConsults] = useState<Consult[]>([]);
  const [designs, setDesigns] = useState<Record<string, Design>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .in("status", ["waiting", "active"])
      .order("created_at", { ascending: true });
    setConsults((data as Consult[]) || []);

    const designIds = (data || []).map((c: any) => c.custom_design_id).filter(Boolean);
    if (designIds.length) {
      const { data: ds } = await supabase.from("custom_designs").select("*").in("id", designIds);
      const map: Record<string, Design> = {};
      (ds || []).forEach((d: any) => (map[d.id] = d));
      setDesigns(map);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const ch = supabase
      .channel("designer-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl mb-2">Designer Console</h1>
          <p className="text-muted-foreground">Admin access required.</p>
        </div>
      </MainLayout>
    );
  }

  const join = (id: string) => {
    setActiveId(id);
    toast.success("Joining consultation...");
  };

  return (
    <MainLayout>
      <div className="container py-10 max-w-6xl">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-2 flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Designer Console
          </p>
          <h1 className="font-display text-3xl md:text-4xl">Live Consultations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {consults.filter(c => c.status === "waiting").length} waiting · {consults.filter(c => c.status === "active").length} active
          </p>
        </div>

        {consults.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Video className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No consultations in the queue</p>
            <p className="text-xs text-muted-foreground mt-1">New requests will appear here in real-time</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {consults.map(c => {
              const d = c.custom_design_id ? designs[c.custom_design_id] : null;
              return (
                <div key={c.id} className="bg-card border border-border rounded-md p-5 flex gap-4 hover:border-primary/50 transition-all">
                  {d?.preview_url && (
                    <img src={d.preview_url} alt="" className="h-28 w-24 object-cover rounded-sm border border-border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono">{c.user_id.slice(0, 8)}</span>
                      </div>
                      <Badge variant={c.status === "waiting" ? "secondary" : "default"} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    {d && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <ShirtIcon className="h-3 w-3 text-primary" />
                        <p className="text-xs">
                          <span className="font-medium capitalize">{d.base_type}</span>
                          <span className="text-muted-foreground"> · {d.fabric} · {d.color} · {d.fit} · Size {d.size}</span>
                        </p>
                      </div>
                    )}
                    {c.user_notes && (
                      <p className="text-[11px] text-muted-foreground italic mb-2 line-clamp-2">"{c.user_notes}"</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                      <Button size="sm" variant="hero" onClick={() => join(c.id)} className="gap-1.5">
                        <Video className="h-3.5 w-3.5" /> Join
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <VideoConsultationModal
        open={!!activeId}
        consultationId={activeId}
        isDesigner
        userName={profile?.name || "Designer"}
        onClose={() => setActiveId(null)}
      />
    </MainLayout>
  );
};

export default Designer;
