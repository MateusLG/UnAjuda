import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import VoteButtons from "./VoteButtons";

interface AnswerCardProps {
  answer: any;
  questionUserId: string;
  currentUserId?: string;
  onAcceptAnswer: (answerId: string) => void;
}

const AnswerCard = ({ answer, questionUserId, currentUserId, onAcceptAnswer }: AnswerCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canReply = currentUserId === questionUserId || currentUserId === answer.user_id;

  useEffect(() => {
    console.log('AnswerCard mounted/updated for answer:', answer.id);
    fetchReplies();

    // Subscribe to realtime updates for replies
    const repliesSubscription = supabase
      .channel(`answer-replies-${answer.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answer_replies',
          filter: `answer_id=eq.${answer.id}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchReplies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(repliesSubscription);
    };
  }, [answer.id]);

  const fetchReplies = async () => {
    console.log('Fetching replies for answer:', answer.id);
    const { data, error } = await supabase
      .from("answer_replies")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          username
        )
      `)
      .eq("answer_id", answer.id)
      .order("created_at", { ascending: true });

    console.log('Replies fetch result:', { data, error, length: data?.length });
    
    if (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Erro ao carregar respostas",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    if (data) {
      console.log('Setting replies:', data);
      setReplies(data);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado para responder.",
        variant: "destructive",
      });
      return;
    }

    if (replyContent.trim().length < 10) {
      toast({
        title: "Resposta muito curta",
        description: "A resposta deve ter no mínimo 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("answer_replies")
        .insert({
          answer_id: answer.id,
          user_id: currentUserId,
          content: replyContent.trim(),
        });

      if (error) throw error;

      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada com sucesso.",
      });

      setReplyContent("");
      setShowReplyForm(false);
      fetchReplies();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={`animate-fade-in ${answer.is_accepted ? 'border-primary' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <VoteButtons answerId={answer.id} />
            {currentUserId === questionUserId && !answer.is_accepted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                onClick={() => onAcceptAnswer(answer.id)}
                title="Marcar como melhor resposta"
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
            )}
            {answer.is_accepted && (
              <CheckCircle className="h-5 w-5 text-primary fill-primary" />
            )}
          </div>
          <div className="flex-1 space-y-4">
            {answer.is_accepted && (
              <Badge className="mb-2 bg-primary">Melhor Resposta</Badge>
            )}
            <p className="text-foreground whitespace-pre-wrap">{answer.content}</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {answer?.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{answer?.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(answer?.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Replies Section */}
            {replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-muted/30 rounded-lg p-3 animate-fade-in">
                    <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{reply.content}</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                          {reply?.profiles?.full_name?.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{reply?.profiles?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(reply?.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Button and Form */}
            {canReply && (
              <div className="mt-4">
                {!showReplyForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(true)}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Responder
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitReply} className="space-y-3">
                    <Textarea
                      placeholder="Escreva sua resposta..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="resize-none text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {replyContent.length}/1000 caracteres
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyContent("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={submitting}>
                          {submitting ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerCard;
