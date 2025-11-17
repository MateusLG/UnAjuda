import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import graduationIllustration from "@/assets/graduation-illustration.svg";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const typedText = useTypewriter("Aprenda com a Comunidade.", 80);
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground min-h-[4.5rem] md:min-h-[6rem]">
                {typedText.split(' ').map((word, index) => {
                  const isLastWord = index === typedText.split(' ').length - 1;
                  return (
                    <span key={index}>
                      {word === 'Comunidade' || (isLastWord && typedText.includes('Comunidade')) ? (
                        <span className="text-primary">{word}</span>
                      ) : (
                        word
                      )}
                      {index < typedText.split(' ').length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
                <span className="animate-pulse">|</span>
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in-up stagger-1">
                Plataforma colaborativa onde universitários compartilham conhecimento e encontram respostas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up stagger-2">
                <Button size="lg" asChild className="hover-lift">
                  <Link to="/cadastro">Começar Agora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover-lift">
                  <Link to="/sobre">Saiba Mais</Link>
                </Button>
              </div>
            </div>
            <div className="animate-float">
              <img 
                src={graduationIllustration} 
                alt="Ilustração de formatura" 
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-all hover-lift animate-scale-in stagger-1">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Milhares de Tópicos</CardTitle>
              <CardDescription>
                Perguntas e respostas sobre todas as matérias universitárias
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all hover-lift animate-scale-in stagger-2">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Comunidade Ativa</CardTitle>
              <CardDescription>
                Conecte-se com estudantes de diversas universidades
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all hover-lift animate-scale-in stagger-3">
            <CardHeader>
              <Trophy className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Sistema de Medalhas</CardTitle>
              <CardDescription>
                Ganhe reconhecimento pela qualidade das suas respostas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all hover-lift animate-scale-in stagger-4">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Respostas Rápidas</CardTitle>
              <CardDescription>
                Receba ajuda da comunidade em tempo real
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section - Only shown to non-logged users */}
      {!user && (
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-lift animate-fade-in">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in-up">
                Pronto para começar?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-1">
                Junte-se à nossa comunidade e transforme sua experiência universitária
              </p>
              <div className="animate-fade-in-up stagger-2">
                <Button size="lg" asChild className="hover-lift">
                  <Link to="/cadastro">Criar Conta Gratuita</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Home;
