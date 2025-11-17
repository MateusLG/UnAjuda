-- Drop the existing public policy
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;

-- Create new policy: Only authenticated users can view votes
CREATE POLICY "Authenticated users can view votes"
ON public.votes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Keep the existing policies for insert and delete
-- Users can still only create/delete their own votes