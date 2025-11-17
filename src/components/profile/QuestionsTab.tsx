import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Eye } from "lucide-react";

interface QuestionsTabProps {
  userId: string;
}

export const QuestionsTab = ({ userId }: QuestionsTabProps) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select(`
        *,
        categories (name, icon),
        profiles (full_name, username)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get answer counts for each question
      const questionsWithCounts = await Promise.all(
        data.map(async (question) => {
          const { count } = await supabase
            .from("answers")
            .select("*", { count: "exact", head: true })
            .eq("question_id", question.id);

          return { ...question, answerCount: count || 0 };
        })
      );
      setQuestions(questionsWithCounts);
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

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma pergunta encontrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card
          key={question.id}
          className="hover:shadow-lg transition-all duration-300 hover:border-primary"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link to={`/pergunta/${question.id}`}>
                  <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                    {question.title}
                  </CardTitle>
                </Link>
                <CardDescription className="mt-2 line-clamp-2">
                  {question.content}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              {question.categories && (
                <Badge variant="secondary">
                  {question.categories.name}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{question.answerCount} respostas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{question.views || 0} visualizações</span>
              </div>
              <span className="text-sm text-muted-foreground ml-auto">
                {new Date(question.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
