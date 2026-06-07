"use client";

import React from "react";
import { Solution } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Trash2,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SolutionMarkdown } from "./SolutionMarkdown";
import Link from "next/link";

interface SolutionDetailProps {
  solution: Solution;
  currentUserId?: string | null;
  activeTab: string;
  onBack: () => void;
  onVote: (solutionId: string, voteType: 1 | -1) => void;
  onDelete: (solutionId: string) => void;
  onEdit: (solutionId: string) => void;
  isVoting?: boolean;
  isDeleting?: boolean;
}

export const SolutionDetail: React.FC<SolutionDetailProps> = ({
  solution,
  currentUserId,
  activeTab,
  onBack,
  onVote,
  onDelete,
  onEdit,
  isVoting,
  isDeleting,
}) => {
  const [open, setOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-20 bg-background flex items-center justify-between gap-4 border-b py-2 px-4">
        <div className="flex items-center gap-2">
          <Button
            // variant="ghost"
            size="icon"
            onClick={onBack}
            className="size-6"
            title="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/90">
              Back{" "}
              <span className="hidden sm:inline">
                to {activeTab === "community" ? "Community" : "My"} Solutions
              </span>
            </span>
          </div>
        </div>

        {!solution.id.startsWith("official") && (
          <ButtonGroup>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={() => onVote(solution.id, 1)}
              disabled={isVoting}
              title="Upvote"
            >
              <ThumbsUp className="size-3.5" />
              <span className="font-bold text-xs">{solution.upvotes}</span>
            </Button>
            <ButtonGroupSeparator className="bg-border/40" />
            <Button
              variant="secondary"
              size="sm"
              className="h-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => onVote(solution.id, -1)}
              disabled={isVoting}
              title="Downvote"
            >
              <ThumbsDown className="size-3.5" />
              <span className="font-bold text-xs">{solution.downvotes}</span>
            </Button>
            {solution.userId === currentUserId && (
              <>
                <ButtonGroupSeparator className="bg-border/40" />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 px-2 hover:bg-primary/10 transition-all duration-200"
                      disabled={isDeleting}
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={8}
                    className="p-1 w-36 border-border bg-background/95 backdrop-blur-md shadow-xl"
                  >
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2 h-9 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all group"
                        onClick={() => handleAction(() => onEdit(solution.id))}
                      >
                        <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20">
                          <Edit size={12} className="text-primary" />
                        </div>
                        Edit
                      </Button>
                      <div className="h-[1px] bg-border/40 my-0.5 mx-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2 h-9 text-xs font-bold hover:bg-destructive/10 hover:text-destructive transition-all group"
                        onClick={() => {
                          setOpen(false);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <div className="p-1 rounded bg-destructive/10 group-hover:bg-destructive/20">
                          <Trash2 size={12} className="text-destructive" />
                        </div>
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-md text-primary font-bold">
                        Delete Solution?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="text-primary font-bold italic">
                          "{solution.title}"
                        </span>
                        ? This action cannot be undone and will remove your
                        contribution from the community.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-8 text-xs font-bold border-border">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(solution.id)}
                        className="h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </ButtonGroup>
        )}
      </div>

      <div className="space-y-6 py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!solution.id.startsWith("official") && (
              <Link href={`/u/${solution.author.username}`}>
                <Avatar className="size-10 border-2 border-primary/20">
                  <AvatarImage src={solution.author.avatarUrl || ""} />
                  <AvatarFallback>
                    {solution.author.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight uppercase">
                {solution.title}
              </h2>
              {!solution.id.startsWith("official") && (
                <p className="text-xs text-muted-foreground">
                  By{" "}
                  <Link
                    href={`/u/${solution.author.username}`}
                    className="text-primary font-bold hover:underline"
                  >
                    {solution.author.username}
                  </Link>{" "}
                  • {formatDistanceToNow(new Date(solution.createdAt))} ago
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="md:p-8 prose prose-invert prose-sm max-w-none border-t border-border min-w-0 whitespace-pre-wrap break-all">
          <SolutionMarkdown content={solution.content} />
        </div>
      </div>
    </div>
  );
};
