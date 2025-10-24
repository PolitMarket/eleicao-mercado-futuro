-- Add result field to markets table to store the outcome
ALTER TABLE public.markets
ADD COLUMN result boolean;

-- Add fields to bets table to track resolution
ALTER TABLE public.bets
ADD COLUMN resolved boolean DEFAULT false,
ADD COLUMN won boolean;

-- Create function to resolve a market
CREATE OR REPLACE FUNCTION public.resolve_market(
  _market_id uuid,
  _result boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  bet_record RECORD;
  winning_amount numeric;
BEGIN
  -- Update market status and result
  UPDATE public.markets
  SET status = 'resolved',
      result = _result,
      updated_at = now()
  WHERE id = _market_id;

  -- Process all bets for this market
  FOR bet_record IN 
    SELECT id, user_id, amount, prediction
    FROM public.bets
    WHERE market_id = _market_id
      AND resolved = false
  LOOP
    -- Check if bet won
    IF bet_record.prediction = _result THEN
      -- Calculate winning amount (bet amount + profit)
      SELECT amount INTO winning_amount
      FROM public.bets
      WHERE id = bet_record.id;
      
      -- Get market data to calculate payout
      DECLARE
        market_yes_pct numeric;
        payout_multiplier numeric;
        total_payout numeric;
      BEGIN
        SELECT yes_percentage INTO market_yes_pct
        FROM public.markets
        WHERE id = _market_id;
        
        -- Calculate payout multiplier based on odds
        IF _result = true THEN
          payout_multiplier := 100.0 / market_yes_pct;
        ELSE
          payout_multiplier := 100.0 / (100 - market_yes_pct);
        END IF;
        
        total_payout := winning_amount * payout_multiplier;
        
        -- Credit user balance
        UPDATE public.profiles
        SET balance = balance + total_payout
        WHERE id = bet_record.user_id;
        
        -- Record transaction
        INSERT INTO public.transactions (user_id, amount, type, description)
        VALUES (
          bet_record.user_id,
          total_payout,
          'win',
          'Ganhou aposta no mercado'
        );
      END;
      
      -- Mark bet as won
      UPDATE public.bets
      SET resolved = true,
          won = true
      WHERE id = bet_record.id;
    ELSE
      -- Mark bet as lost
      UPDATE public.bets
      SET resolved = true,
          won = false
      WHERE id = bet_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Add RLS policy for inserting transactions (for the resolve function)
CREATE POLICY "System can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);