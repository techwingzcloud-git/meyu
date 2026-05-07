import { motion } from "framer-motion";
import { HOME_GALLERY } from "@/lib/galleryImages";

const groups = [
  { key: "saree", title: "Sarees", items: HOME_GALLERY.saree },
  { key: "dresses", title: "Dresses", items: HOME_GALLERY.dresses },
  { key: "kurtis", title: "Kurtis", items: HOME_GALLERY.kurtis },
  { key: "tops", title: "Tops", items: HOME_GALLERY.tops },
] as const;

export const HomeImageGallery = () => {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-3">✦ The Lookbook</p>
        <h2 className="font-display text-3xl md:text-5xl">Pieces You'll Love</h2>
      </div>

      {groups.map((g) => (
        <div key={g.key} className="mb-12 last:mb-0">
          <h3 className="font-display text-xl md:text-2xl mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="px-3">{g.title}</span>
            <span className="h-px flex-1 bg-border" />
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {g.items.map((img, i) => (
              <motion.div
                key={img.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="group overflow-hidden rounded-[22px] shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/40"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};
