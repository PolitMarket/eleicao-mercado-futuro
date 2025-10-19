-- Adicionar campos para armazenar tipo de aposta e candidatos
ALTER TABLE public.markets
ADD COLUMN market_type TEXT DEFAULT 'yes_no' CHECK (market_type IN ('yes_no', 'candidates')),
ADD COLUMN candidate_1_name TEXT,
ADD COLUMN candidate_2_name TEXT;