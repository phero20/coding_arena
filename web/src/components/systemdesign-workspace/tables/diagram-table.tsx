"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MoreHorizontal, Edit2, Trash2, ExternalLink } from "lucide-react";
import type { Diagram } from "@/types/workspace";
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
import { useUpdateDiagram, useDeleteDiagram } from "@/hooks/mutations/use-workspace.mutations";
import { formatDistanceToNow } from "date-fns";

interface DiagramTableProps {
  workspaceId: string;
  diagrams: Diagram[];
}

export function DiagramTable({ workspaceId, diagrams }: DiagramTableProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeDiagram, setActiveDiagram] = useState<Diagram | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<Diagram | null>(null);

  const updateDiagramMutation = useUpdateDiagram(workspaceId);
  const deleteDiagramMutation = useDeleteDiagram(workspaceId);

  const openRenameDialog = (diagram: Diagram) => {
    setActiveDiagram(diagram);
    setNewTitle(diagram.title);
    setIsRenameOpen(true);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDiagram || !newTitle.trim() || newTitle === activeDiagram.title) return;

    try {
      await updateDiagramMutation.mutateAsync({
        id: activeDiagram.id,
        data: { title: newTitle.trim() },
      });
      setIsRenameOpen(false);
    } catch (err) {
      // Error handled by custom mutation toast
    }
  };

  const openDeleteDialog = (diagram: Diagram) => {
    setDiagramToDelete(diagram);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!diagramToDelete) return;
    try {
      await deleteDiagramMutation.mutateAsync(diagramToDelete.id);
      setIsDeleteOpen(false);
      setDiagramToDelete(null);
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
                  Diagram Title
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
              {diagrams.map((diagram) => (
                <TableRow
                  key={diagram.id}
                  className="group border-t border-border/40 transition-colors hover:bg-muted/30"
                >
                  {/* Icon + Title Name with link */}
                  <TableCell className="p-3 pl-6 align-middle min-w-0 max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/systemdesign-workspace/${workspaceId}/diagram/${diagram.id}`}
                          className="text-md font-bold"
                        >
                          <span className="text-foreground hover:text-primary transition-colors hover:underline truncate block flex-1">
                            {diagram.title}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </TableCell>

                  {/* Last Active Column */}
                  <TableCell className="py-3 pl-0 align-middle text-xs text-muted-foreground hidden sm:table-cell">
                    {formatDistanceToNow(new Date(diagram.updatedAt))} ago
                  </TableCell>

                  {/* Action dropdown */}
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
                              href={`/systemdesign-workspace/${workspaceId}/diagram/${diagram.id}`}
                              className="flex items-center w-full"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Open Diagram
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openRenameDialog(diagram)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Rename Diagram
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(diagram)}
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete Diagram
                          </DropdownMenuItem>
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
              <DialogTitle>Rename Diagram</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="diagram-name" className="text-sm font-medium">
                  Diagram Title
                </Label>
                <Input
                  id="diagram-name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter diagram title"
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
                  !newTitle.trim() ||
                  (activeDiagram && newTitle === activeDiagram.title) ||
                  updateDiagramMutation.isPending
                }
              >
                {updateDiagramMutation.isPending ? "Saving..." : "Save Changes"}
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
              Delete Diagram?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete the diagram <strong>{diagramToDelete?.title}</strong>? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs font-bold border-border" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteDiagramMutation.isPending}
            >
              {deleteDiagramMutation.isPending ? "Deleting..." : "Delete Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
