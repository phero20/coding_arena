"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type UserProfileData } from "@/types/stats";

interface StatsHeaderProps {
  user: UserProfileData["user"];
}

/**
 * StatsHeader displays the primary identity of the user on their profile.
 */
export function StatsHeader({ user }: StatsHeaderProps) {
  const formattedJoinedDate = format(parseISO(user.joinedAt), "MMMM yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-border/50"
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300">
          <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
          <AvatarFallback className="text-3xl font-black italic bg-muted text-muted-foreground uppercase">
            {user.username.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-lg">
          <ShieldCheck size={18} />
        </div>
      </div>

      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            {user.username}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={16} className="text-primary/70" />
            <span>Joined {formattedJoinedDate}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-foreground">Official Participant</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
