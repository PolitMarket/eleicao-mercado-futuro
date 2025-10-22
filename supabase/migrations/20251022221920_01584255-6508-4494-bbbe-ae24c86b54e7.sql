-- Add columns to track bet volumes for calculating percentages
ALTER TABLE public.markets 
ADD COLUMN IF NOT EXISTS yes_volume numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_volume numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS candidate_1_volume numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS candidate_2_volume numeric DEFAULT 0;

-- Create function to update market statistics after a bet
CREATE OR REPLACE FUNCTION public.update_market_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_type_val text;
  total_yes numeric;
  total_no numeric;
BEGIN
  -- Get market type
  SELECT market_type INTO market_type_val
  FROM public.markets
  WHERE id = NEW.market_id;

  -- Update total volume
  UPDATE public.markets
  SET total_volume = total_volume + NEW.amount
  WHERE id = NEW.market_id;

  -- Update yes/no volumes and percentages for yes_no markets
  IF market_type_val = 'yes_no' THEN
    IF NEW.prediction = true THEN
      UPDATE public.markets
      SET yes_volume = yes_volume + NEW.amount
      WHERE id = NEW.market_id;
    ELSE
      UPDATE public.markets
      SET no_volume = no_volume + NEW.amount
      WHERE id = NEW.market_id;
    END IF;

    -- Recalculate percentages
    SELECT yes_volume, no_volume INTO total_yes, total_no
    FROM public.markets
    WHERE id = NEW.market_id;

    IF (total_yes + total_no) > 0 THEN
      UPDATE public.markets
      SET yes_percentage = ROUND((total_yes / (total_yes + total_no)) * 100)
      WHERE id = NEW.market_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to update market stats on new bet
DROP TRIGGER IF EXISTS update_market_stats_on_bet ON public.bets;
CREATE TRIGGER update_market_stats_on_bet
  AFTER INSERT ON public.bets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_market_statistics();