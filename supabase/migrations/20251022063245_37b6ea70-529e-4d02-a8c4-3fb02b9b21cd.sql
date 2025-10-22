-- Fix unrestricted click insertion vulnerability
-- Drop the overly permissive policy that allows anyone to insert clicks
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;

-- Create a proper policy that ensures authenticated users can only insert their own clicks
-- or anonymous users can insert clicks with anonymous_id only
CREATE POLICY "Users can insert own clicks"
  ON public.clicks 
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL AND anonymous_id IS NOT NULL)
  );