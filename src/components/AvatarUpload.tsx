import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefaultAvatarGallery } from "./DefaultAvatarGallery";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userName: string;
  onUploadSuccess: (url: string) => void;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  userId,
  userName,
  onUploadSuccess,
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDefaultAvatarSelect = async (avatarSrc: string) => {
    setSelectedDefaultAvatar(avatarSrc);
    setPreviewUrl(avatarSrc);
    setUploading(true);

    try {
      // Update profile with default avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarSrc })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Avatar padrão selecionado com sucesso",
      });

      onUploadSuccess(avatarSrc);
    } catch (error: any) {
      toast({
        title: "Erro ao selecionar avatar",
        description: error.message,
        variant: "destructive",
      });
      setPreviewUrl(currentAvatarUrl);
      setSelectedDefaultAvatar(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    setUploading(true);

    try {
      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Avatar atualizado com sucesso",
      });

      onUploadSuccess(data.publicUrl);
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
      setPreviewUrl(currentAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group">
        <Avatar className="h-32 w-32 transition-all duration-300 group-hover:scale-105">
          <AvatarImage src={previewUrl || undefined} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
            {userName?.split(" ").map((n) => n[0]).join("") || "U"}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Galeria
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Fazer Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-4">
          <DefaultAvatarGallery
            selectedAvatar={selectedDefaultAvatar}
            onSelectAvatar={handleDefaultAvatarSelect}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Escolher Imagem
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground text-center">
              Máximo 2MB • JPG, PNG, WEBP
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
