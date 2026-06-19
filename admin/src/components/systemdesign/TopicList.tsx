import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useSystemDesignAdmin } from "@/hooks/useSystemDesign";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
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
  const { topics, isLoading, isError, error, deleteTopic, isDeleting } = useSystemDesignAdmin();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = topics?.filter(topic => {
    const query = searchQuery.toLowerCase();
    return (
      topic.slug.toLowerCase().includes(query) ||
      topic.title.toLowerCase().includes(query)
    );
  }) || [];

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
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or slug..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredTopics.length === 0 ? (
          <EmptyState message="No matching topics found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopics.map((topic, index) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-mono text-xs">{topic.order}</TableCell>
                  <TableCell className="font-medium">{topic.title}</TableCell>
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
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setItemToDelete(topic.slug)}
                        disabled={isDeleting && itemToDelete === topic.slug}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
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
