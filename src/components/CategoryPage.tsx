import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRef } from "react";

export type CategoryItem = {
  name: string;
  image: string;
  badge?: string;
};

export type CategorySection = {
  title: string;
  subtitle?: string;
  items: CategoryItem[];
  cols?: 2 | 3 | 4 | 5;
};

export type FabricItem = {
  name: string;
  image: string;
};

type Props = {
  pageTitle: string;
  pageKicker: string;
  pageBlurb: string;
  breadcrumb: string;
  gender: "women" | "men";
  shopMenu: CategoryItem[];
  featured?: CategoryItem[];
  sections: CategorySection[];
  fabrics?: FabricItem[];
};

function toCategorySearch(gender: "women" | "men", name: string) {
  const broadCategories = new Set([
    "Shop All",
    "Shirts",
    "T-Shirts",
    "Ethnic Wear",
    "Bottom Wear",
    "Outerwear",
  ]);
  return broadCategories.has(name) ? { gender } : { gender, category: name };
}

export function CategoryPage({
  pageTitle,
  pageKicker,
  pageBlurb,
  breadcrumb,
  gender,
  shopMenu,
  featured,
  sections,
  fabrics,
}: Props) {
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.005_60)] text-white">
      <section className="relative overflow-hidden border-b border-[var(--gold)]/20">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(900px 320px at 50% 0%, oklch(0.3 0.08 75 / 0.3), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 pt-24 lg:px-10 lg:pt-28">
          <nav
            className="flex items-center gap-2 text-xs text-white/60 opacity-0 animate-[fade-in_0.5s_ease-out_0.05s_forwards]"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="transition-colors hover:text-[var(--gold)]">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-white/40" />
            <span className="text-[var(--gold)]">{breadcrumb}</span>
          </nav>

          <div className="pb-12 pt-8 text-center md:pb-16 md:pt-12">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-[var(--gold)] opacity-0 animate-[fade-in_0.6s_ease-out_0.1s_forwards]">
              <Sparkles className="h-3 w-3" />
              {pageKicker}
            </div>
            <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-[0.08em] md:text-7xl opacity-0 animate-[fade-up_0.7s_ease-out_0.2s_forwards] bg-gradient-to-r from-white via-[oklch(0.92_0.06_85)] to-[var(--gold)] bg-clip-text text-transparent">
              {pageTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 opacity-0 animate-[fade-in_0.7s_ease-out_0.35s_forwards] md:text-base">
              {pageBlurb}
            </p>
            <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-0 animate-[fade-in_0.7s_ease-out_0.5s_forwards]" />
          </div>
        </div>
      </section>

      <CircleScroller items={shopMenu} gender={gender} />

      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-4 pt-12 lg:px-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">
                Premium Collection
              </div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">Featured Categories</h2>
            </div>
            <Link
              to="/products"
              search={{ gender }}
              className="hidden items-center gap-1 text-xs uppercase tracking-[0.25em] text-[var(--gold)] transition-colors hover:text-white md:inline-flex"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.map((c, i) => (
              <FeaturedCard key={c.name} item={c} index={i} gender={gender} />
            ))}
          </div>
        </section>
      )}

      {sections.map((sec, idx) => (
        <SectionGrid key={sec.title} section={sec} sectionIndex={idx} gender={gender} />
      ))}

      {fabrics && fabrics.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-8 lg:px-10">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="font-display text-2xl uppercase tracking-[0.15em] text-[var(--gold)] md:text-3xl">
              Shop By Fabric
            </h3>
          </div>
          <FabricScroller items={fabrics} />
        </section>
      )}
    </div>
  );
}

/* ------------ Circle scrollers ------------ */

function CircleScroller({ items, gender }: { items: CategoryItem[]; gender: "women" | "men" }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 pt-2 lg:px-10">
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-black/70 text-[var(--gold)] backdrop-blur transition-all hover:scale-110 hover:border-[var(--gold)] hover:shadow-[0_0_15px_-2px_var(--gold)] md:inline-flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollerRef}
        className="flex justify-start gap-8 overflow-x-auto px-2 pb-6 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {items.map((c, i) => (
          <CircleCategory key={c.name} item={c} index={i} gender={gender} />
        ))}
      </div>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-black/70 text-[var(--gold)] backdrop-blur transition-all hover:scale-110 hover:border-[var(--gold)] hover:shadow-[0_0_15px_-2px_var(--gold)] md:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}

function FabricScroller({ items }: { items: FabricItem[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto pb-2 pr-12 [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((f, i) => (
          <FabricCircle key={f.name} item={f} index={i} />
        ))}
      </div>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--gold)]/50 bg-black/70 text-[var(--gold)] backdrop-blur transition-all hover:scale-110 hover:border-[var(--gold)] hover:shadow-[0_0_15px_-2px_var(--gold)] md:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function CircleCategory({
  item,
  index,
  gender,
}: {
  item: CategoryItem;
  index: number;
  gender: "women" | "men";
}) {
  return (
    <Link
      to="/products"
      search={toCategorySearch(gender, item.name)}
      className="group flex shrink-0 flex-col items-center gap-3 opacity-0"
      style={{
        animation: `fade-in 0.5s ease-out ${0.05 * index + 0.1}s forwards`,
      }}
    >
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[var(--gold)] via-[oklch(0.78_0.13_75)] to-[oklch(0.55_0.13_45)] opacity-60 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-md" />
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--gold)]/70 bg-[oklch(0.16_0.01_60)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.08] group-hover:border-[var(--gold)] group-hover:shadow-[0_10px_30px_-8px_var(--gold)] md:h-32 md:w-32">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={256}
            height={256}
            className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>
      <span className="text-[11px] uppercase tracking-[0.25em] text-white/85 transition-colors group-hover:text-[var(--gold)]">
        {item.name}
      </span>
    </Link>
  );
}

function FabricCircle({ item, index }: { item: FabricItem; index: number }) {
  return (
    <button
      className="group flex shrink-0 flex-col items-center gap-2 opacity-0"
      style={{ animation: `fade-in 0.5s ease-out ${0.04 * index}s forwards` }}
    >
      <div className="relative h-20 w-20 md:h-24 md:w-24">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[var(--gold)] to-[oklch(0.55_0.13_45)] opacity-60 blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--gold)]/70 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_24px_-8px_var(--gold)]">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em] text-white/80 transition-colors group-hover:text-[var(--gold)]">
        {item.name}
      </span>
    </button>
  );
}

/* ------------ Featured & Section cards ------------ */

function FeaturedCard({
  item,
  index,
  gender,
}: {
  item: CategoryItem;
  index: number;
  gender: "women" | "men";
}) {
  return (
    <Link
      to="/products"
      search={toCategorySearch(gender, item.name)}
      className="group relative overflow-hidden rounded-3xl p-[1.5px] opacity-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_var(--gold)]"
      style={{ animation: `fade-in 0.6s ease-out ${0.08 * index + 0.1}s forwards` }}
    >
      <div
        className="absolute inset-0 rounded-3xl opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div className="relative overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-[oklch(0.1_0.005_60)]">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={768}
            height={960}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-black/70 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] shadow-[0_8px_30px_-8px_var(--gold)]">
              View Collection <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between">
            <div className="font-display text-xl uppercase tracking-wide text-white md:text-2xl">
              {item.name}
            </div>
            {item.badge && (
              <span className="rounded-full border border-[var(--gold)]/60 bg-black/60 px-2.5 py-1 text-[9px] uppercase tracking-wider text-[var(--gold)] backdrop-blur">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionGrid({
  section,
  sectionIndex,
  gender,
}: {
  section: CategorySection;
  sectionIndex: number;
  gender: "women" | "men";
}) {
  const cols = section.cols ?? 5;
  const gridClass =
    cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 3
        ? "grid-cols-2 md:grid-cols-3"
        : cols === 4
          ? "grid-cols-2 md:grid-cols-4"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
      <div
        className="mb-6 flex items-end justify-between border-t border-[var(--gold)]/15 pt-8 opacity-0"
        style={{ animation: `fade-up 0.6s ease-out ${0.05 * sectionIndex}s forwards` }}
      >
        <h3 className="font-display text-2xl uppercase tracking-[0.15em] text-[var(--gold)] md:text-3xl">
          {section.title}
        </h3>
        <Link
          to="/products"
          search={{ gender }}
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-[var(--gold)] transition-colors hover:text-white"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className={`grid gap-4 md:gap-6 ${gridClass}`}>
        {section.items.map((it, i) => (
          <SectionCard key={it.name} item={it} index={i} gender={gender} />
        ))}
      </div>
    </section>
  );
}

function SectionCard({
  item,
  index,
  gender,
}: {
  item: CategoryItem;
  index: number;
  gender: "women" | "men";
}) {
  return (
    <Link
      to="/products"
      search={toCategorySearch(gender, item.name)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--gold)]/40 bg-[oklch(0.13_0.008_60)] opacity-0 shadow-[0_10px_30px_-15px_oklch(0.05_0_0/0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[0_20px_45px_-15px_var(--gold)]"
      style={{ animation: `fade-in 0.5s ease-out ${0.06 * index}s forwards` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={768}
          height={960}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

        {/* Bottom label bar with arrow circle */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4 pt-10">
          <div className="font-display text-base uppercase tracking-[0.18em] text-[var(--gold)] md:text-lg">
            {item.name}
          </div>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--gold)]/70 bg-black/70 text-[var(--gold)] backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-black group-hover:shadow-[0_0_15px_-2px_var(--gold)]">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {item.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-[var(--gold)]/60 bg-black/70 px-2.5 py-1 text-[9px] uppercase tracking-wider text-[var(--gold)] backdrop-blur">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}
