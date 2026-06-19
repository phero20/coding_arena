"use client";

import { useState, useMemo } from "react";
import { useCacheAdmin } from "@/hooks/useCache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2, RefreshCw, ServerCrash, ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CacheListProps {
  onView: (key: string) => void;
  onEdit: (key: string) => void;
  activeId?: string | null;
}

type TreeNode = {
  name: string;
  type: "folder" | "file";
  fullKey: string;
  children: TreeNode[];
  isExactKey?: boolean;
};

const buildTree = (keys: string[]): TreeNode[] => {
  const root: TreeNode = { name: "root", type: "folder", fullKey: "", children: [] };

  keys.forEach((key) => {
    const parts = key.split(":");
    let currentNode = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join(":");

      let child = currentNode.children.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          type: "folder",
          fullKey: path,
          children: [],
        };
        currentNode.children.push(child);
      }

      if (isLast) {
        child.isExactKey = true;
        child.type = child.children.length > 0 ? "folder" : "file"; 
      }

      currentNode = child;
    });
  });

  return root.children;
};

export function CacheList({ onView, activeId }: CacheListProps) {
  const [pattern, setPattern] = useState("*");
  const [searchInput, setSearchInput] = useState("*");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isFlushAlertOpen, setIsFlushAlertOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const { useGetCacheKeys, useDeleteKey, useFlushCache } = useCacheAdmin();
  
  const { data, isLoading, isError, error, refetch, isFetching } = useGetCacheKeys({
    pattern,
    count: 500, // Fetch up to 500 keys
  });
  
  const { mutate: deleteKey, isPending: isDeleting } = useDeleteKey();
  const { mutate: flushCache, isPending: isFlushing } = useFlushCache();

  const handleFlushConfirm = () => {
    flushCache(undefined, {
      onSuccess: () => setIsFlushAlertOpen(false),
    });
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteKey(itemToDelete, {
        onSuccess: () => setItemToDelete(null),
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPattern(searchInput || "*");
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const keys = data?.keys || [];
  
  const treeData = useMemo(() => buildTree(keys), [keys]);

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul className={cn("space-y-1", depth > 0 && "ml-4 border-l border-border/50 pl-2 mt-1")}>
        {nodes.map((node) => {
          const isSelected = activeId === node.fullKey;
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <li key={node.fullKey} className="relative group">
              <div 
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all cursor-pointer group/item border border-transparent",
                  isSelected 
                    ? "bg-primary/10 text-primary font-medium border-primary/10 shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50"
                )}
                onClick={() => {
                  onView(node.fullKey);
                  if (hasChildren && !expandedNodes[node.fullKey]) {
                    toggleExpand(node.fullKey);
                  }
                }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {hasChildren ? (
                    <div 
                      className="cursor-pointer hover:bg-muted-foreground/20 rounded-sm p-0.5"
                      onClick={(e) => toggleExpand(node.fullKey, e)}
                    >
                      {expandedNodes[node.fullKey] ? (
                        <ChevronDown className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                      ) : (
                        <ChevronRight className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                      )}
                    </div>
                  ) : (
                    <div className="w-5" /> // Spacer for alignment
                  )}
                  {hasChildren ? (
                    expandedNodes[node.fullKey] ? (
                      <FolderOpen className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                    ) : (
                      <Folder className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                    )
                  ) : (
                    <FileText className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary/70" : "text-muted-foreground/70")} />
                  )}
                  <span className="truncate">{node.name}</span>
                </div>
                
                <div className={cn("flex items-center gap-0.5 transition-opacity ml-2 shrink-0 pl-2")}>
                  {node.isExactKey && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(node.fullKey); }}
                      disabled={isDeleting && itemToDelete === node.fullKey}
                      title="Delete Key"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              {hasChildren && expandedNodes[node.fullKey] && renderTree(node.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading cache tree...">
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSearchInput("*");
                setPattern("*");
                setTimeout(() => refetch(), 0);
              }}
              disabled={isFetching}
            >
              <RefreshCw className={` ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => setIsFlushAlertOpen(true)}
              disabled={isFlushing}
            >
              <ServerCrash className="" />
              {isFlushing ? "Flushing..." : "Flush Cache"}
            </Button>
          </div>
          
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search pattern (e.g., user:*, *problems*)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 w-full bg-background"
              />
            </div>
          </form>
        </div>

        {keys.length === 0 ? (
          <EmptyState message="No cache keys found matching the pattern." />
        ) : (
          <div className="mt-4">
            {renderTree(treeData)}
          </div>
        )}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cache key{" "}
              <span className="font-semibold text-foreground">"{itemToDelete}"</span>{" "}
              from the Redis database.
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

      <AlertDialog open={isFlushAlertOpen} onOpenChange={setIsFlushAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flush Entire Cache?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete 
              <span className="font-bold text-destructive"> EVERY SINGLE CACHE KEY </span> 
              in the Redis database. Proceed with extreme caution!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFlushConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Flush Cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
