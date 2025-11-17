import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ThumbsUp } from "lucide-react";

interface AnswersTabProps {
  userId: string;
}

export const AnswersTab = ({ userId }: AnswersTabProps) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnswers();
  }, [userId]);

  const fetchAnswers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("answers")
      .select(`
        *,
        questions (id, title)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get vote counts for each answer
      const answersWithVotes = await Promise.all(
        data.map(async (answer) => {
          const { count } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("answer_id", answer.id)
            .eq("vote_type", 1);

          return { ...answer, voteCount: count || 0 };
        })
      );
      setAnswers(answersWithVotes);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma resposta encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <Card
          key={answer.id}
          className="hover:shadow-lg transition-all duration-300 hover:border-primary"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link to={`/pergunta/${answer.questions.id}`}>
                  <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                    Resposta para: {answer.questions.title}
                  </CardTitle>
                </Link>
                <CardDescription className="mt-2 line-clamp-3">
                  {answer.content}
                </CardDescription>
              </div>
              {answer.is_accepted && (
                <Badge variant="outline" className="bg-success-bg border-success text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aceita
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>{answer.voteCount} votos úteis</span>
              </div>
              <span className="text-sm text-muted-foreground ml-auto">
                {new Date(answer.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
