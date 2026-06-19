import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type BugReport } from "@/services/report-bug.service";
import { useReportBugAdmin } from "@/hooks/useReportBug";
import { Loader2, ChevronLeft, Save, UploadCloud, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportBugEditorProps {
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReportBugEditor({ id, onSuccess, onCancel }: ReportBugEditorProps) {
  const { reports, createReport, updateReport, isCreating, isUpdating, isLoading } = useReportBugAdmin();
  
  const initialData = id ? reports.find(r => r.id === id) : null;
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState<Partial<BugReport> & { fileImages: File[] }>({
    title: "",
    description: "",
    type: "bug",
    status: "open",
    images: [],
    fileImages: [],
  });

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const currentCount = (formData.images?.length || 0) + (formData.fileImages?.length || 0);
      const maxAllowed = Math.max(0, 5 - currentCount);
      const newFiles = Array.from(e.dataTransfer.files).slice(0, maxAllowed);
      
      if (newFiles.length > 0) {
        setFormData({ 
          ...formData, 
          fileImages: [...(formData.fileImages || []), ...newFiles] 
        });
      }
    }
  };

  useEffect(() => {
    if (!initialData) {
      setFormData({
        title: "",
        description: "",
        type: "bug",
        status: "open",
        images: [],
        fileImages: [],
      });
      return;
    }

    let parsedType = "bug";
    const dbType = (initialData.type || "").trim().toLowerCase();
    if (dbType === "ui") parsedType = "ui";
    if (dbType === "feature") parsedType = "feature";
    if (dbType === "feedback") parsedType = "feedback";

    let parsedStatus = "open";
    const dbStatus = (initialData.status || "").trim().toLowerCase();
    if (dbStatus === "in_progress" || dbStatus === "in progress") parsedStatus = "in_progress";
    if (dbStatus === "resolved") parsedStatus = "resolved";
    if (dbStatus === "closed") parsedStatus = "closed";

    setFormData({ 
      ...initialData, 
      type: parsedType as any,
      status: parsedStatus as any,
      fileImages: [] 
    });
  }, [initialData]);


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await updateReport({ id, payload: formData });
    } else {
      await createReport(formData);
    }
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-4 p-1">
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" size="icon-lg" onClick={onCancel} title="Go Back" className="gap-1 rounded-full shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {id ? "Edit Bug Report" : "Create Bug Report"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {id ? "Update the status, type, or details of this report." : "Manually log a new bug report."}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2 px-4">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/20 p-6 flex-1 overflow-auto min-h-0">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 flex flex-col">
              <Label>Title</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue"
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label>Type</Label>
              <Select 
                key={formData.type}
                value={formData.type} 
                onValueChange={(value: "bug" | "ui" | "feature" | "feedback") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="ui">UI Issue</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label>Status</Label>
              <Select 
                key={formData.status}
                value={formData.status} 
                onValueChange={(value: "open" | "in_progress" | "resolved") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 flex flex-col">
              <Label>Description</Label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the bug, steps to reproduce, etc."
                className="min-h-[150px] bg-background font-mono text-sm"
              />
            </div>
            
            <div className="space-y-3 col-span-2 flex flex-col">
              <div>
                <Label>Screenshots & Attachments</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Attach images to help explain the report.</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Existing Images */}
                {formData.images?.map((url, idx) => (
                  <div 
                    key={`old-${idx}`} 
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-background/50"
                  >
                    <img 
                      src={url} 
                      alt="Saved" 
                      className="w-full h-full object-cover" 
                    />
                    <Button 
                      variant="default" 
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow-sm bg-destructive hover:bg-destructive"
                      onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== idx) })}
                      title="Remove saved image"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </Button>
                  </div>
                ))}
                
                {/* New File Previews */}
                {formData.fileImages?.map((file, idx) => (
                  <div 
                    key={`new-${idx}`} 
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/50"
                  >
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Screenshot preview" 
                      className="w-full h-full object-cover"  
                    />
                    <Button 
                      variant="default" 
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow-sm bg-destructive hover:bg-destructive"
                      onClick={() => setFormData({ ...formData, fileImages: formData.fileImages?.filter((_, i) => i !== idx) })}
                      title="Remove new image"
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </Button>
                  </div>
                ))}

                {/* Upload Button/Dropzone */}
                {((formData.images?.length || 0) + (formData.fileImages?.length || 0)) < 5 && (
                  <div
                    className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed transition-all duration-200 shrink-0 ${
                      dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files) {
                          const currentCount = (formData.images?.length || 0) + (formData.fileImages?.length || 0);
                          const maxAllowed = Math.max(0, 5 - currentCount);
                          const newFiles = Array.from(e.target.files).slice(0, maxAllowed);
                          
                          if (newFiles.length > 0) {
                            setFormData({ 
                              ...formData, 
                              fileImages: [...(formData.fileImages || []), ...newFiles] 
                            });
                          }
                        }
                      }}
                    />
                    <UploadCloud className="w-6 h-6 text-muted-foreground/70 mb-1" />
                    <span className="text-[10px] font-medium text-muted-foreground/80">Upload</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
