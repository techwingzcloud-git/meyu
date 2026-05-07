import { useState } from "react";
import { Sparkles, Send, Minus } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const seed: Msg[] = [
  {
    role: "ai",
    text: 'Hi, I\'m your MEYU assistant ✨\n\nTry: "Men black shirt under ₹1500" or "Women party dress in Chennai".',
  },
];

const quickActions = ["Trending now", "Party wear", "Under ₹2000", "Festive picks"];

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const expand = () => {
    setOpen(true);
    setHasNew(false);
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      {
        role: "ai",
        text: `Curating picks for "${q}" — here are 4 styles matched to your taste ✨`,
      },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Minimized floating button */}
      <button
        onClick={expand}
        aria-label="Open AI assistant"
        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-[var(--shadow-gold)] ring-2 ring-gold/40 transition-all duration-300 hover:scale-105 ${
          open ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ animation: open ? undefined : "var(--animate-float)" }}
      >
        <Sparkles className="h-6 w-6" />
        {hasNew && (
          <span className="absolute right-1 top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
          </span>
        )}
      </button>

      {/* Expanded chat panel */}
      <div
        className={`absolute bottom-0 right-0 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl glass-dark shadow-[var(--shadow-elegant)] ring-1 ring-gold/30 transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-medium">MEYU Assistant</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Online</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Minimize"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-foreground transition-colors hover:bg-gold/10"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gold text-primary-foreground"
                    : "border border-gold/20 bg-background/50 text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gold/20 p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {quickActions.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="rounded-full border border-gold/30 bg-background/40 px-2.5 py-1 text-[11px] text-foreground/80 transition-colors hover:border-gold hover:bg-gold/10"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(input)}
              placeholder="Ask MEYU…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              onClick={() => ask(input)}
              className="rounded-full bg-gold p-1.5 text-primary-foreground transition-transform hover:scale-110"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
