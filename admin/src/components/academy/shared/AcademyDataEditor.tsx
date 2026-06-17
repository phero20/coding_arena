"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, [formDataString]);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-card z-10 pt-4">
        <div>
          <h3 className="text-lg font-medium tracking-tight">
            {isEditMode ? `Edit ${itemName}: ${item?.slug}` : `Create New ${itemName}`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? `Update the JSON data for this ${itemName.toLowerCase()}.` : `Create a new ${itemName.toLowerCase()} with initial JSON data.`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? "Saving..." : `Save ${itemName}`}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="data">Configuration Data (JSON)</Label>
        <Textarea
          id="data"
          ref={textareaRef}
          value={formDataString}
          onChange={(e) => setFormDataString(e.target.value)}
          className="font-mono text-sm overflow-hidden resize-none min-h-[100px]"
          required
        />
        {jsonError && (
          <p className="text-sm font-medium text-destructive">{jsonError}</p>
        )}
      </div>
    </form>
  );
}
