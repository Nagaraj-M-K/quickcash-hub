-- Create app categories enum
CREATE TYPE app_category AS ENUM ('payments', 'gaming', 'shopping', 'other');

-- Create apps table for referral apps
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category app_category NOT NULL,
  description TEXT NOT NULL,
  bonus_amount INTEGER NOT NULL,
  payout_time TEXT NOT NULL,
  task_description TEXT NOT NULL,
  referral_link TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5,2) DEFAULT 0.30,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create clicks table for tracking
CREATE TABLE public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  anonymous_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'pending',
  commission_amount DECIMAL(10,2),
  clicked_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for apps (public read)
CREATE POLICY "Apps are viewable by everyone"
  ON public.apps FOR SELECT
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for clicks
CREATE POLICY "Users can view their own clicks"
  ON public.clicks FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert clicks"
  ON public.clicks FOR INSERT
  WITH CHECK (true);

-- RLS Policies for achievements (public read)
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, threshold) VALUES
  ('First Click', 'Click your first referral link', 'MousePointerClick', 1),
  ('Starter Referrer', 'Click 5 referral links', 'Zap', 5),
  ('Active Earner', 'Click 10 referral links', 'TrendingUp', 10),
  ('Power Referrer', 'Earn ₹100 in rewards', 'Award', 100),
  ('Elite Earner', 'Earn ₹500 in rewards', 'Crown', 500);