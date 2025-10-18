-- Add UPI storage and rewards tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS confirmed_earnings NUMERIC DEFAULT 0;

-- Update clicks table to support referral tracking with my_referral_link
ALTER TABLE public.clicks 
ADD COLUMN IF NOT EXISTS is_my_referral BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS app_name TEXT;

-- Create index for better performance on clicks queries
CREATE INDEX IF NOT EXISTS idx_clicks_user_status ON public.clicks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clicks_app ON public.clicks(app_id, status);

-- Add commission tracking to apps table (if not exists)
ALTER TABLE public.apps 
ADD COLUMN IF NOT EXISTS my_commission_rate NUMERIC DEFAULT 0.50;

-- Function to calculate and update earnings when click status changes
CREATE OR REPLACE FUNCTION public.update_earnings_on_click_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus_amount INTEGER;
  v_commission_rate NUMERIC;
  v_earnings NUMERIC;
BEGIN
  -- Only process when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Get app bonus amount and commission rate
    SELECT bonus_amount, 
           CASE 
             WHEN NEW.is_my_referral THEN COALESCE(my_commission_rate, 0.50)
             ELSE COALESCE(commission_rate, 0.30)
           END
    INTO v_bonus_amount, v_commission_rate
    FROM public.apps
    WHERE id = NEW.app_id;
    
    -- Calculate earnings
    v_earnings := v_bonus_amount * v_commission_rate;
    
    -- Update user's earnings (both pending and confirmed)
    UPDATE public.profiles
    SET 
      pending_earnings = COALESCE(pending_earnings, 0) + v_earnings,
      confirmed_earnings = COALESCE(confirmed_earnings, 0) + v_earnings,
      total_earnings = COALESCE(total_earnings, 0) + v_earnings
    WHERE id = NEW.user_id;
    
    -- Store commission amount in click record
    NEW.commission_amount := v_earnings;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic earnings calculation
DROP TRIGGER IF EXISTS trigger_update_earnings ON public.clicks;
CREATE TRIGGER trigger_update_earnings
  BEFORE UPDATE OF status ON public.clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_earnings_on_click_confirm();

-- RLS policies for UPI access (users can only see/update their own UPI)
CREATE POLICY "Users can update own UPI" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin access to all clicks for payout management
CREATE POLICY "Admins can view all clicks" ON public.clicks
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clicks" ON public.clicks
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.upi_id IS 'User UPI ID for Razorpay payouts (format: username@upi)';
COMMENT ON COLUMN public.profiles.confirmed_earnings IS 'Total confirmed earnings credited to user';
COMMENT ON COLUMN public.clicks.is_my_referral IS 'True if clicked via my_referral_link (50% commission), false for general link (30% commission)';