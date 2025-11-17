import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Eye } from "lucide-react";
import { z } from "zod";
import VoteButtons from "@/components/VoteButtons";
import AnswerCard from "@/components/AnswerCard";

const answerSchema = z.object({
  content: z.string().trim().min(10, "A resposta deve ter no mínimo 10 caracteres").max(5000, "A resposta deve ter no máximo 5000 caracteres"),
});

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
      incrementViews();
      
      // Subscribe to realtime updates
      const answersSubscription = supabase
        .channel(`answers-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'answers',
            filter: `question_id=eq.${id}`
          },
          () => {
            fetchAnswers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(answersSubscription);
      };
    }
  }, [id]);

  const incrementViews = async () => {
    if (!id) return;
    
    // Update views count
    const { data: currentQuestion } = await supabase
      .from('questions')
      .select('views')
      .eq('id', id)
      .single();

    if (currentQuestion) {
      await supabase
        .from('questions')
        .update({ views: (currentQuestion.views || 0) + 1 })
        .eq('id', id);
    }
  };

  const fetchQuestion = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("questions")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username
        ),
        categories:category_id (
          name,
          icon
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar pergunta",
        description: error.message,
        variant: "destructive",
      });
      navigate("/pesquisa");
      return;
    }

    setQuestion(data);
    setLoading(false);
  };

  const fetchAnswers = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("answers")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username
        )
      `)
      .eq("question_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar respostas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAnswers(data || []);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para responder",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const validatedData = answerSchema.parse({ content: newAnswer });

      setSubmitting(true);

      const { error } = await supabase
        .from("answers")
        .insert({
          question_id: id,
          user_id: user.id,
          content: validatedData.content,
        });

      if (error) throw error;

      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada com sucesso.",
      });

      setNewAnswer("");
      fetchAnswers();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar resposta",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || user.id !== question?.user_id) return;

    // First, unaccept all answers
    await supabase
      .from("answers")
      .update({ is_accepted: false })
      .eq("question_id", id);

    // Then accept the selected answer
    const { error } = await supabase
      .from("answers")
      .update({ is_accepted: true })
      .eq("id", answerId);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Resposta aceita!",
      description: "Esta resposta foi marcada como a melhor.",
    });

    fetchAnswers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">
                      {question?.categories?.icon} {question?.categories?.name}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {question?.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {answers.length}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-4">{question?.title}</CardTitle>
                  <p className="text-foreground whitespace-pre-wrap">{question?.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {question?.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{question?.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(question?.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <VoteButtons questionId={id} />
              </div>
            </CardHeader>
          </Card>

          {/* Answer Form */}
          {user && question && user.id !== question.user_id && (
            <Card className="animate-fade-in-up border-primary/20 hover-lift">
              <CardHeader>
                <CardTitle>Sua Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <Textarea
                    placeholder="Escreva sua resposta aqui..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    rows={6}
                    maxLength={5000}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {newAnswer.length}/5000 caracteres
                    </p>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Enviando..." : "Enviar Resposta"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Answers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {answers.length} {answers.length === 1 ? "Resposta" : "Respostas"}
            </h2>
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                questionUserId={question?.user_id}
                currentUserId={user?.id}
                onAcceptAnswer={handleAcceptAnswer}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
