import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Edit, Trash2, Eye } from "lucide-react";
import { useSystemDesignAdmin } from "@/hooks/useSystemDesign";
import { QueryState } from "@/components/ui/query-state";
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

interface TopicListProps {
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function TopicList({
  onEdit,
  onView,
}: TopicListProps) {
  const { topics, isLoading, isError, error, deleteTopic, isDeleting, reorderTopics, isReordering } = useSystemDesignAdmin();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newTopics = [...topics];
    const currentOrder = newTopics[index].order;
    const prevOrder = newTopics[index - 1].order;
    
    reorderTopics([
      { id: newTopics[index].id, order: prevOrder },
      { id: newTopics[index - 1].id, order: currentOrder },
    ]);
  };

  const handleMoveDown = (index: number) => {
    if (index === topics.length - 1) return;
    const newTopics = [...topics];
    const currentOrder = newTopics[index].order;
    const nextOrder = newTopics[index + 1].order;

    reorderTopics([
      { id: newTopics[index].id, order: nextOrder },
      { id: newTopics[index + 1].id, order: currentOrder },
    ]);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const topic = topics.find(t => t.slug === itemToDelete);
      if (topic) {
        await deleteTopic(topic.id);
      }
      setItemToDelete(null);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading topics...">
      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Topic ID</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!topics || topics.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No topics found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic, index) => (
                <TableRow key={topic.id}>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground font-mono">{topic.order}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === topics.length - 1 || isReordering}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{topic.title}</TableCell>
                  <TableCell className="font-mono text-xs">{topic.topic_id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{topic.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(topic.slug)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(topic.slug)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setItemToDelete(topic.slug)}
                        disabled={isDeleting && itemToDelete === topic.slug}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the topic{" "}
              <span className="font-semibold text-foreground">"{itemToDelete}"</span>{" "}
              from the system design roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
