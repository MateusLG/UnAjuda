import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await resetPassword(email);
    if (!error) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md hover-lift">
        <CardHeader className="space-y-1 animate-scale-in">
          <Link to="/" className="text-2xl font-bold text-center mb-2 hover:text-primary transition-colors">
            Un<span className="text-primary">Ajuda</span>
          </Link>
          <CardTitle className="text-2xl text-center">
            {submitted ? "Email enviado!" : "Recuperar senha"}
          </CardTitle>
          <CardDescription className="text-center">
            {submitted
              ? "Verifique sua caixa de entrada para redefinir sua senha"
              : "Digite seu email para receber um link de recuperação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fade-in-up stagger-1">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

              <Button type="submit" className="w-full">
                Enviar link de recuperação
              </Button>
            </form>
          ) : (
            <Link to="/login">
              <Button className="w-full">
                Voltar para o login
              </Button>
            </Link>
          )}
          <div className="mt-4 text-center text-sm">
            <Link to="/" className="text-primary hover:underline">
              Voltar para a página inicial
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordRecovery;
