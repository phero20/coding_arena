"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, MoreHorizontal, Edit2, Trash2, FolderOpen } from "lucide-react";
import type { Workspace } from "@/types/workspace";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/mutations/use-workspace.mutations";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface WorkspaceTableProps {
  workspaces: Workspace[];
}

export function WorkspaceTable({ workspaces }: WorkspaceTableProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [newName, setNewName] = useState("");
  
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const openRenameDialog = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setNewName(ws.name);
    setIsRenameOpen(true);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newName.trim() || newName === activeWorkspace.name) return;

    try {
      await updateWorkspaceMutation.mutateAsync({
        id: activeWorkspace.id,
        data: { name: newName.trim() },
      });
      setIsRenameOpen(false);
    } catch (err) {
      // Error handled by custom mutation toast
    }
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  const openDeleteDialog = (ws: Workspace) => {
    setWorkspaceToDelete(ws);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!workspaceToDelete || workspaceToDelete.isDefault) return;
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceToDelete.id);
      setIsDeleteOpen(false);
      setWorkspaceToDelete(null);
    } catch (err) {
      // Error handled by custom mutation toast
    }
  };

  return (
    <>
      <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table className="border-separate border-spacing-0 w-full">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="pl-5 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground w-auto">
                  Workspace Folder
                </TableHead>
                <TableHead className="pl-0 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest text-muted-foreground hidden sm:table-cell w-[140px] md:w-[180px]">
                  Last Active
                </TableHead>
                <TableHead className="pr-6 py-3 h-12 text-right font-bold text-xs uppercase tracking-widest text-muted-foreground w-[60px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow
                  key={workspace.id}
                  className="group border-t border-border/40 transition-colors hover:bg-muted/30"
                >
                  {/* Folder icon + Name with link */}
                  <TableCell className="p-3 pl-6 align-middle min-w-0 max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/systemdesign-workspace/${workspace.id}`}
                          className="text-md font-bold"
                        >
                          <span className="text-foreground hover:text-primary transition-colors hover:underline truncate block flex-1">
                            {workspace.name}
                          </span>
                        </Link>
                        {workspace.isDefault && (
                          <Badge className="text-[8px] uppercase font-bold tracking-widest">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Last Active Column */}
                  <TableCell className="py-3 pl-0 align-middle text-xs text-muted-foreground hidden sm:table-cell">
                    {formatDistanceToNow(new Date(workspace.updatedAt))} ago
                  </TableCell>

                  <TableCell className="py-3 pr-8 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end relative z-10">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                              href={`/systemdesign-workspace/${workspace.id}`}
                              className="flex items-center w-full"
                            >
                              <FolderOpen className="mr-2 h-3.5 w-3.5" />
                              Open Workspace
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openRenameDialog(workspace)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Rename Workspace
                          </DropdownMenuItem>
                          {!workspace.isDefault && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(workspace)}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete Workspace
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle>Rename Workspace</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Workspace Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter workspace name"
                  autoComplete="off"
                  maxLength={100}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newName.trim() ||
                  (activeWorkspace && newName === activeWorkspace.name) ||
                  updateWorkspaceMutation.isPending
                }
              >
                {updateWorkspaceMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-md text-destructive font-bold">
              Delete Workspace?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete the workspace{" "}
              <strong>{workspaceToDelete?.name}</strong>? This action is
              permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 text-xs font-bold border-border"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteWorkspaceMutation.isPending}
            >
              {deleteWorkspaceMutation.isPending ? "Deleting..." : "Delete Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
