import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AvatarUpload } from "./AvatarUpload";

const profileSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, "Nome completo é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  headline: z.string()
    .trim()
    .max(150, "Descrição deve ter no máximo 150 caracteres")
    .optional(),
  bio: z.string()
    .trim()
    .max(500, "Bio deve ter no máximo 500 caracteres")
    .optional(),
  university: z.string()
    .trim()
    .max(100, "Nome da universidade deve ter no máximo 100 caracteres")
    .optional(),
  course: z.string()
    .trim()
    .max(100, "Nome do curso deve ter no máximo 100 caracteres")
    .optional(),
});

interface EditProfileDialogProps {
  profile: {
    id: string;
    full_name: string;
    username: string;
    headline: string | null;
    bio: string | null;
    university: string | null;
    course: string | null;
    avatar_url: string | null;
  };
  onProfileUpdated: () => void;
}

const EditProfileDialog = ({ profile, onProfileUpdated }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      university: profile.university || "",
      course: profile.course || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true);

    const { error } = await supabase.auth.getUser();
    
    if (error) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        headline: values.headline || null,
        bio: values.bio || null,
        university: values.university || null,
        course: values.course || null,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    setLoading(false);

    if (updateError) {
      toast({
        title: "Erro ao atualizar perfil",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram atualizadas com sucesso.",
    });

    setOpen(false);
    onProfileUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais
          </DialogDescription>
        </DialogHeader>
        
        <AvatarUpload
          currentAvatarUrl={profile.avatar_url}
          userId={profile.id}
          userName={profile.full_name}
          onUploadSuccess={onProfileUpdated}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Curta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Estudante de Engenharia | Apaixonado por tecnologia" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Universidade</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: USP, UNICAMP, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Engenharia, Medicina, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
