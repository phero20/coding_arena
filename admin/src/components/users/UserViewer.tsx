import { Button } from "@/components/ui/button";
import { useUserAdmin } from "@/hooks/useUserAdmin";
import { Loader2, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserViewerProps {
  id: string;
  onBack: () => void;
}

export function UserViewer({ id, onBack }: UserViewerProps) {
  const { users, isLoading } = useUserAdmin();
  const user = users.find((u) => u.id === id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-muted-foreground">User not found.</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
      <div className="flex items-center pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <Button
          type="button"
          variant="secondary"
          size="icon-lg"
          onClick={onBack}
          className="gap-1 rounded-full shrink-0 mr-4"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
            User Details
            <Badge variant={user.status === "active" ? "default" : "secondary"}>
              {user.status}
            </Badge>
            <Badge variant="outline">{user.role}</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Viewing details for @{user.username}
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-muted/20 p-6 flex-1 overflow-auto min-h-0 space-y-8">
        <div className="flex items-center gap-6 pb-6 border-b">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-medium uppercase shadow-sm">
              {user.username.slice(0, 2)}
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {user.fullName || user.username}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Social Profiles</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">GitHub</span>
                <span className="font-medium">
                  {user.githubUsername || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">LinkedIn</span>
                <span className="font-medium">
                  {user.linkedinUsername || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">LeetCode</span>
                <span className="font-medium">
                  {user.leetcodeUsername || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">System Data</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Internal ID</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Updated At</span>
                <span className="font-medium">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
