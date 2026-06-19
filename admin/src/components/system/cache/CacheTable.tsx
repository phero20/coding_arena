"use client";

import { useCacheAdmin } from "@/hooks/useCache";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";

interface CacheTableProps {
  keys: string[];
  isLoading: boolean;
  onViewDetails: (key: string) => void;
}

export default function CacheTable({ keys, isLoading, onViewDetails }: CacheTableProps) {
  const { useDeleteKey } = useCacheAdmin();
  const { mutate: deleteKey, isPending: isDeleting } = useDeleteKey();

  if (isLoading) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground animate-pulse">
        Loading cache keys...
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        No cache keys found matching the pattern.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Key</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key}>
              <TableCell className="font-mono text-sm">{key}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onViewDetails(key)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Delete key ${key}?`)) {
                        deleteKey(key);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
