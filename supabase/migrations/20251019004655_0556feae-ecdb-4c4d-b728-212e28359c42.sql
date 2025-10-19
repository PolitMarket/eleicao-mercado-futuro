-- Create function to increment user balance atomically
CREATE OR REPLACE FUNCTION public.increment_balance(user_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET balance = balance + amount
  WHERE id = user_id;
END;
$$;