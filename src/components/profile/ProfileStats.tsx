import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, MessageCircle } from "lucide-react";

interface ProfileStatsProps {
  questions: number;
  answers: number;
  onQuestionsClick: () => void;
  onAnswersClick: () => void;
}

export const ProfileStats = ({
  questions,
  answers,
  onQuestionsClick,
  onAnswersClick,
}: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary"
        onClick={onQuestionsClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Perguntas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{questions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Clique para ver todas
          </p>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary"
        onClick={onAnswersClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Respostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{answers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Clique para ver todas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
