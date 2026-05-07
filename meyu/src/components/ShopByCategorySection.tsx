import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HOME_CATEGORIES } from "@/lib/galleryImages";

export const ShopByCategorySection = () => {
  const [active, setActive] = useState<string | null>(null);
  const activeCat = HOME_CATEGORIES.find((c) => c.slug === active);

  return (
    <section className="container py-20 md:py-28">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">✦ Explore</p>
        <h2 className="font-display text-3xl md:text-5xl">Shop by Category</h2>
        <p className="text-sm text-muted-foreground mt-3">Tap a category to preview the collection</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
        {HOME_CATEGORIES.map((c, i) => {
          const isActive = active === c.slug;
          return (
            <motion.button
              key={c.slug}
              type="button"
              onClick={() => setActive(isActive ? null : c.slug)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex flex-col items-center text-center focus:outline-none rounded-[24px] p-3 transition-all duration-300 ${
                isActive
                  ? "ring-2 ring-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)]"
                  : "hover:shadow-xl"
              }`}
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-full border border-border shadow-md group-hover:shadow-2xl transition-all duration-500">
                <img
                  src={c.cover}
                  alt={c.label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="mt-3 font-display text-sm md:text-base tracking-wide group-hover:text-primary transition-colors">
                {c.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeCat && (
          <motion.div
            key={activeCat.slug}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-12">
              <h3 className="font-display text-2xl md:text-3xl text-center mb-6">
                {activeCat.label} Collection
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
                {activeCat.images.map((img, i) => (
                  <motion.div
                    key={img.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group overflow-hidden rounded-[22px] shadow-lg hover:shadow-2xl transition-all duration-500"
                    style={{ aspectRatio: "4 / 5" }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
