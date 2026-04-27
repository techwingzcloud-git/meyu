import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChat } from "@/components/AIChat";
import { getProduct } from "@/lib/catalog";
import { type CustomLayer, type ProductCustomization } from "@/lib/shop-context-store";
import { useShop } from "@/lib/use-shop";

export const Route = createFileRoute("/customize/$productId")({
  component: CustomizePage,
});

function CustomizePage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const product = getProduct(productId);
  const { addToCart, beginBuyNow, getCustomization, saveCustomization } = useShop();
  const existing = product ? getCustomization(product.id) : null;
  const [name, setName] = useState(existing?.name ?? "My Design");
  const [baseColor, setBaseColor] = useState(existing?.baseColor ?? "#111111");
  const [layers, setLayers] = useState<CustomLayer[]>(existing?.layers ?? []);
  const dragRef = useRef<string | null>(null);

  const previewCustomization = useMemo<ProductCustomization>(
    () => ({
      id: existing?.id ?? "preview",
      productId: product?.id ?? productId,
      name,
      baseColor,
      layers,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [baseColor, existing?.createdAt, existing?.id, layers, name, product?.id, productId],
  );

  if (!product) return null;

  const addTextLayer = () => {
    setLayers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "text",
        text: "Your text",
        x: 70,
        y: 70,
        color: "#f2d280",
        fontSize: 22,
      },
    ]);
  };

  const addImageLayer = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLayers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "image",
          src: String(reader.result),
          x: 90,
          y: 110,
          width: 90,
          height: 90,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const updateLayer = (id: string, patch: Partial<CustomLayer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as CustomLayer) : layer)),
    );
  };

  const saveDesign = async () => {
    const saved = await saveCustomization(product.id, {
      id: existing?.id,
      name,
      baseColor,
      layers,
    });
    addToCart(product, 1, saved);
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-28 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              Customize
            </div>
            <h1 className="mt-3 font-display text-3xl text-white">{product.name}</h1>
            <label className="mt-6 block">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                Design Name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/60"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                Base Color
              </span>
              <input
                type="color"
                value={baseColor}
                onChange={(event) => setBaseColor(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/15 px-3"
              />
            </label>
            <div className="mt-6 grid gap-3">
              <button
                onClick={addTextLayer}
                className="rounded-full border border-[var(--gold)]/50 py-3 text-xs uppercase tracking-[0.3em] text-[var(--gold)]"
              >
                Add Text
              </button>
              <label className="rounded-full border border-white/10 py-3 text-center text-xs uppercase tracking-[0.3em] text-white/80">
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void addImageLayer(event.target.files?.[0] ?? null)}
                />
              </label>
              <button
                onClick={saveDesign}
                className="rounded-full bg-[var(--gold)] py-3 text-xs uppercase tracking-[0.3em] text-black"
              >
                Save Design to Cart
              </button>
              <button
                onClick={async () => {
                  const saved = await saveCustomization(product.id, {
                    id: existing?.id,
                    name,
                    baseColor,
                    layers,
                  });
                  beginBuyNow(product, saved);
                  navigate({ to: "/checkout", search: { step: "address" } });
                }}
                className="rounded-full border border-white/10 py-3 text-xs uppercase tracking-[0.3em] text-white/80"
              >
                Buy Customized Product
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">
              Live Preview
            </div>
            <div className="mx-auto flex max-w-md justify-center">
              <div className="relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-black/40">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div
                  className="absolute inset-[12%_18%_12%_18%] rounded-[28px]"
                  style={{ backgroundColor: baseColor }}
                />
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onPointerDown={() => {
                      dragRef.current = layer.id;
                    }}
                    onPointerUp={() => {
                      dragRef.current = null;
                    }}
                    onPointerMove={(event) => {
                      if (dragRef.current !== layer.id) return;
                      const rect = event.currentTarget.parentElement?.getBoundingClientRect();
                      if (!rect) return;
                      updateLayer(layer.id, {
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                      });
                    }}
                    className="absolute cursor-move"
                    style={{ left: layer.x, top: layer.y }}
                  >
                    {layer.type === "text" ? (
                      <span style={{ color: layer.color, fontSize: layer.fontSize }}>
                        {layer.text}
                      </span>
                    ) : (
                      <img
                        src={layer.src}
                        alt=""
                        className="rounded-lg object-cover"
                        style={{ width: layer.width, height: layer.height }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--gold)]/20 bg-card p-6">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold)]">Layers</div>
            <div className="mt-4 space-y-4">
              {layers.length === 0 && (
                <div className="text-sm text-white/55">
                  Add text or images to start customizing.
                </div>
              )}
              {layers.map((layer) => (
                <div key={layer.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.25em] text-[var(--gold)]">
                      {layer.type}
                    </div>
                    <button
                      onClick={() =>
                        setLayers((prev) => prev.filter((item) => item.id !== layer.id))
                      }
                      className="text-xs text-white/50"
                    >
                      Remove
                    </button>
                  </div>
                  {layer.type === "text" ? (
                    <div className="mt-3 space-y-3">
                      <input
                        value={layer.text}
                        onChange={(event) => updateLayer(layer.id, { text: event.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="color"
                          value={layer.color}
                          onChange={(event) => updateLayer(layer.id, { color: event.target.value })}
                          className="h-10 rounded-xl border border-white/10 bg-black/20"
                        />
                        <input
                          type="range"
                          min={12}
                          max={48}
                          value={layer.fontSize}
                          onChange={(event) =>
                            updateLayer(layer.id, { fontSize: Number(event.target.value) })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <input
                        type="range"
                        min={40}
                        max={160}
                        value={layer.width}
                        onChange={(event) => {
                          const size = Number(event.target.value);
                          updateLayer(layer.id, { width: size, height: size });
                        }}
                      />
                      <div className="text-sm text-white/55">Drag on preview to reposition</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
