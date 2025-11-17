import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { sanitizeErrorMessage, sanitizeInput, logError } from '@/lib/error-handler';
import { emailSchema, usernameSchema, fullNameSchema } from '@/lib/validations';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedFullName = sanitizeInput(fullName);
      const sanitizedUsername = sanitizeInput(username);

      // Validate inputs
      try {
        emailSchema.parse(sanitizedEmail);
        fullNameSchema.parse(sanitizedFullName);
        usernameSchema.parse(sanitizedUsername);
      } catch (validationError: any) {
        const message = validationError.errors?.[0]?.message || "Dados inválidos";
        toast({
          title: "Erro de validação",
          description: message,
          variant: "destructive",
        });
        return { error: validationError };
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: sanitizedFullName,
            username: sanitizedUsername,
          }
        }
      });

      if (error) {
        logError(error, "signUp");
        toast({
          title: "Erro no cadastro",
          description: sanitizeErrorMessage(error),
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Cadastro realizado!",
        description: "Bem-vindo ao UnAjuda!",
      });

      navigate('/');
      return { error: null };
    } catch (error: any) {
      logError(error, "signUp");
      toast({
        title: "Erro no cadastro",
        description: sanitizeErrorMessage(error),
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Sanitize input
      const sanitizedEmail = sanitizeInput(email);

      // Validate email
      try {
        emailSchema.parse(sanitizedEmail);
      } catch (validationError: any) {
        const message = validationError.errors?.[0]?.message || "Email inválido";
        toast({
          title: "Erro de validação",
          description: message,
          variant: "destructive",
        });
        return { error: validationError };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        logError(error, "signIn");
        toast({
          title: "Erro no login",
          description: sanitizeErrorMessage(error, "Credenciais inválidas"),
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });

      navigate('/');
      return { error: null };
    } catch (error: any) {
      logError(error, "signIn");
      toast({
        title: "Erro no login",
        description: sanitizeErrorMessage(error, "Credenciais inválidas"),
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/');
  };

  const resetPassword = async (email: string) => {
    try {
      // Sanitize input
      const sanitizedEmail = sanitizeInput(email);

      // Validate email
      try {
        emailSchema.parse(sanitizedEmail);
      } catch (validationError: any) {
        const message = validationError.errors?.[0]?.message || "Email inválido";
        toast({
          title: "Erro de validação",
          description: message,
          variant: "destructive",
        });
        return { error: validationError };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/recuperar-senha`,
      });

      if (error) {
        logError(error, "resetPassword");
        toast({
          title: "Erro",
          description: sanitizeErrorMessage(error),
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });

      return { error: null };
    } catch (error: any) {
      logError(error, "resetPassword");
      toast({
        title: "Erro",
        description: sanitizeErrorMessage(error),
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
