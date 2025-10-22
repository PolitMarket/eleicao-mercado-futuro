-- Recalcular todos os volumes e porcentagens dos mercados existentes
UPDATE public.markets m
SET 
  yes_volume = COALESCE((
    SELECT SUM(b.amount)
    FROM public.bets b
    WHERE b.market_id = m.id AND b.prediction = true
  ), 0),
  no_volume = COALESCE((
    SELECT SUM(b.amount)
    FROM public.bets b
    WHERE b.market_id = m.id AND b.prediction = false
  ), 0),
  total_volume = COALESCE((
    SELECT SUM(b.amount)
    FROM public.bets b
    WHERE b.market_id = m.id
  ), 0);

-- Recalcular porcentagens baseado nos volumes
UPDATE public.markets
SET yes_percentage = CASE 
  WHEN (yes_volume + no_volume) > 0 
  THEN ROUND((yes_volume::numeric / (yes_volume + no_volume)) * 100)
  ELSE 50
END
WHERE market_type = 'yes_no';