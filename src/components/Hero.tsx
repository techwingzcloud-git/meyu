import { ArrowRight, Sparkles } from "lucide-react";
import heroWomen from "@/assets/hero-women.jpg";
import heroMen from "@/assets/hero-men.jpg";

export function Hero() {
  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden pt-24">
      {/* Split images */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative">
          <img
            src={heroWomen}
            alt="Women's collection"
            className="h-full w-full object-cover object-top"
            width={896}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/30 to-background/80" />
        </div>
        <div className="relative">
          <img
            src={heroMen}
            alt="Men's collection"
            className="h-full w-full object-cover object-top"
            width={896}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background/60 via-background/30 to-background/80" />
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_85%)]" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-[1200px] flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/40 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary backdrop-blur-md"
          style={{ animation: "var(--animate-fade-in)" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-curated for you
        </div>
        <h1
          className="font-display text-5xl font-light leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          Style that <span className="text-gold italic">understands</span> you
        </h1>
        <p
          className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "120ms" }}
        >
          A new kind of luxury fashion experience — discover pieces tailored to your taste, mood and
          moment.
        </p>
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animation: "var(--animate-fade-up)", animationDelay: "240ms" }}
        >
          <button className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all hover:glow-gold">
            Shop Women
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="group inline-flex items-center gap-2 rounded-full border border-gold/60 px-7 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-foreground transition-all hover:bg-gold hover:text-primary-foreground">
            Shop Men
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
