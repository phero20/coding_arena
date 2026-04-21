import React from "react";
import { Users, UserPlus, UserMinus, User } from "lucide-react";
import { BentoCard } from "../feature-cards/shared";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockFollowers = [
  { id: "1", name: "Alex Rivera", username: "arivera", isFollowing: false },
  { id: "2", name: "Sarah Chen", username: "schen_dev", isFollowing: true },
  { id: "3", name: "Marcus Thorne", username: "mthorne", isFollowing: false }
];

function ConnectionItem({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-2 p-2 border border-border/40 bg-card rounded-lg group hover:border-primary/20 transition-all cursor-default">
      <Avatar className="h-8 w-8 border border-border/10">
        <AvatarFallback className="bg-primary/5 text-[8px] font-black uppercase">
          {user.username.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-primary transition-colors">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate hover:underline cursor-pointer">{user.username}</p>
      </div>

      <Button
        size="sm"
        variant={user.isFollowing ? "destructive" : "default"}
        className="h-6 text-[7px] font-black uppercase px-1 shadow-sm transition-all"
      >
        {user.isFollowing ? (
          <><UserMinus size={10} />Unfollow</>
        ) : (
          <><UserPlus size={10} />Follow</>
        )}
      </Button>
    </div>
  );
}

export function SocialTabCard() {
  return (
    <BentoCard className="p-5 relative overflow-hidden h-full flex flex-col group bg-card/20 backdrop-blur-xl border-border/40">
      {/* Tactical Header */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-[11px] font-black tracking-tight text-foreground uppercase leading-none">Network</h2>
            <p className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1.5 leading-none">Social Activity</p>
          </div>
        </div>

        {/* Static Tabs Mockup */}
        <div className="flex h-8 p-0.5 bg-muted/40 border border-border/20 rounded-md backdrop-blur-md">
           <div className="flex-1 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-primary bg-background/50 rounded shadow-sm border border-border/10 leading-none">
              Followers
           </div>
           <div className="flex-1 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 leading-none">
              Following
           </div>
        </div>
      </div>

      {/* Responsive Grid List View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 transition-all">
         {mockFollowers.map(user => <ConnectionItem key={user.id} user={user} />)}

      </div>
    </BentoCard>
  );
}
