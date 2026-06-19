"use client";

import { useState } from "react";
import { useTaxonomyCategoryDetail } from "@/hooks/useTaxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link2, Loader2, Trash2, Folder, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";

interface CategoryDetailsProps {
  category: any;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  const { problems: mappedProblems, isLoading, isError, error, batchMapProblems, unmapProblem } = useTaxonomyCategoryDetail(category);
  const [problemIdInput, setProblemIdInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  const isLeafNode = !category?.children || category.children.length === 0;



  const mappings = mappedProblems || [];

  const filteredMappings = mappings.filter((mapping: any) => {
    const term = searchQuery.toLowerCase();
    const id = String(mapping.problem_id || mapping.problemId || "");
    const title = String(mapping.problem_title || mapping.title || "").toLowerCase();
    return id.includes(term) || title.includes(term);
  });

  const handleMapProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemIdInput.trim()) return;
    
    const problemIds = problemIdInput.split(',').map(id => id.trim()).filter(Boolean);
    if (problemIds.length === 0) return;

    const baseOrder = mappings.length;
    const batchMappings = problemIds.map((id, index) => ({
      problemId: id,
      order: baseOrder + index
    }));

    await batchMapProblems({
      categoryId: category.id,
      mappings: batchMappings
    });
    
    setOpenCombobox(false);
    setProblemIdInput("");
  };

  const handleUnmapProblem = async (problemId: string) => {
    await unmapProblem({ categoryId: category.id, problemId });
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading category details...">
      <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        <div className="shrink-0 p-4 md:p-6 md:px-10 lg:px-12 pb-6 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-20 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
              <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground mt-1">
                /{category.slug}
              </div>
            </div>
            {category.description && (
              <p className="text-muted-foreground text-lg mt-2">
                {category.description}
              </p>
            )}
          </div>

          {isLeafNode && (
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm shrink-0">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search problems..."
                    className="pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 px-4"
                    >
                      <Link2 className="h-4 w-4" />
                      Add new problem
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-4" align="end">
                    <form onSubmit={handleMapProblem} className="flex flex-col gap-3">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Add Problem</h4>
                        <p className="text-sm text-muted-foreground">
                          Paste exact problem IDs (comma-separated for bulk).
                        </p>
                      </div>
                      <Input
                        placeholder="e.g. 96, 175, 1818, 151, ...."
                        value={problemIdInput}
                        onChange={(e) => setProblemIdInput(e.target.value)}
                      />
                      <Button type="submit" disabled={!problemIdInput.trim()} className="w-full">
                        Add Problems
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>
              </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 md:px-10 lg:px-12 pt-6 pb-12">

      {!isLeafNode ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
          <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Parent Category</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            This category contains sub-categories. Problems can only be mapped to child (leaf) categories. Select a sub-category to manage its problems.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Mapped Problems</h3>
              <p className="text-sm text-muted-foreground">
                Problems linked to this taxonomy node.
              </p>
            </div>
          </div>

        {filteredMappings.length === 0 ? (
          <EmptyState message="No problems found." className="bg-background border-border/50" />
        ) : (
          <div className="rounded-md border border-border/50 bg-background overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order</TableHead>
                  <TableHead>Problem ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping: any) => (
                  <TableRow key={mapping.problem_id || mapping.problemId || mapping.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {mapping.order || 0}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {mapping.problem_id || mapping.problemId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {mapping.problem_title || mapping.title || mapping.problem_id || mapping.problemId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 "
                          onClick={() => handleUnmapProblem(mapping.problem_id || mapping.problemId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
        </div>
      </div>
    </QueryState>
  );
}
