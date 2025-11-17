import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const questionSchema = z.object({
  title: z.string().trim().min(10, "O título deve ter no mínimo 10 caracteres").max(200, "O título deve ter no máximo 200 caracteres"),
  content: z.string().trim().min(20, "O conteúdo deve ter no mínimo 20 caracteres").max(5000, "O conteúdo deve ter no máximo 5000 caracteres"),
  category_id: z.string().uuid("Selecione uma categoria válida"),
});

const CreateQuestion = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para criar uma pergunta",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Validar dados
      const validatedData = questionSchema.parse({
        title: title,
        content: content,
        category_id: categoryId,
      });

      setLoading(true);

      // Buscar o profile_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error("Perfil não encontrado");
      }

      // Criar a pergunta
      const { data, error } = await supabase
        .from("questions")
        .insert({
          user_id: profile.id,
          category_id: validatedData.category_id,
          title: validatedData.title,
          content: validatedData.content,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pergunta criada!",
        description: "Sua pergunta foi publicada com sucesso.",
      });

      navigate(`/pergunta/${data.id}`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar pergunta",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Fazer uma Pergunta</CardTitle>
              <CardDescription>
                Compartilhe sua dúvida com a comunidade universitária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Pergunta *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ex: Como resolver integrais triplas?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/200 caracteres (mínimo 10)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Descrição Detalhada *</Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva sua dúvida com o máximo de detalhes possível..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={8}
                    maxLength={5000}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length}/5000 caracteres (mínimo 20)
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Publicando..." : "Publicar Pergunta"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/pesquisa")}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
