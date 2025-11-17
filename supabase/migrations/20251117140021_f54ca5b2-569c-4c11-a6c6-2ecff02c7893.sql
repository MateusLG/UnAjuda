-- Create answer_replies table for nested discussions
CREATE TABLE public.answer_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.answer_replies ENABLE ROW LEVEL SECURITY;

-- Everyone can view replies
CREATE POLICY "Anyone can view answer replies"
ON public.answer_replies
FOR SELECT
USING (true);

-- Question owner can reply to answers on their question
CREATE POLICY "Question owner can reply to answers"
ON public.answer_replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.answers a
    JOIN public.questions q ON a.question_id = q.id
    WHERE a.id = answer_id
    AND q.user_id = auth.uid()
  )
);

-- Answer owner can reply to their own answer
CREATE POLICY "Answer owner can reply to their answer"
ON public.answer_replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.answers a
    WHERE a.id = answer_id
    AND a.user_id = auth.uid()
  )
);

-- Users can update their own replies
CREATE POLICY "Users can update their own replies"
ON public.answer_replies
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete their own replies"
ON public.answer_replies
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_answer_replies_updated_at
BEFORE UPDATE ON public.answer_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.answer_replies;