-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create urls table
CREATE TABLE public.urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create url_clicks table (matching your schema)
CREATE TABLE public.url_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID REFERENCES public.urls(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_urls_user_id ON public.urls(user_id);
CREATE INDEX idx_urls_short_code ON public.urls(short_code);
CREATE INDEX idx_url_clicks_url_id ON public.url_clicks(url_id);
CREATE INDEX idx_url_clicks_clicked_at ON public.url_clicks(clicked_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for urls
CREATE POLICY "Users can view own urls" ON public.urls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own urls" ON public.urls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own urls" ON public.urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own urls" ON public.urls
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for url_clicks
CREATE POLICY "Users can view clicks for their urls" ON public.url_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.urls 
      WHERE urls.id = url_clicks.url_id 
      AND urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert clicks" ON public.url_clicks
  FOR INSERT WITH CHECK (true);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();