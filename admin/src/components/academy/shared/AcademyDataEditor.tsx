"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";

interface AcademyDataEditorProps {
  slug?: string;
  item?: any; // The existing item if editing
  isCreating: boolean;
  isUpdating: boolean;
  onCreate: (payload: { slug: string; data: any }) => Promise<any>;
  onUpdate: (payload: { slug: string; data: any }) => Promise<any>;
  onSuccess: () => void;
  onCancel: () => void;
  itemName?: string;
}

export function AcademyDataEditor({
  slug,
  item,
  isCreating,
  isUpdating,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
  itemName = "Item",
}: AcademyDataEditorProps) {
  const isEditMode = !!slug;

  const [formSlug, setFormSlug] = useState("");
  const [formDataString, setFormDataString] = useState("{\n  \n}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (item) {
      setFormSlug(item.slug);
      setFormDataString(JSON.stringify(item.data, null, 2));
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    let parsedData = {};
    try {
      parsedData = JSON.parse(formDataString);
    } catch (err: any) {
      setJsonError("Invalid JSON: " + err.message);
      return;
    }

    try {
      if (isEditMode) {
        await onUpdate({ slug: formSlug, data: parsedData });
      } else {
        await onCreate({ slug: formSlug, data: parsedData });
      }
      onSuccess();
    } catch (err) {
      // Handled by react-query sonner toasts
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full min-h-0 space-y-8 p-1"
    >
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onCancel}
            title="Go Back"
            className="gap-1 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {isEditMode
                ? `Edit ${itemName}: ${item?.slug}`
                : `Create New ${itemName}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? `Update the JSON data for this ${itemName.toLowerCase()}.`
                : `Create a new ${itemName.toLowerCase()} with initial JSON data.`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            type="submit"
            size="lg"
            disabled={isCreating || isUpdating}
            className="gap-2 px-4"
          >
            <Save className="w-4 h-4" />
            {isCreating || isUpdating ? "Saving..." : `Save ${itemName}`}
          </Button>
        </div>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="slug">{itemName} Slug</Label>
        <Input
          id="slug"
          value={formSlug}
          onChange={(e) => setFormSlug(e.target.value)}
          disabled={isEditMode}
          placeholder={`e.g. sample-${itemName.toLowerCase()}-slug`}
          required
        />
        {isEditMode && (
          <p className="text-xs text-muted-foreground">
            Slug cannot be changed after creation.
          </p>
        )}
      </div>

      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <Label htmlFor="data">Configuration Data (JSON)</Label>
        <Textarea
          id="data"
          value={formDataString}
          onChange={(e) => setFormDataString(e.target.value)}
          className="font-mono text-sm flex-1 min-h-0 resize-none bg-muted/20 overflow-auto whitespace-pre-wrap break-all"
          autoResize={false}
          required
        />
        {jsonError && (
          <p className="text-sm font-medium text-destructive">{jsonError}</p>
        )}
      </div>
    </form>
  );
}
