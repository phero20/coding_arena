"use client";

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
        <div className="py-6 text-center text-muted-foreground">No {itemName}s found.</div>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search by slug...`}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filteredData.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground border rounded-md">No matching {itemName}s found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
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
                      <TableCell className="text-right space-x-2">
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
                          <Pencil className="h-4 w-4" />
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
