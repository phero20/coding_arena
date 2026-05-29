import { User, Edit } from "lucide-react";
import { BentoCard } from "../feature-cards/shared";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function IdentityCard() {
  return (
    <BentoCard className="p-5 relative overflow-hidden group">
      <div className="space-y-5 relative z-10">
        {/* Core Identity Section */}
        <div className="flex gap-4">
          <Avatar className="w-24 h-24 border-none ring-0">
            <AvatarImage
              src=""
              alt="Md Feroz Ahmed"
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-primary/5">
              <User className="text-primary/20" size={32} />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col justify-center gap-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">XYZ XYZ</h1>
            <p className="text-xs font-bold text-muted-foreground tracking-wider lowercase truncate">
              xyz11
            </p>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">
                Rank
              </p>
              <p className="text-sm font-black mt-1 text-foreground">3,14,914</p>
            </div>
          </div>
        </div>

        {/* Stats Section with Buttons behavior match */}
        <div className="flex justify-start gap-2 items-center h-auto pt-2">
          <div className="flex items-end gap-1 px-0 hover:bg-transparent h-auto">
            <span className="text-[12px] text-primary tabular-nums font-bold">15</span>
            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Following</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-end gap-1 px-0 hover:bg-transparent h-auto">
            <span className="text-[12px] text-primary tabular-nums font-bold">60</span>
            <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Followers</span>
          </div>
        </div>

        {/* Action Section */}
        <Button
          size="lg"
          className="w-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Edit size={16} className="mr-2" />
          Edit Profile
        </Button>
      </div>
    </BentoCard>
  );
}
