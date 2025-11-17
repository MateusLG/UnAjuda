import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Heart, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Sobre o <span className="text-primary">UnAjuda</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma feita por universitários, para universitários
            </p>
          </div>

          {/* Mission Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Nossa Missão</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O UnAjuda foi criado com o objetivo de facilitar o compartilhamento de conhecimento entre universitários. 
                Acreditamos que o aprendizado colaborativo é fundamental para o sucesso acadêmico e queremos criar um 
                espaço onde estudantes possam se ajudar mutuamente, independente da universidade ou curso.
              </p>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Comunidade</CardTitle>
                <CardDescription>
                  Construímos uma comunidade forte e colaborativa onde todos se ajudam
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Respeito</CardTitle>
                <CardDescription>
                  Valorizamos o respeito e a empatia em todas as interações
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Qualidade</CardTitle>
                <CardDescription>
                  Incentivamos respostas bem fundamentadas e de alta qualidade
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Story Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Como Surgiu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                O UnAjuda nasceu durante a época da faculdade, quando percebemos a necessidade de uma plataforma 
                dedicada especificamente para estudantes universitários brasileiros compartilharem conhecimento 
                sobre suas matérias.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Diferente de outras plataformas, focamos exclusivamente no ensino superior, criando um ambiente 
                mais direcionado e relevante para as necessidades dos universitários. Nosso sistema de medalhas 
                reconhece e incentiva aqueles que mais contribuem para a comunidade.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, continuamos trabalhando para melhorar a plataforma e criar a melhor experiência possível 
                para estudantes de todo o Brasil.
              </p>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">1000+</div>
              <div className="text-sm text-muted-foreground">Usuários</div>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">5000+</div>
              <div className="text-sm text-muted-foreground">Perguntas</div>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">15000+</div>
              <div className="text-sm text-muted-foreground">Respostas</div>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Matérias</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
