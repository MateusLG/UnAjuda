-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
ON public.badges
FOR SELECT
USING (true);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges
FOR SELECT
USING (true);

-- Function to create notification for new answer
CREATE OR REPLACE FUNCTION public.notify_question_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_owner_id UUID;
  question_title TEXT;
BEGIN
  -- Get question owner and title
  SELECT user_id, title INTO question_owner_id, question_title
  FROM questions
  WHERE id = NEW.question_id;
  
  -- Don't notify if answering own question
  IF question_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      question_owner_id,
      'answer',
      'Nova resposta na sua pergunta',
      'Sua pergunta "' || question_title || '" recebeu uma nova resposta',
      '/pergunta/' || NEW.question_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_answer_created
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_question_owner();

-- Function to create notification for vote on answer
CREATE OR REPLACE FUNCTION public.notify_answer_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  answer_owner_id UUID;
  question_id_var UUID;
BEGIN
  -- Only notify on upvotes
  IF NEW.vote_type = 1 AND NEW.answer_id IS NOT NULL THEN
    SELECT user_id, answers.question_id INTO answer_owner_id, question_id_var
    FROM answers
    WHERE id = NEW.answer_id;
    
    -- Don't notify if voting own answer
    IF answer_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        answer_owner_id,
        'vote',
        'Sua resposta recebeu um voto positivo',
        'Alguém achou sua resposta útil!',
        '/pergunta/' || question_id_var
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_answer_vote();

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_count) VALUES
('Primeira Resposta', 'Respondeu sua primeira pergunta', 'MessageSquare', 'answers', 1),
('Respondedor Ativo', 'Respondeu 10 perguntas', 'MessageSquare', 'answers', 10),
('Expert', 'Respondeu 50 perguntas', 'Award', 'answers', 50),
('Resposta Útil', 'Recebeu 5 votos positivos', 'ThumbsUp', 'helpful_votes', 5),
('Muito Útil', 'Recebeu 25 votos positivos', 'ThumbsUp', 'helpful_votes', 25),
('Resposta Aceita', 'Teve uma resposta aceita como melhor', 'CheckCircle', 'accepted_answers', 1),
('Solucionador', 'Teve 5 respostas aceitas', 'Trophy', 'accepted_answers', 5);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;