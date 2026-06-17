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
import { Link2, Loader2, Trash2, Folder } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { QueryState } from "@/components/ui/query-state";

interface CategoryDetailsProps {
  category: any;
}

export function CategoryDetails({ category }: CategoryDetailsProps) {
  const { problems: mappedProblems, isLoading, isError, error, batchMapProblems, unmapProblem } = useTaxonomyCategoryDetail(category);
  const [problemIdInput, setProblemIdInput] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  const isLeafNode = !category?.children || category.children.length === 0;



  const mappings = mappedProblems || [];

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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 border-b border-border/50 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
          <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
            /{category.slug}
          </div>
        </div>
        {category.description && (
          <p className="text-muted-foreground text-lg">
            {category.description}
          </p>
        )}
      </div>

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

            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-between"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Add new problem...
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

          <div className="rounded-md border border-border/50 bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[100px]">Order</TableHead>
                  <TableHead>Problem ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No problems mapped to this category yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  mappings.map((mapping: any) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnmapProblem(mapping.problem_id || mapping.problemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
    </QueryState>
  );
}
