import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SelectState = () => {
  const { user, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!selected || !user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ state: selected, onboarded: true })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success(`Welcome from ${selected}`);
    nav("/");
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(46_65%_52%/0.1),transparent_60%)]" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-cinzel text-3xl text-gradient-gold mb-2">MEYU</h1>
          <h2 className="font-display text-3xl md:text-5xl mb-3">Where in India are you?</h2>
          <p className="text-muted-foreground">We'll personalise your experience to your region</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
          {INDIAN_STATES.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.4) }}
              onClick={() => setSelected(s)}
              className={cn(
                "relative p-4 text-left rounded-md border transition-all duration-300 group",
                selected === s
                  ? "border-primary bg-primary/10 shadow-gold"
                  : "border-border bg-card hover:border-primary/60 hover:bg-card/80"
              )}
            >
              <MapPin className={cn(
                "h-4 w-4 mb-2 transition-colors",
                selected === s ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              <p className="text-sm font-medium leading-tight">{s}</p>
              {selected === s && (
                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="hero"
            size="xl"
            disabled={!selected || saving}
            onClick={save}
          >
            {saving ? "Saving..." : "Continue to MEYU"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectState;
