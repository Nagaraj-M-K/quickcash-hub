-- Create payouts table for managing user payouts
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  upi_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own payouts
CREATE POLICY "Users can view their own payouts"
ON public.payouts FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update payouts
CREATE POLICY "Admins can update payouts"
ON public.payouts FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- System can insert payouts (via edge function)
CREATE POLICY "System can insert payouts"
ON public.payouts FOR INSERT
WITH CHECK (true);