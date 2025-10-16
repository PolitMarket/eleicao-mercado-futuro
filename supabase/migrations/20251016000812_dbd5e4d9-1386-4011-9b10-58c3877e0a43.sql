-- Add RLS policies for admins to manage bets
CREATE POLICY "Admins can view all bets"
ON public.bets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all bets"
ON public.bets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all bets"
ON public.bets
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));