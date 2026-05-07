CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  designer_id UUID,
  custom_design_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting',
  room_name TEXT,
  room_url TEXT,
  user_notes TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_user ON public.consultations(user_id);
CREATE INDEX idx_consultations_designer ON public.consultations(designer_id);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = designer_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users create own consultations"
  ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants update consultations"
  ON public.consultations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = designer_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER consultations_touch_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
ALTER TABLE public.consultations REPLICA IDENTITY FULL;