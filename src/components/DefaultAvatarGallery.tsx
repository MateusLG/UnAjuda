import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Import default avatars
import avatarStudent from "@/assets/avatars/avatar-student-1.png";
import avatarGraduate from "@/assets/avatars/avatar-graduate-1.png";
import avatarBrain from "@/assets/avatars/avatar-brain-1.png";
import avatarRocket from "@/assets/avatars/avatar-rocket-1.png";
import avatarOwl from "@/assets/avatars/avatar-owl-1.png";
import avatarTrophy from "@/assets/avatars/avatar-trophy-1.png";
import avatarScience from "@/assets/avatars/avatar-science-1.png";
import avatarCompass from "@/assets/avatars/avatar-compass-1.png";

const defaultAvatars = [
  { id: "student", src: avatarStudent, name: "Estudante" },
  { id: "graduate", src: avatarGraduate, name: "Graduado" },
  { id: "brain", src: avatarBrain, name: "Criativo" },
  { id: "rocket", src: avatarRocket, name: "Inovador" },
  { id: "owl", src: avatarOwl, name: "Sábio" },
  { id: "trophy", src: avatarTrophy, name: "Campeão" },
  { id: "science", src: avatarScience, name: "Cientista" },
  { id: "compass", src: avatarCompass, name: "Explorador" },
];

interface DefaultAvatarGalleryProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarSrc: string) => void;
}

export const DefaultAvatarGallery = ({
  selectedAvatar,
  onSelectAvatar,
}: DefaultAvatarGalleryProps) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Escolha um avatar padrão
      </div>
      <div className="grid grid-cols-4 gap-4">
        {defaultAvatars.map((avatar) => (
          <div
            key={avatar.id}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => onSelectAvatar(avatar.src)}
          >
            <div className="relative">
              <Avatar
                className={cn(
                  "h-16 w-16 transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2",
                  selectedAvatar === avatar.src &&
                    "ring-2 ring-primary ring-offset-2 scale-105"
                )}
              >
                <AvatarImage src={avatar.src} alt={avatar.name} />
              </Avatar>
              {selectedAvatar === avatar.src && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 animate-scale-in">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
              {avatar.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
