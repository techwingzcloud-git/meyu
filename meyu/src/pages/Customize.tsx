import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Sparkles, Video, Box, Image as ImageIcon, RotateCw, Loader2 } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CUSTOM_STEPS, BASE_TYPES, FABRICS, COLORS, COLLARS, SLEEVES, FITS, SIZES,
  getColorImage, CustomConfig, StepKey,
} from "@/lib/customization";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Shirt3DViewer, AvatarGender } from "@/components/Shirt3DViewer";
import { useGender } from "@/context/GenderContext";
import { VideoConsultationModal } from "@/components/VideoConsultationModal";

const Customize = () => {
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const { gender } = useGender();
  const [stepIdx, setStepIdx] = useState(0);
  const [cfg, setCfg] = useState<Partial<CustomConfig>>({ base: "shirt" });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [autoRotate, setAutoRotate] = useState(true);
  const [avatar, setAvatar] = useState<AvatarGender>(gender === "women" ? "women" : "men");
  const [userNotes, setUserNotes] = useState("");
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);

  const step = CUSTOM_STEPS[stepIdx];
  const previewSrc = getColorImage(cfg.color || "white");

  useEffect(() => {
    COLORS.forEach(c => { const img = new Image(); img.src = c.image; });
  }, []);

  const set = (key: keyof CustomConfig, val: string) => setCfg(prev => ({ ...prev, [key]: val }));
  const canAdvance = (k: StepKey) => !!cfg[k];

  const next = () => {
    if (!canAdvance(step.key)) { toast.error(`Please choose a ${step.label.toLowerCase()}`); return; }
    if (stepIdx < CUSTOM_STEPS.length - 1) setStepIdx(i => i + 1);
  };
  const prev = () => stepIdx > 0 && setStepIdx(i => i - 1);

  const handleFinishAndConsult = async () => {
    if (!user) { toast.error("Please sign in"); nav("/login"); return; }
    for (const s of CUSTOM_STEPS) {
      if (!cfg[s.key]) {
        toast.error(`Please choose ${s.label}`);
        setStepIdx(CUSTOM_STEPS.findIndex(x => x.key === s.key));
        return;
      }
    }
    setSaving(true);
    try {
      const fab = FABRICS.find(f => f.id === cfg.fabric)!;
      // Save design (price stored backend-side only, never shown in UI)
      const totalPrice =
        (BASE_TYPES.find(b => b.id === cfg.base)?.basePrice || 0) +
        (fab.priceImpact || 0) +
        (COLLARS.find(c => c.id === cfg.collar)?.priceImpact || 0) +
        (SLEEVES.find(s => s.id === cfg.sleeve)?.priceImpact || 0) +
        ((FITS.find(f => f.id === cfg.fit) as any)?.priceImpact || 0);

      const { data: design, error: dErr } = await supabase.from("custom_designs").insert({
        user_id: user.id,
        base_type: cfg.base!,
        fabric: fab.name,
        fabric_price: fab.priceImpact,
        color: COLORS.find(c => c.id === cfg.color)!.name,
        collar: COLLARS.find(c => c.id === cfg.collar)!.label,
        sleeve: SLEEVES.find(s => s.id === cfg.sleeve)!.label,
        fit: FITS.find(f => f.id === cfg.fit)!.label,
        size: cfg.size!,
        total_price: totalPrice,
        preview_url: previewSrc,
        status: "consulting",
      }).select().single();
      if (dErr || !design) throw new Error(dErr?.message || "Failed to save design");

      // Create consultation
      const { data: consult, error: cErr } = await supabase.from("consultations").insert({
        user_id: user.id,
        custom_design_id: design.id,
        status: "waiting",
        user_notes: userNotes || null,
      }).select().single();
      if (cErr || !consult) throw new Error(cErr?.message || "Failed to create consultation");

      setConsultationId(consult.id);
      setCallOpen(true);
      toast.success("Connecting you to a designer...");
    } catch (e: any) {
      toast.error(e.message || "Could not start consultation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" /> Bespoke Atelier
          </p>
          <h1 className="font-display text-3xl md:text-5xl">Design Your Own</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Crafted to your specification. Finalize with a live designer consultation.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max md:justify-center pb-2">
            {CUSTOM_STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStepIdx(i)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-wider uppercase transition-all whitespace-nowrap",
                  i === stepIdx
                    ? "bg-primary text-primary-foreground shadow-gold"
                    : i < stepIdx || cfg[s.key]
                      ? "border border-primary/40 text-primary"
                      : "border border-border text-muted-foreground"
                )}
              >
                {(i < stepIdx || (cfg[s.key] && i !== stepIdx)) && <Check className="h-3 w-3" />}
                <span>{i + 1}. {s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_440px] gap-8">
          {/* Live preview (left) */}
          <div className="relative">
            <div className="aspect-[3/4] bg-card rounded-md overflow-hidden border border-border relative">
              {view === "3d" ? (
                <div className="absolute inset-0">
                  <Shirt3DViewer
                    colorId={cfg.color}
                    collarId={cfg.collar}
                    sleeveId={cfg.sleeve}
                    fitId={cfg.fit}
                    fabricId={cfg.fabric}
                    autoRotate={autoRotate}
                    avatar={avatar}
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10 gap-2">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-primary bg-background/70 backdrop-blur px-2 py-1 rounded-sm border border-primary/30 pointer-events-auto">
                      ✦ 360° View
                    </span>
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <div className="flex items-center gap-0.5 bg-background/70 backdrop-blur rounded-full p-0.5 border border-border">
                        {(["women", "men"] as const).map(g => (
                          <button
                            key={g}
                            onClick={() => setAvatar(g)}
                            className={cn(
                              "px-2.5 py-1 text-[9px] tracking-[0.2em] uppercase rounded-full transition-all",
                              avatar === g ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}
                          >{g}</button>
                        ))}
                      </div>
                      <button
                        onClick={() => setAutoRotate(v => !v)}
                        className={cn(
                          "h-9 w-9 rounded-full border flex items-center justify-center backdrop-blur bg-background/70 transition-all",
                          autoRotate ? "border-primary text-primary" : "border-border text-muted-foreground"
                        )}
                        aria-label="Toggle auto rotate"
                        title={autoRotate ? "Pause rotation" : "Auto rotate"}
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground bg-background/60 backdrop-blur px-2 py-1 rounded-sm pointer-events-none z-10 whitespace-nowrap">
                    Drag to look · scroll to zoom
                  </p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={previewSrc}
                      src={previewSrc}
                      alt="Preview"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  {cfg.fabric && (
                    <div
                      className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none"
                      style={{
                        background: `repeating-linear-gradient(45deg, ${FABRICS.find(f => f.id === cfg.fabric)?.swatch} 0px, transparent 2px, transparent 6px)`,
                      }}
                    />
                  )}
                </>
              )}

              {/* Bottom overlay: view toggle only (price hidden) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-end z-20 pointer-events-none">
                <div className="flex items-center gap-1 bg-background/80 backdrop-blur-md rounded-full p-1 border border-border pointer-events-auto">
                  <button
                    onClick={() => setView("3d")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all",
                      view === "3d" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Box className="h-3 w-3" /> 3D
                  </button>
                  <button
                    onClick={() => setView("2d")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all",
                      view === "2d" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <ImageIcon className="h-3 w-3" /> 2D
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Options panel (right) */}
          <div className="bg-card border border-border rounded-md p-6 md:p-8 flex flex-col">
            <h2 className="font-display text-2xl mb-1">Step {stepIdx + 1}: {step.label}</h2>
            <p className="text-xs text-muted-foreground mb-6">
              {stepIdx === CUSTOM_STEPS.length - 1
                ? "Final step — pick your size, then consult a designer."
                : "Tap a choice to continue."}
            </p>

            <div className="flex-1 min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {step.key === "base" && (
                    <div className="grid grid-cols-3 gap-3">
                      {BASE_TYPES.map(b => (
                        <OptionCard
                          key={b.id}
                          selected={cfg.base === b.id}
                          onClick={() => set("base", b.id)}
                          title={b.label}
                        />
                      ))}
                    </div>
                  )}

                  {step.key === "fabric" && (
                    <div className="space-y-2">
                      {FABRICS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => set("fabric", f.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 border rounded-md text-left transition-all",
                            cfg.fabric === f.id ? "border-primary bg-primary/5 shadow-gold" : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="h-10 w-10 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: f.swatch }} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{f.name}</p>
                          </div>
                          {cfg.fabric === f.id && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {step.key === "color" && (
                    <div className="grid grid-cols-3 gap-3">
                      {COLORS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => set("color", c.id)}
                          className={cn(
                            "p-3 border rounded-md flex flex-col items-center gap-2 transition-all",
                            cfg.color === c.id ? "border-primary bg-primary/5 shadow-gold" : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="h-12 w-12 rounded-full border-2 border-border" style={{ backgroundColor: c.hex }} />
                          <p className="text-[11px] text-center">{c.name}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {step.key === "collar" && (
                    <div className="space-y-2">
                      {COLLARS.map(c => (
                        <OptionRow key={c.id} selected={cfg.collar === c.id} onClick={() => set("collar", c.id)}
                          title={c.label}
                          subtitle={c.description}
                        />
                      ))}
                    </div>
                  )}

                  {step.key === "sleeve" && (
                    <div className="grid grid-cols-2 gap-3">
                      {SLEEVES.map(s => (
                        <OptionCard key={s.id} selected={cfg.sleeve === s.id} onClick={() => set("sleeve", s.id)}
                          title={s.label}
                        />
                      ))}
                    </div>
                  )}

                  {step.key === "fit" && (
                    <div className="space-y-2">
                      {FITS.map(f => (
                        <OptionRow key={f.id} selected={cfg.fit === f.id} onClick={() => set("fit", f.id)}
                          title={f.label}
                          subtitle={f.description}
                        />
                      ))}
                    </div>
                  )}

                  {step.key === "size" && (
                    <>
                      <div className="grid grid-cols-5 gap-2 mb-5">
                        {SIZES.map(s => (
                          <button
                            key={s}
                            onClick={() => set("size", s)}
                            className={cn(
                              "h-12 border rounded-sm font-medium transition-all",
                              cfg.size === s ? "bg-primary text-primary-foreground border-primary shadow-gold" : "border-border hover:border-primary"
                            )}
                          >{s}</button>
                        ))}
                      </div>

                      {/* Summary (no prices) */}
                      <div className="bg-background/50 rounded-md p-4 border border-border space-y-1.5 text-xs mb-4">
                        <SummaryRow label="Base" value={BASE_TYPES.find(b => b.id === cfg.base)?.label} />
                        <SummaryRow label="Fabric" value={FABRICS.find(f => f.id === cfg.fabric)?.name} />
                        <SummaryRow label="Color" value={COLORS.find(c => c.id === cfg.color)?.name} />
                        <SummaryRow label="Collar" value={COLLARS.find(c => c.id === cfg.collar)?.label} />
                        <SummaryRow label="Sleeve" value={SLEEVES.find(s => s.id === cfg.sleeve)?.label} />
                        <SummaryRow label="Fit" value={FITS.find(f => f.id === cfg.fit)?.label} />
                      </div>

                      {/* Notes for designer */}
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                          Notes for designer (optional)
                        </label>
                        <Textarea
                          value={userNotes}
                          onChange={e => setUserNotes(e.target.value)}
                          placeholder="Tell the designer about the occasion, fit preferences, or anything you'd like them to consider..."
                          className="resize-none h-20 text-sm"
                          maxLength={500}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky nav */}
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
              <Button variant="goldOutline" size="lg" onClick={prev} disabled={stepIdx === 0} className="px-3">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {stepIdx < CUSTOM_STEPS.length - 1 ? (
                <Button variant="hero" size="lg" onClick={next} className="flex-1">
                  Next: {CUSTOM_STEPS[stepIdx + 1].label} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={handleFinishAndConsult} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Video className="h-4 w-4 mr-2" />}
                  {saving ? "Connecting..." : "Finish & Consult Designer"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <VideoConsultationModal
        open={callOpen}
        consultationId={consultationId}
        userName={profile?.name || user?.email || "Customer"}
        onClose={() => setCallOpen(false)}
      />
    </MainLayout>
  );
};

const OptionCard = ({ selected, onClick, title, subtitle }: any) => (
  <button onClick={onClick}
    className={cn(
      "p-4 border rounded-md flex flex-col items-center gap-1 text-center transition-all",
      selected ? "border-primary bg-primary/5 shadow-gold" : "border-border hover:border-primary/50"
    )}>
    <p className="font-medium text-sm">{title}</p>
    {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
  </button>
);

const OptionRow = ({ selected, onClick, title, subtitle }: any) => (
  <button onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between gap-3 p-3 border rounded-md text-left transition-all",
      selected ? "border-primary bg-primary/5 shadow-gold" : "border-border hover:border-primary/50"
    )}>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

const SummaryRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || "—"}</span>
  </div>
);

export default Customize;
