-- Create referral_submissions table for user-submitted referral links
CREATE TABLE public.referral_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL,
  referral_link TEXT NOT NULL,
  bonus_amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.referral_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert submissions"
ON public.referral_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.referral_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update submissions
CREATE POLICY "Admins can update submissions"
ON public.referral_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.referral_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));