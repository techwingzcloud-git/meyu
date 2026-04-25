import { useState } from "react";
import { categories } from "@/lib/catalog";

export function CategoryCircles() {
  const [tab, setTab] = useState<"women" | "men">("women");
  const list = categories[tab];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <div className="text-[10px] uppercase tracking-[0.4em] text-primary">Curated Edits</div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Shop by Category</h2>

          <div className="mt-8 inline-flex rounded-full border border-border bg-secondary/60 p-1">
            {(["women", "men"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-6 py-2 text-xs uppercase tracking-[0.25em] transition-all ${
                  tab === t
                    ? "bg-gold text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 -mx-6 flex gap-8 overflow-x-auto px-6 pb-4 md:justify-center md:gap-14">
          {list.map((c, i) => {
            const featured = i === Math.floor(list.length / 2);
            return (
              <button key={c.name} className="group flex flex-shrink-0 flex-col items-center">
                <div
                  className={`relative overflow-hidden rounded-full border transition-all duration-500 ${
                    featured ? "h-52 w-52 border-gold" : "h-44 w-44 border-border"
                  } group-hover:border-gold group-hover:glow-gold`}
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>
                <div className="mt-5 text-sm uppercase tracking-[0.25em] text-foreground/85 transition-colors group-hover:text-primary">
                  {c.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
