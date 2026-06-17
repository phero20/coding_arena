import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type SystemDesignTopic } from "@/services/system-design.service";
import { useSystemDesignAdmin } from "@/hooks/useSystemDesign";
import { Loader2 } from "lucide-react";

interface TopicEditorProps {
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TopicEditor({ slug, onSuccess, onCancel }: TopicEditorProps) {
  const { topics, createTopic, updateTopic, isCreating, isUpdating, isLoading } = useSystemDesignAdmin();
  
  const initialData = slug ? topics.find(t => t.slug === slug) : null;
  const isSubmitting = isCreating || isUpdating;

  // Calculate next order for new topics
  const nextOrder = topics.length > 0 ? Math.max(...topics.map((t) => t.order)) + 1 : 0;

  const [formData, setFormData] = useState<Partial<SystemDesignTopic>>({
    topic_id: "",
    slug: "",
    title: "",
    content: "",
    order: nextOrder,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        topic_id: initialData.topic_id,
        slug: initialData.slug,
        title: initialData.title,
        content: initialData.content,
        order: initialData.order,
      });
    } else {
      setFormData({
        topic_id: "",
        slug: "",
        title: "",
        content: "",
        order: nextOrder,
      });
    }
  }, [initialData, nextOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateTopic({ id: initialData.id, payload: formData });
      } else {
        await createTopic(formData);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading && slug && !initialData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (slug && !initialData && !isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-destructive font-medium">Topic not found.</p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-card z-10 pt-4 -mt-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{initialData ? "Edit Topic" : "Create Topic"}</h2>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update the details of the system design topic."
              : "Add a new topic to the system design roadmap."}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Topic"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Distributed Caching"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic_id">Topic ID (Internal)</Label>
            <Input
              id="topic_id"
              placeholder="e.g. intro-caching"
              value={formData.topic_id}
              onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              placeholder="e.g. distributed-caching"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order Index</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Markdown Content</Label>
          <Textarea
            id="content"
            placeholder="Write your markdown content here..."
            className="min-h-[400px] font-mono text-sm"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>
      </div>
    </form>
  );
}
