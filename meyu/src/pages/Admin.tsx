import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Shield, X } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatINR } from "@/lib/constants";
import { toast } from "sonner";

const empty = {
  id: "" as string | undefined,
  name: "", description: "", price: 0, original_price: null as number | null,
  category: "dresses", sizes: "S,M,L,XL", colors: "Black,Gold",
  images: "", stock: 10,
  is_new_arrival: false, is_best_seller: false, is_on_sale: false,
};

const Admin = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name || editing.price <= 0) { toast.error("Name and price required"); return; }
    setSaving(true);
    const payload = {
      name: editing.name,
      description: editing.description,
      price: editing.price,
      original_price: editing.original_price,
      category: editing.category,
      sizes: editing.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: editing.colors.split(",").map(s => s.trim()).filter(Boolean),
      images: editing.images.split(/[\n,]/).map(s => s.trim()).filter(Boolean),
      stock: editing.stock,
      is_new_arrival: editing.is_new_arrival,
      is_best_seller: editing.is_best_seller,
      is_on_sale: editing.is_on_sale,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Product updated" : "Product added");
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const startEdit = (p: any) => setEditing({
    id: p.id, name: p.name, description: p.description, price: Number(p.price),
    original_price: p.original_price ? Number(p.original_price) : null,
    category: p.category,
    sizes: (p.sizes || []).join(","), colors: (p.colors || []).join(","),
    images: (p.images || []).join("\n"), stock: p.stock,
    is_new_arrival: p.is_new_arrival, is_best_seller: p.is_best_seller, is_on_sale: p.is_on_sale,
  });

  return (
    <MainLayout>
      <div className="container py-10 md:py-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl">Admin</h1>
              <p className="text-xs text-muted-foreground">Manage MEYU catalog</p>
            </div>
          </div>
          <Button variant="hero" onClick={() => setEditing({ ...empty })}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="bg-card border border-border rounded-md overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="border-b border-border bg-secondary/50">
              <tr className="text-left">
                <th className="p-3 font-medium text-xs tracking-wider uppercase">Product</th>
                <th className="p-3 font-medium text-xs tracking-wider uppercase">Category</th>
                <th className="p-3 font-medium text-xs tracking-wider uppercase">Price</th>
                <th className="p-3 font-medium text-xs tracking-wider uppercase">Stock</th>
                <th className="p-3 font-medium text-xs tracking-wider uppercase">Tags</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || "/placeholder.svg"} alt="" className="w-10 h-12 object-cover rounded-sm" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">{formatINR(Number(p.price))}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-xs">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_new_arrival && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">New</span>}
                      {p.is_best_seller && <span className="px-2 py-0.5 bg-accent/10 text-accent rounded">Best</span>}
                      {p.is_on_sale && <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded">Sale</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(p)} className="p-2 hover:text-primary"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => del(p.id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
            <div onClick={e => e.stopPropagation()} className="bg-card border border-primary/30 rounded-md max-w-2xl w-full p-6 md:p-8 my-8">
              <div className="flex justify-between mb-6">
                <h2 className="font-display text-2xl">{editing.id ? "Edit" : "Add"} Product</h2>
                <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider">Name</Label>
                  <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider">Description</Label>
                  <Textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Price (₹)</Label>
                  <Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Original Price (optional)</Label>
                  <Input type="number" value={editing.original_price ?? ""} onChange={e => setEditing({ ...editing, original_price: e.target.value ? Number(e.target.value) : null })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Category</Label>
                  <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="mt-1.5 h-10 w-full px-3 bg-input border border-border rounded-md text-sm">
                    {CATEGORIES.filter(c => !["new-arrivals", "sale"].includes(c.slug)).map(c => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Stock</Label>
                  <Input type="number" value={editing.stock} onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Sizes (comma-separated)</Label>
                  <Input value={editing.sizes} onChange={e => setEditing({ ...editing, sizes: e.target.value })} className="mt-1.5" placeholder="S,M,L,XL" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Colors (comma-separated)</Label>
                  <Input value={editing.colors} onChange={e => setEditing({ ...editing, colors: e.target.value })} className="mt-1.5" placeholder="Black,Gold" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-wider">Image URLs (one per line)</Label>
                  <Textarea rows={3} value={editing.images} onChange={e => setEditing({ ...editing, images: e.target.value })} className="mt-1.5" placeholder="https://..." />
                </div>
                <div className="md:col-span-2 flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editing.is_new_arrival} onChange={e => setEditing({ ...editing, is_new_arrival: e.target.checked })} className="accent-primary" />
                    New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editing.is_best_seller} onChange={e => setEditing({ ...editing, is_best_seller: e.target.checked })} className="accent-primary" />
                    Best Seller
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editing.is_on_sale} onChange={e => setEditing({ ...editing, is_on_sale: e.target.checked })} className="accent-primary" />
                    On Sale
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="hero" onClick={save} disabled={saving} className="flex-1">{saving ? "Saving..." : "Save Product"}</Button>
                <Button variant="goldOutline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Admin;
