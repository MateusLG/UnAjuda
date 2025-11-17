-- Add headline/short description field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS headline TEXT;