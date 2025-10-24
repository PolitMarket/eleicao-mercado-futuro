-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  related_id uuid
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _title text,
  _message text,
  _type text,
  _related_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (_user_id, _title, _message, _type, _related_id);
END;
$$;

-- Trigger to notify users when their bet wins/loses
CREATE OR REPLACE FUNCTION public.notify_bet_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  market_title text;
BEGIN
  -- Get market title
  SELECT title INTO market_title
  FROM public.markets
  WHERE id = NEW.market_id;

  -- Create notification
  IF NEW.won = true THEN
    PERFORM create_notification(
      NEW.user_id,
      'Aposta Vencedora! 🎉',
      'Parabéns! Você ganhou a aposta em: ' || market_title,
      'win',
      NEW.id
    );
  ELSE
    PERFORM create_notification(
      NEW.user_id,
      'Aposta Perdida',
      'Sua aposta em "' || market_title || '" não foi vencedora desta vez.',
      'loss',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for bet results
CREATE TRIGGER notify_on_bet_result
AFTER UPDATE OF resolved, won ON public.bets
FOR EACH ROW
WHEN (NEW.resolved = true AND OLD.resolved = false)
EXECUTE FUNCTION notify_bet_result();

-- Trigger to notify on deposits
CREATE OR REPLACE FUNCTION public.notify_deposit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.type = 'deposit' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Depósito Confirmado',
      'Seu depósito de ' || NEW.amount || ' créditos foi confirmado!',
      'deposit',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for deposits
CREATE TRIGGER notify_on_deposit
AFTER INSERT ON public.transactions
FOR EACH ROW
WHEN (NEW.type = 'deposit')
EXECUTE FUNCTION notify_deposit();