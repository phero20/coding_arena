import React from "react";
import Link from "next/link";
import {
  useFollowersQuery,
  useFollowingQuery,
} from "@/hooks/queries/use-follow.queries";
import { useFollowMutation } from "@/hooks/queries/use-follow.mutations";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Users, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";

interface SocialTabProps {
  username: string;
  initialType?: "followers" | "following";
  onBack?: () => void;
}

/**
 * SocialUserCard: Individual warrior card with its own follow/unfollow logic.
 */
const SocialUserCard = ({ 
  targetUser, 
  currentUser, 
  isFollowing,
  listType
}: { 
  targetUser: any; 
  currentUser: any; 
  isFollowing: boolean;
  listType: 'followers' | 'following';
}) => {
  const isMe = currentUser?.username === targetUser.username;
  const { follow, unfollow } = useFollowMutation(targetUser.username, currentUser?.username ?? undefined);
  const isPending = follow.isPending || unfollow.isPending;

  return (
    <Link href={`/u/${targetUser.username}`}>
      <Card className="flex items-center gap-4 p-3 group">
        <Avatar className="h-10 w-10">
          {targetUser.avatarUrl && (
            <AvatarImage src={targetUser.avatarUrl} alt={targetUser.username} />
          )}
          <AvatarFallback className="">
            {targetUser.username.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-primary transition-colors">
            {targetUser.fullName || targetUser.username}
          </p>
          <p className="text-xs text-muted-foreground truncate hover:underline">
            @{targetUser.username}
          </p>
        </div>
        
        {!isMe && (
          <div className="">
            {/* Logic: Don't show unfollow button for followers list */}
            {(!isFollowing || listType === 'following') ? (
              <Button
                size="sm"
                variant={isFollowing ? "destructive" : "default"}
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isFollowing) unfollow.mutate();
                  else follow.mutate();
                }}
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : isFollowing ? (
                  <>
                    <UserMinus size={12} className="mr-1.5" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={12} className="mr-1.5" />
                    Follow
                  </>
                )}
              </Button>
            ) : (
             <></>
            )}
          </div>
        )}
        {isMe && (
          <div className="flex items-center gap-1 pr-2">
            <User
              className="text-primary"
              size={16}
            />
            <span className="text-sm text-primary">You</span>
          </div>
        )}
      </Card>
    </Link>
  );
};

/**
 * UserList: Sub-component to render the actual grid of warriors.
 */
const UserList = ({
  username,
  type,
  myFollowingSet,
}: {
  username: string;
  type: "followers" | "following";
  myFollowingSet: Set<string>;
}) => {
  const { user: currentUser } = useUser();
  const {
    data: users,
    isLoading,
    error,
  } = type === "followers"
    ? useFollowersQuery(username)
    : useFollowingQuery(username);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="p-4 flex items-center gap-4 bg-muted/20 border-border/50"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
        <p>Failed to load {type}. Please try again later.</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-muted/5 rounded-xl border border-dashed border-border/50">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <Users className="text-primary/20" size={32} />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          No {type} yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {type === "followers"
            ? "When other warriors follow this profile, they'll appear here."
            : "This warrior hasn't followed anyone yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {users.map((targetUser) => (
        <SocialUserCard
          key={targetUser.id}
          targetUser={targetUser}
          currentUser={currentUser}
          isFollowing={myFollowingSet.has(targetUser.username)}
          listType={type}
        />
      ))}
    </div>
  );
}

/**
 * SocialTab: Main container that provides the sub-navigation for Followers/Following.
 */
export const SocialTab: React.FC<SocialTabProps> = ({
  username,
  initialType = "followers",
  onBack,
}) => {
  const { user: currentUser } = useUser();
  
  // Fetch CURRENT user's following list (to determine isFollowing on cards)
  const { data: myFollowing } = useFollowingQuery(currentUser?.username || "");
  
  const myFollowingSet = React.useMemo(() => {
    return new Set(myFollowing?.map(u => u.username) || []);
  }, [myFollowing]);

  return (
    <div className="space-y-8">
      <Tabs defaultValue={initialType} className="w-full">
        <div className="flex flex-col md:items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button size="icon" onClick={onBack}>
                <ArrowLeft size={18} />
              </Button>
            )}
          </div>

          <TabsList className="p-1 h-10 w-full md:w-auto">
            <TabsTrigger
              value="followers"
              className="data-[state=active]:text-primary"
            >
              Followers
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:text-primary"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="followers" className="focus-visible:ring-0 mt-0">
          <UserList 
            username={username} 
            type="followers" 
            myFollowingSet={myFollowingSet} 
          />
        </TabsContent>
        <TabsContent value="following" className="focus-visible:ring-0 mt-0">
          <UserList 
            username={username} 
            type="following" 
            myFollowingSet={myFollowingSet} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
