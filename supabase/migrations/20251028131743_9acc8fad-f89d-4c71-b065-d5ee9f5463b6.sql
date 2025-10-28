-- Create profiles table with medical information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  blood_type TEXT,
  date_of_birth DATE,
  weight NUMERIC,
  height NUMERIC,
  allergies TEXT,
  medications TEXT,
  organ_donor BOOLEAN DEFAULT false,
  residential_address TEXT,
  permanent_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for emergency contacts
CREATE POLICY "Users can view own contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Create disaster alerts table
CREATE TABLE public.disaster_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (public read access for alerts)
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;

-- Policy for disaster alerts (everyone can read)
CREATE POLICY "Anyone can view active alerts"
  ON public.disaster_alerts FOR SELECT
  USING (active = true);

-- Create crime zones table
CREATE TABLE public.crime_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  crime_level TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crime_zones ENABLE ROW LEVEL SECURITY;

-- Policy for crime zones (everyone can read)
CREATE POLICY "Anyone can view crime zones"
  ON public.crime_zones FOR SELECT
  USING (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();