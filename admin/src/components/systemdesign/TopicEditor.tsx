import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type SystemDesignTopic } from "@/services/system-design.service";
import { useSystemDesignAdmin } from "@/hooks/useSystemDesign";
import { Loader2, ChevronLeft, Save } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-6 p-1">
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onCancel}
            title="Go Back"
            className="gap-1 rounded-full shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {initialData ? `Edit Topic: ${initialData.slug}` : `Create New Topic`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {initialData
                ? "Update the details of the system design topic."
                : "Add a new topic to the system design roadmap."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="submit" disabled={isSubmitting} size="lg" className="px-6 gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Topic"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Distributed Caching"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
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
            <div className="space-y-2 flex flex-col" >
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                placeholder="e.g. distributed-caching"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
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

          <div className="space-y-2 flex flex-col min-h-[400px]">
            <Label htmlFor="content">Markdown Content</Label>
            <Textarea
              id="content"
              placeholder="Write your markdown content here..."
              className="flex-1 font-mono text-sm resize-none"
              autoResize={false}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
        </div>
      </div>
    </form>
  );
}
