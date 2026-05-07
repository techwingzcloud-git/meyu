import { useEffect, useState } from "react";
import { User, MapPin } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { INDIAN_STATES } from "@/lib/constants";
import { toast } from "sonner";

const Account = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", state: "", address_line: "", city: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || "", phone: profile.phone || "",
      state: profile.state || "", address_line: profile.address_line || "",
      city: profile.city || "", pincode: profile.pincode || "",
    });
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile updated");
  };

  return (
    <MainLayout>
      <div className="container py-10 md:py-16 max-w-2xl">
        <div className="text-center mb-10">
          <User className="h-8 w-8 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-5xl">My Account</h1>
          <p className="text-muted-foreground text-sm mt-2">{user?.email}</p>
        </div>

        <div className="bg-card border border-border rounded-md p-6 md:p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs tracking-wider uppercase">Full Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">State</Label>
              <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                className="mt-1.5 h-11 w-full px-3 bg-input border border-border rounded-md text-sm focus:outline-none focus:border-primary">
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs tracking-wider uppercase flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Default Address
              </Label>
              <Input value={form.address_line} onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))} className="mt-1.5 h-11" placeholder="House no, street, area" />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">City</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Pincode</Label>
              <Input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="mt-1.5 h-11" />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="hero" onClick={save} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="goldOutline" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
