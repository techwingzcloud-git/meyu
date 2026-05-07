import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, X, Video, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Props {
  open: boolean;
  consultationId: string | null;
  isDesigner?: boolean;
  userName?: string;
  onClose: () => void;
}

export const VideoConsultationModal = ({ open, consultationId, isDesigner, userName, onClose }: Props) => {
  const [status, setStatus] = useState<"connecting" | "waiting" | "active" | "ended" | "error">("connecting");
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  // Poll consultation row + create/join room
  useEffect(() => {
    if (!open || !consultationId) return;
    let cancelled = false;

    const setup = async () => {
      setStatus("connecting");
      setErrorMsg(null);
      try {
        // 1. fetch consultation
        const { data: consult, error: cErr } = await supabase
          .from("consultations").select("*").eq("id", consultationId).maybeSingle();
        if (cErr || !consult) throw new Error(cErr?.message || "Consultation not found");

        let roomName = consult.room_name;
        let url = consult.room_url;

        // 2. if no room yet, create one
        if (!url) {
          const { data: roomData, error: rErr } = await supabase.functions.invoke("daily-create-room", {
            body: { consultationId },
          });
          if (rErr) throw new Error(rErr.message);
          if (roomData?.mock) setMockMode(true);
          url = roomData?.room_url;
          roomName = roomData?.room_name || `mock-${consultationId.slice(0, 8)}`;
        }

        if (!url) throw new Error("Could not create video room");

        // 3. issue token
        const { data: tokenData } = await supabase.functions.invoke("daily-token", {
          body: { roomName, isOwner: !!isDesigner, userName: userName || (isDesigner ? "Designer" : "Customer") },
        });
        if (tokenData?.mock) setMockMode(true);

        if (cancelled) return;
        setRoomUrl(url);
        setToken(tokenData?.token || null);

        // 4. mark active if designer joins
        if (isDesigner) {
          await supabase.from("consultations").update({
            designer_id: (await supabase.auth.getUser()).data.user?.id,
            status: "active",
            started_at: new Date().toISOString(),
          }).eq("id", consultationId);
        }
        setStatus("active");
        startRef.current = Date.now();
      } catch (e: any) {
        if (!cancelled) {
          setErrorMsg(e.message || "Failed to start call");
          setStatus("error");
        }
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [open, consultationId, isDesigner, userName]);

  // Realtime: customer waits for designer to join
  useEffect(() => {
    if (!open || !consultationId || isDesigner) return;
    const ch = supabase
      .channel(`consult-${consultationId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "consultations", filter: `id=eq.${consultationId}` },
        (payload: any) => {
          if (payload.new?.status === "active" && status !== "active") {
            startRef.current = Date.now();
            setStatus("active");
            toast.success("Designer joined the call");
          }
          if (payload.new?.status === "completed") {
            setStatus("ended");
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [open, consultationId, isDesigner, status]);

  // Call timer
  useEffect(() => {
    if (status !== "active") return;
    const iv = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [status]);

  const handleEnd = async () => {
    if (consultationId) {
      await supabase.from("consultations").update({
        status: "completed",
        ended_at: new Date().toISOString(),
      }).eq("id", consultationId);
    }
    setStatus("ended");
    onClose();
  };

  if (!open) return null;

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Build Daily iframe URL
  const iframeSrc = roomUrl
    ? `${roomUrl}${token ? `?t=${token}` : ""}`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-5xl h-[85vh] bg-card border border-primary/30 rounded-lg overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/60 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Video className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-primary">
                  {isDesigner ? "Designer Console" : "MEYU Atelier"}
                </p>
                <p className="text-sm font-display">Live Designer Consultation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {status === "active" && (
                <span className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-mono">{fmt(elapsed)}</span>
                </span>
              )}
              {mockMode && (
                <span className="text-[10px] tracking-wider uppercase text-amber-500 border border-amber-500/40 px-2 py-0.5 rounded">
                  Demo Mode
                </span>
              )}
              <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 relative bg-black">
            {status === "connecting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-2">
                  <Sparkles className="inline h-3 w-3 mr-1" /> Connecting
                </p>
                <h3 className="font-display text-2xl mb-1">Connecting you to a designer...</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Hand-finished consultation in progress. Please allow camera & microphone access.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-display text-xl mb-2">Couldn't connect</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-sm">{errorMsg}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose}>Close</Button>
                  <Button variant="hero" onClick={() => location.reload()}>Try again</Button>
                </div>
              </div>
            )}

            {status === "ended" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">Call ended</h3>
                <p className="text-sm text-muted-foreground mb-5">Your design has been saved.</p>
                <Button variant="hero" onClick={onClose}>Done</Button>
              </div>
            )}

            {status === "active" && iframeSrc && !mockMode && (
              <iframe
                src={iframeSrc}
                allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                className="absolute inset-0 w-full h-full border-0"
                title="Video call"
              />
            )}

            {status === "active" && mockMode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
                <div className="text-center max-w-md px-6">
                  <div className="h-20 w-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2">Demo Mode</p>
                  <h3 className="font-display text-2xl mb-3">Video room ready</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your <code className="text-primary">DAILY_API_KEY</code> in backend secrets to enable real video.
                    The full call flow, designer queue, and consultation lifecycle are fully wired.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Room: <span className="font-mono text-primary">{roomUrl}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {status === "active" && (
            <div className="px-5 py-3 border-t border-border bg-background/80 backdrop-blur flex items-center justify-center gap-3">
              <Button variant="destructive" size="lg" onClick={handleEnd} className="gap-2">
                <Phone className="h-4 w-4 rotate-[135deg]" /> End Call
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
