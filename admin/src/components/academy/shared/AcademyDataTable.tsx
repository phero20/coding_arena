"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Edit, Edit2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";

interface AcademyDataTableProps {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
  onDelete: (slug: string) => void;
  isDeleting: boolean;
  
  // Customization props
  itemName?: string; // e.g. "track", "config"
  loadingMessage?: string;
  errorTitle?: string;
}

export function AcademyDataTable({ 
  data, 
  isLoading, 
  isError, 
  error, 
  onEdit, 
  onView, 
  onDelete, 
  isDeleting,
  itemName = "item",
  loadingMessage = "Loading...",
  errorTitle = "Error loading data"
}: AcademyDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const filteredData = data?.filter((item: any) => 
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <QueryState 
      isLoading={isLoading} 
      loadingMessage={loadingMessage}
      isError={isError} 
      error={error} 
      errorTitle={errorTitle}
    >
      {(!data || data.length === 0) ? (
        <EmptyState message={`No ${itemName}s found.`} className="border-0" />
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          <div className="relative max-w-sm shrink-0">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search by slug...`}
              className="pl-8 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filteredData.length === 0 ? (
            <EmptyState message={`No matching ${itemName}s found.`} />
          ) : (
            <div className="rounded-md border flex-1 min-h-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Title / Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: any) => (
                    <TableRow key={item.slug}>
                      <TableCell className="font-medium">{item.slug}</TableCell>
                      {/* If the data has a title or name, we show it, otherwise N/A */}
                      <TableCell>{item.data?.title || item.data?.name || item.data.language || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(item.slug)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item.slug)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setItemToDelete(item.slug)}
                            disabled={isDeleting && itemToDelete === item.slug}
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
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemName}{" "}
              <span className="font-semibold text-foreground">"{itemToDelete}"</span>{" "}
              and remove its data from our servers.
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
