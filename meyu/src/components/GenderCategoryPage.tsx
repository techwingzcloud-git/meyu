import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";

type Cat = {
  slug: string;
  label: string;
  cover: string;
  images: { src: string; alt: string; name: string }[];
};

interface Props {
  title: string;
  subtitle: string;
  categories: Cat[];
}

export const GenderCategoryPage = ({ title, subtitle, categories }: Props) => {
  const [active, setActive] = useState<string>(categories[0].slug);
  const activeCat = useMemo(
    () => categories.find((c) => c.slug === active) ?? categories[0],
    [active, categories]
  );

  // Bottom gallery: minimum 20 unique images aggregated from categories
  const bottomImages = useMemo(
    () => categories.flatMap((c) => c.images).slice(0, 24),
    [categories]
  );

  return (
    <MainLayout>
      <section className="container pt-28 md:pt-32 pb-10">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">✦ {subtitle}</p>
          <h1 className="font-display text-4xl md:text-6xl">{title}</h1>
        </div>

        {/* Round category frames */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-4 md:gap-5">
          {categories.map((c, i) => {
            const isActive = active === c.slug;
            return (
              <motion.button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: [0, -6, 0],
                }}
                transition={{
                  opacity: { delay: i * 0.05, duration: 0.4 },
                  y: { repeat: Infinity, duration: 3 + (i % 4) * 0.4, ease: "easeInOut", delay: i * 0.1 },
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`group flex flex-col items-center focus:outline-none ${
                  isActive ? "" : ""
                }`}
              >
                <div
                  className={`relative w-full aspect-square rounded-full overflow-hidden border-2 shadow-lg transition-all duration-500 ${
                    isActive
                      ? "border-primary shadow-[0_0_25px_-3px_hsl(var(--primary)/0.7)]"
                      : "border-border group-hover:border-primary/60 group-hover:shadow-2xl"
                  }`}
                >
                  <img
                    src={c.cover}
                    alt={c.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <span className="mt-2 text-[11px] md:text-sm font-display tracking-wide text-center group-hover:text-primary transition-colors">
                  {c.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Active category preview (5 images) */}
      <section className="container py-8">
        <h2 className="font-display text-2xl md:text-3xl mb-6 text-center">
          {activeCat.label}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5"
          >
            {activeCat.images.map((img, i) => (
              <motion.div
                key={img.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
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
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom gallery (min 20 images) */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">✦ Featured Looks</p>
          <h2 className="font-display text-3xl md:text-5xl">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {bottomImages.map((img, i) => (
            <motion.div
              key={img.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 8) * 0.04, duration: 0.5 }}
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
      </section>
    </MainLayout>
  );
};
