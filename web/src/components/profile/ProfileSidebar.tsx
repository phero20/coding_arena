"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Users, BarChart3, Settings, 
  Code, Github, Linkedin, UserPlus, 
  UserMinus, Loader2, Edit, Code2, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type UserStats } from "@/types/stats";
import { useSocialRegistry } from "@/hooks/queries/use-social-registry";
import { useFollowMutation } from "@/hooks/queries/use-follow.mutations";
import { useUser } from "@clerk/nextjs";

interface ProfileSidebarProps {
  username: string;
  fullName?: string;
  avatarUrl?: string;
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  leetcodeUsername?: string | null;
  followerCount: number;
  followingCount: number;
  isOwner: boolean;
  stats?: UserStats;
  onTabChange: (tab: string) => void;
  onSocialClick: (type: "followers" | "following") => void;
}

export function ProfileSidebar({
  username,
  fullName,
  avatarUrl,
  githubUsername,
  linkedinUsername,
  leetcodeUsername,
  followerCount,
  followingCount,
  isOwner,
  stats,
  onTabChange,
  onSocialClick,
}: ProfileSidebarProps) {
  const { isFollowing: checkIsFollowing } = useSocialRegistry();
  const isFollowing = checkIsFollowing(username);
  
  const { user } = useUser();
  const { follow, unfollow } = useFollowMutation(
    username,
    user?.username ?? undefined,
  );

  const isPending = follow.isPending || unfollow.isPending;

  const navItems = [
    { value: "stats", label: "Statistics", icon: BarChart3 },
    { value: "arena", label: "Arena Records", icon: Trophy },
    {
      value: "social",
      label: `Social`,
      icon: Users,
    },
    ...(isOwner
      ? [{ value: "settings", label: "Settings", icon: Settings }]
      : []),
  ];

  return (
    <aside className="lg:w-80 shrink-0 space-y-6">
      {/* Core Identity Card */}
      <Card className="">
        <CardContent className="p-5 space-y-5">
          <div className="flex gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={avatarUrl}
                alt={username}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg bg-primary/5">
                <User className="text-primary/20" size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center gap-1 min-w-0">
              <h1 className="text-xl font-bold">{fullName}</h1>
              <p className="text-xs font-bold text-muted-foreground tracking-wider lowercase truncate">
                {username}
              </p>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest leading-none">
                  Rank
                </p>
                <p className="text-sm font-black mt-1">3,14,914</p>
              </div>
            </div>
          </div>

          <div className="flex justify-start gap-2 items-center h-auto pt-2">
            <Button
              variant="link"
              onClick={() => onSocialClick("following")}
              size="sm"
              className="h-full items-end hover:bg-transparent"
            >
              <span className="text-[12px] text-primary tabular-nums font-bold">
                {followingCount}
              </span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                Following
              </span>
            </Button>
            <div className="w-px h-4 bg-border"></div>
            <Button
              variant="link"
              onClick={() => onSocialClick("followers")}
              size="sm"
              className="h-full items-end hover:bg-transparent"
            >
              <span className="text-[12px] text-primary tabular-nums font-bold">
                {followerCount}
              </span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                Followers
              </span>
            </Button>
          </div>

          {isOwner ? (
            <Button
              size="lg"
              className="w-full font-semibold"
              onClick={() => onTabChange("settings")}
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          ) : (
            <Button
              size="lg"
              variant={isFollowing ? "destructive" : "default"}
              className={cn("w-full")}
              disabled={isPending}
              onClick={() =>
                isFollowing ? unfollow.mutate() : follow.mutate()
              }
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isFollowing ? (
                <>
                  <UserMinus size={16} className="mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}

          {/* Social Links Section */}
          {(() => {
            const socials = [
              {
                id: "leetcode",
                icon: Code2,
                value: leetcodeUsername,
                url: `https://leetcode.com/u/${leetcodeUsername}`,
              },
              {
                id: "github",
                icon: Github,
                value: githubUsername,
                url: `https://github.com/${githubUsername}`,
              },
              {
                id: "linkedin",
                icon: Linkedin,
                value: linkedinUsername,
                url: `https://linkedin.com/in/${linkedinUsername}`,
              },
            ].filter((s) => s.value);

            if (socials.length > 0) {
              return (
                <div className="">
                  {socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                    >
                      <Button variant="link" className="pl-0 pt-0">
                        <social.icon
                          size={16}
                          className="shrink-0 text-primary/60 "
                        />
                        <span className="text-[12px] tracking-wider text-muted-foreground group-hover:text-primary">
                          {social.value}
                        </span>
                      </Button>
                    </a>
                  ))}
                </div>
              );
            }

            if (isOwner) {
              return (
                <Button
                  size="lg"
                  onClick={() => onTabChange("settings")}
                  className="w-full font-semibold"
                >
                  <Settings
                    size={14}
                  />
                  Add social links
                </Button>
              );
            }

            return null;
          })()}
        </CardContent>
      </Card>

      {/* Language Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-foreground">Languages</h3>
        </div>

        {(() => {
          const entries = Object.entries(stats?.languageCounts ?? {}).sort(
            ([, a], [, b]) => b - a,
          );
          const [isExpanded, setIsExpanded] = React.useState(false);

          if (entries.length === 0) {
            return (
              <p className="text-[10px] text-muted-foreground px-1 italic">
                No solve data recorded yet.
              </p>
            );
          }

          const visibleEntries = isExpanded ? entries : entries.slice(0, 5);

          return (
            <div className="space-y-3 px-1">
              <div className="space-y-3">
                {visibleEntries.map(([lang, count]) => (
                  <div
                    key={lang}
                    className="flex items-center justify-between group"
                  >
                    <Badge variant="secondary">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-foreground tabular-nums">
                        {count}
                      </span>
                      <span className="text-muted-foreground/70">
                        problems solved
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {entries.length > 5 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full text-center text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors pt-1"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Navigation List */}
      <div className="pt-4">
        <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
          {navItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "w-full justify-start gap-4 px-4 py-3 h-auto text-[10px] font-semibold uppercase transition-all",
                "bg-transparent border border-transparent text-muted-foreground hover:text-foreground",
                "data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-border",
              )}
            >
              <item.icon size={14} className="not-italic shrink-0" />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </aside>
  );
}
