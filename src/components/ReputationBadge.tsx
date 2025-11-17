import { Badge } from "@/components/ui/badge";
import { Trophy, ThumbsUp, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateReputation, getReputationLevel, POINTS } from "@/utils/reputation";

interface ReputationBadgeProps {
  acceptedAnswers: number;
  helpfulVotes: number;
  wellRatedQuestions?: number;
}

export const ReputationBadge = ({
  acceptedAnswers,
  helpfulVotes,
  wellRatedQuestions = 0,
}: ReputationBadgeProps) => {
  const totalPoints = calculateReputation({
    acceptedAnswers,
    helpfulVotes,
    wellRatedQuestions,
  });
  const level = getReputationLevel(totalPoints);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-gold" />
              {totalPoints} pts
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">Reputação: {level}</p>
              <p className="text-xs">
                {acceptedAnswers} respostas aceitas ({acceptedAnswers * POINTS.ACCEPTED_ANSWER} pts)
              </p>
              <p className="text-xs">
                {helpfulVotes} votos úteis ({helpfulVotes * POINTS.HELPFUL_VOTE} pts)
              </p>
              {wellRatedQuestions > 0 && (
                <p className="text-xs">
                  {wellRatedQuestions} perguntas bem avaliadas ({wellRatedQuestions * POINTS.WELL_RATED_QUESTION} pts)
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {acceptedAnswers > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 bg-success-bg border-success text-success">
                <CheckCircle className="h-3 w-3" />
                {acceptedAnswers}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Respostas Aceitas</p>
            </TooltipContent>
          </Tooltip>
        )}

        {helpfulVotes > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1">
                <ThumbsUp className="h-3 w-3" />
                {helpfulVotes}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Votos Úteis</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
