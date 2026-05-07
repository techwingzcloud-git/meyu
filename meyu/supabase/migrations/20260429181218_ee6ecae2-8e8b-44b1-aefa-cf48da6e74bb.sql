-- 1. Add gender to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'women';
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_category_gender ON public.products(category, gender);

-- 2. Customizations table (custom designs saved by users)
CREATE TABLE IF NOT EXISTS public.custom_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  base_type TEXT NOT NULL,            -- shirt, suit, blazer
  fabric TEXT NOT NULL,
  fabric_price NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  collar TEXT NOT NULL,
  sleeve TEXT NOT NULL,
  fit TEXT NOT NULL,
  size TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  preview_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own custom designs" ON public.custom_designs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own custom designs" ON public.custom_designs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own custom designs" ON public.custom_designs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own custom designs" ON public.custom_designs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all designs" ON public.custom_designs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Allow cart items to reference a custom design (custom items have NULL product_id)
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS custom_design_id UUID REFERENCES public.custom_designs(id) ON DELETE CASCADE;
ALTER TABLE public.cart_items ALTER COLUMN product_id DROP NOT NULL;

-- 4. Order items: allow custom items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS custom_design_id UUID;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;

-- 5. Saved addresses (multiple per user)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own addresses" ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON public.addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON public.addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON public.addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Offers
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat','percentage')),
  discount_value NUMERIC NOT NULL,
  payment_method TEXT,                -- 'upi','card','any'
  bank_name TEXT,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_discount NUMERIC,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active offers" ON public.offers FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage offers" ON public.offers FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Seed a few offers
INSERT INTO public.offers (code, title, description, discount_type, discount_value, payment_method, bank_name, min_amount, max_discount, active) VALUES
  ('MEYU10', '10% off on first order', 'Flat 10% on orders above ₹1999', 'percentage', 10, 'any', NULL, 1999, 1500, true),
  ('UPI200', '₹200 UPI Cashback', 'Pay with any UPI app and save ₹200', 'flat', 200, 'upi', NULL, 1499, NULL, true),
  ('HDFC15', '15% off with HDFC Cards', 'Up to ₹2000 off on HDFC Bank Credit Cards', 'percentage', 15, 'card', 'HDFC', 2999, 2000, true),
  ('FESTIVE25', 'Festive 25% off', 'Limited-time festive offer', 'percentage', 25, 'any', NULL, 4999, 5000, true)
ON CONFLICT (code) DO NOTHING;

-- 7. Apply offer code & payment method on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS offer_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- 8. User activity for recommendations
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view','wishlist','cart','purchase')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id, created_at DESC);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own activity" ON public.user_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users log own activity" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 9. AI chat sessions
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_user_time ON public.ai_chat_messages(user_id, created_at);
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own chats" ON public.ai_chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chats" ON public.ai_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chats" ON public.ai_chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);