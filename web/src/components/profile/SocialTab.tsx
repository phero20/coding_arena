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
import { useSocialRegistry } from "@/hooks/queries/use-social-registry";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { SocialListSkeleton } from "@/components/shared/Skeletons";


import { useProfileStore } from "@/store/use-profile-store";

interface SocialTabProps {
  username: string;
}

/**
 * SocialUserCard: Individual user card with its own follow/unfollow logic.
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
            {targetUser.username}
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
 * UserList: Sub-component to render the actual grid of users.
 */
const UserList = ({
  username,
  type,
  checkIsFollowing,
}: {
  username: string;
  type: "followers" | "following";
  checkIsFollowing: (username: string) => boolean;
}) => {
  const { user: currentUser } = useUser();
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = type === "followers"
    ? useFollowersQuery(username)
    : useFollowingQuery(username);

  return (
    <QueryGuard
      loading={isLoading}
      error={isError ? error : null}
      data={users}
      onRetry={refetch}
      skeleton={<SocialListSkeleton count={6} />}
      emptyTitle={`No ${type} yet`}
      emptyMessage={
        type === "followers"
          ? "When other user follow this profile, they'll appear here."
          : "This user hasn't followed anyone yet."
      }
      emptyIcon={Users}
    >
      {(userList) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {userList.map((targetUser) => (
            <SocialUserCard
              key={targetUser.id}
              targetUser={targetUser}
              currentUser={currentUser}
              isFollowing={checkIsFollowing(targetUser.username)}
              listType={type}
            />
          ))}
        </div>
      )}
    </QueryGuard>
  );
}

/**
 * SocialTab: Main container that provides the sub-navigation for Followers/Following.
 */
export const SocialTab: React.FC<SocialTabProps> = ({
  username,
}) => {
  const { isFollowing } = useSocialRegistry();
  const { socialType, setSocialType, setActiveTab } = useProfileStore();

  return (
    <div className="space-y-8">
      <Tabs 
        value={socialType} 
        onValueChange={(val) => setSocialType(val as "followers" | "following")}
        className="w-full"
      >
        <div className="flex flex-col md:items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              variant="outline"
              className="rounded-full h-10 w-10 border-border/50"
              onClick={() => setActiveTab('stats')}
            >
              <ArrowLeft size={18} />
            </Button>
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
          <UserList username={username} type="followers" checkIsFollowing={isFollowing} />
        </TabsContent>
        <TabsContent value="following" className="focus-visible:ring-0 mt-0">
          <UserList username={username} type="following" checkIsFollowing={isFollowing} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
