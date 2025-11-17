import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, TrendingUp, Plus, MessageSquare, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchQuestions();

    // Subscribe to realtime updates
    const questionsSubscription = supabase
      .channel('questions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    const answersSubscription = supabase
      .channel('answers-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers'
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsSubscription);
      supabase.removeChannel(answersSubscription);
    };
  }, []);

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            username
          ),
          categories:category_id (
            name,
            icon
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch answer counts for each question
      const counts: Record<string, number> = {};
      if (data) {
        for (const question of data) {
          const { count } = await supabase
            .from("answers")
            .select("*", { count: 'exact', head: true })
            .eq("question_id", question.id);
          counts[question.id] = count || 0;
        }
      }

      setAnswerCounts(counts);
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perguntas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    searchQuery === "" ||
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.categories?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Search and Create Button */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Explorar Perguntas</h1>
            {user && (
              <Button asChild size="lg" className="hover-lift">
                <Link to="/criar-pergunta">
                  <Plus className="h-5 w-5 mr-2" />
                  Nova Pergunta
                </Link>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar perguntas, tópicos, matérias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Categorias</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge 
                key={category.id} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSearchQuery(category.name)}
              >
                {category.icon} {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? "Resultados da Busca" : "Perguntas Recentes"}
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando perguntas...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Nenhuma pergunta encontrada" : "Ainda não há perguntas"}
                </p>
                {user && (
                  <Button asChild>
                    <Link to="/criar-pergunta">
                      <Plus className="h-4 w-4 mr-2" />
                      Fazer a Primeira Pergunta
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <Link key={question.id} to={`/pergunta/${question.id}`}>
                  <Card className="hover:border-primary/40 transition-all cursor-pointer hover-lift animate-fade-in">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {question.categories?.icon} {question.categories?.name}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mb-2 hover:text-primary transition-colors">
                            {question.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {answerCounts[question.id] || 0} respostas
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {question.views || 0} visualizações
                            </span>
                            <span>por {question.profiles?.full_name}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
