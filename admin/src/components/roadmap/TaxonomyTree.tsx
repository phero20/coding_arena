"use client";

import { useState } from "react";
import { useTaxonomyTree } from "@/hooks/useTaxonomy";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, FolderOpen, FileCode2, Loader2, FileText, Folder, ChevronRight, ChevronDown, PlusCircle, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { QueryState } from "@/components/ui/query-state";

interface TaxonomyTreeProps {
  selectedCategory: any | null;
  onSelect: (category: any | null) => void;
}

export function TaxonomyTree({ selectedCategory, onSelect }: TaxonomyTreeProps) {
  const { tree, isLoading, isError, error, createCategory, updateCategory, deleteCategory } = useTaxonomyTree();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "create" | "edit" | "delete";
    data?: any;
    parentId?: string | null;
  }>({ isOpen: false, type: "create" });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
    parentId: "",
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };



  const openModal = (type: "create" | "edit" | "delete", data?: any, parentId: string | null = null) => {
    setModalState({ isOpen: true, type, data, parentId });
    if (type === "edit" && data) {
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        order: data.order || 0,
        parentId: data.parentId || "",
      });
    } else {
      setFormData({ name: "", slug: "", description: "", order: 0, parentId: parentId || "" });
    }
  };

  const handleAction = async () => {
    try {
      if (modalState.type === "create") {
        await createCategory({ ...formData, parentId: formData.parentId || modalState.parentId || null });
      } else if (modalState.type === "edit" && modalState.data) {
        await updateCategory({ id: modalState.data.id, payload: { ...formData, parentId: formData.parentId || null } });
      } else if (modalState.type === "delete" && modalState.data) {
        await deleteCategory(modalState.data.id);
        if (selectedCategory?.id === modalState.data.id) {
          // Clear selection if deleting currently selected
          onSelect(null);
        }
      }
      setModalState({ isOpen: false, type: "create" });
    } catch (e) {
      // Error handled by hook
    }
  };

  const renderTree = (nodes: any[], depth = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ul className={cn("space-y-1", depth > 0 && "ml-4 border-l border-border/50 pl-2 mt-1")}>
        {nodes.map((node) => {
          const isSelected = selectedCategory?.id === node.id;
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <li key={node.id} className="relative group">
              <div 
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all cursor-pointer group/item border border-transparent",
                  isSelected 
                    ? "bg-primary/10 text-primary font-medium border-primary/10 shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50"
                )}
                onClick={() => {
                  onSelect(node);
                  if (hasChildren && !expandedNodes[node.id]) {
                    toggleExpand(node.id);
                  }
                }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {hasChildren ? (
                    <div 
                      className="cursor-pointer hover:bg-muted-foreground/20 rounded-sm p-0.5"
                      onClick={(e) => toggleExpand(node.id, e)}
                    >
                      {expandedNodes[node.id] ? (
                        <ChevronDown className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                      ) : (
                        <ChevronRight className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                      )}
                    </div>
                  ) : (
                    <div className="w-5" /> // Spacer for alignment
                  )}
                  {hasChildren ? (
                    expandedNodes[node.id] ? (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={(e) => { e.stopPropagation(); openModal("create", null, node.id); }}
                    title="Add Subcategory"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={(e) => { e.stopPropagation(); openModal("edit", node); }}
                    title="Edit Category"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); openModal("delete", node); }}
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
              {hasChildren && expandedNodes[node.id] && renderTree(node.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading taxonomy tree...">
      <div className="space-y-4">
        <Button 
        variant="outline" 
        className="w-full justify-start text-muted-foreground hover:text-foreground border-dashed border-2 h-10 hover:border-primary/50 hover:bg-primary/5 transition-all"
        onClick={() => openModal("create", null, null)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Root Category
      </Button>

      <div className="mt-4">
        {tree && tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            No categories yet.
          </div>
        )}
      </div>

      <Dialog open={modalState.isOpen} onOpenChange={(open) => !open && setModalState(s => ({...s, isOpen: false}))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalState.type === "create" ? "Create Category" : 
               modalState.type === "edit" ? "Edit Category" : "Delete Category"}
            </DialogTitle>
            <DialogDescription>
              {modalState.type === "delete" 
                ? `Are you sure you want to delete "${modalState.data?.name}"? This action cannot be undone.`
                : "Fill out the details below to manage the category."}
            </DialogDescription>
          </DialogHeader>

          {modalState.type !== "delete" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData(prev => ({ ...prev, name, slug: prev.slug || slug }));
                  }}
                  placeholder="e.g. Two Pointers"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. two-pointers"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief explanation of this topic..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order Index</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentId">Parent ID (Optional)</Label>
                <Input
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                  placeholder="Paste UUID of parent category or leave empty for root"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalState(s => ({...s, isOpen: false}))}>
              Cancel
            </Button>
            <Button 
              variant={modalState.type === "delete" ? "destructive" : "default"}
              onClick={handleAction}
            >
              {modalState.type === "delete" ? "Delete" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </QueryState>
  );
}
