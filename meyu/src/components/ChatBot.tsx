import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useGender } from "@/context/GenderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string; products?: any[]; }

const QUICK_PROMPTS = [
  "I need a wedding outfit",
  "Suggest a casual look",
  "Show me party dresses",
  "Best formal shirt for office",
];

export const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { gender } = useGender();
  const location = useLocation();
  const nav = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgs.length === 0 && open) {
      setMsgs([{ role: "assistant", content: "Welcome to **MEYU**. I'm your personal stylist. Tell me about the occasion or vibe you're going for ✨" }]);
    }
  }, [open, msgs.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: next.map(m => ({ role: m.role, content: m.content })),
          context: { gender, route: location.pathname },
        },
      });
      if (error) throw error;
      if (data?.error) {
        setMsgs(m => [...m, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", content: data.reply, products: data.products }]);
        // Persist
        if (user) {
          await supabase.from("ai_chat_messages").insert([
            { user_id: user.id, role: "user", content: userMsg.content },
            { user_id: user.id, role: "assistant", content: data.reply },
          ]);
        }
      }
    } catch (e: any) {
      setMsgs(m => [...m, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 h-14 w-14 rounded-full bg-gold-gradient text-primary-foreground shadow-gold flex items-center justify-center transition-transform hover:scale-110",
          open && "scale-90"
        )}
        aria-label="Open stylist"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-[400px] h-[min(620px,calc(100vh-12rem))] bg-card border border-primary/30 rounded-lg shadow-elegant overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-background to-card border-b border-border p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display text-base">MEYU Stylist</p>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">AI Powered • Always on</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md border border-border"
                  )}>
                    <div className={cn("prose prose-sm max-w-none", m.role === "user" ? "prose-invert" : "prose-invert")}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {m.products.slice(0, 4).map(p => (
                          <button
                            key={p.id}
                            onClick={() => { nav(`/product/${p.id}`); setOpen(false); }}
                            className="bg-card border border-border rounded-md overflow-hidden text-left hover:border-primary transition-all"
                          >
                            <img src={p.images?.[0]} alt={p.name} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                            <div className="p-2">
                              <p className="text-[11px] font-medium line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-primary mt-0.5">{formatINR(p.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex">
                  <div className="bg-secondary border border-border rounded-2xl px-4 py-3 rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="border-t border-border p-3 flex gap-2 bg-background"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about style..."
                className="h-10 bg-card border-border focus-visible:ring-primary"
                disabled={loading}
              />
              <Button type="submit" variant="hero" size="icon" disabled={loading || !input.trim()} className="h-10 w-10 flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
