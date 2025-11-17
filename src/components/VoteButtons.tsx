import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  questionId?: string;
  answerId?: string;
  onVoteChange?: () => void;
}

const VoteButtons = ({ questionId, answerId, onVoteChange }: VoteButtonsProps) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<number | null>(null);

  useEffect(() => {
    fetchVotes();
    if (user) {
      fetchUserVote();
    }
  }, [questionId, answerId, user]);

  const fetchVotes = async () => {
    const filter: any = {};
    if (questionId) filter.question_id = questionId;
    if (answerId) filter.answer_id = answerId;

    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .match(filter);

    if (data) {
      setUpvotes(data.filter(v => v.vote_type === 1).length);
      setDownvotes(data.filter(v => v.vote_type === -1).length);
    }
  };

  const fetchUserVote = async () => {
    if (!user) return;

    const filter: any = { user_id: user.id };
    if (questionId) filter.question_id = questionId;
    if (answerId) filter.answer_id = answerId;

    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .match(filter)
      .maybeSingle();

    if (data) {
      setUserVote(data.vote_type);
    }
  };

  const handleVote = async (voteType: number) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar",
        variant: "destructive",
      });
      return;
    }

    const filter: any = { user_id: user.id };
    if (questionId) filter.question_id = questionId;
    if (answerId) filter.answer_id = answerId;

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .match(filter)
      .maybeSingle();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        setUserVote(null);
      } else {
        // Update vote if clicking different button
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        setUserVote(voteType);
      }
    } else {
      // Create new vote
      const insertData: any = {
        user_id: user.id,
        vote_type: voteType,
      };
      if (questionId) insertData.question_id = questionId;
      if (answerId) insertData.answer_id = answerId;

      await supabase
        .from('votes')
        .insert(insertData);
      setUserVote(voteType);
    }

    fetchVotes();
    if (onVoteChange) onVoteChange();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(1)}
        className="gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        {upvotes}
      </Button>
      <Button
        variant={userVote === -1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote(-1)}
        className="gap-1"
      >
        <ThumbsDown className="h-4 w-4" />
        {downvotes}
      </Button>
    </div>
  );
};

export default VoteButtons;
