"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, X, Send, Bug, Palette, Lightbulb, MessageSquare, ChevronLeft, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReportBugForm } from "@/hooks/use-report-bug-form";

export function ReportBugForm() {
  const router = useRouter();
  const {
    type, setType,
    title, setTitle,
    description, setDescription,
    dragActive, files, isPending, isError, error, isSuccess, resetMutation,
    handleDrag, handleDrop, handleChange, removeFile,
    handleSubmit
  } = useReportBugForm();
  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-24">
      <div className="lg:col-span-2 flex flex-col justify-start pt-4 space-y-6">
         <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10  border border-border transition-all"
              onClick={() => router.back()}
              title="Go Back"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </Button>
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Report an Issue
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Found a bug? Have a brilliant feature request? Or maybe just some UI feedback? 
            Let us know so we can make SlaveCode better for everyone.
          </p>
        </div>
        
        <div className="p-6 bg-secondary/30 rounded-2xl border border-border/50">
          <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
            We will review your feedback and work on resolving the issue as soon as possible. Thank you for helping us improve!
          </p>
        </div>
      </div>

      {/* Right Column: Form Fields directly on the background */}
      <div className="lg:col-span-3 space-y-6 pt-4">
        {isSuccess ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Report Submitted</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Thank you for helping us make SlaveCode better! We've received your feedback and will look into it shortly.
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft />Back 
              </Button>
              <Button onClick={() => resetMutation()}>
                Submit Another
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issue Type */}
          <div className="space-y-3">
            <Label htmlFor="type" className="text-sm font-semibold text-foreground/80">Issue Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="w-full h-11 bg-background/50">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center">
                    <Bug className="w-4 h-4 mr-2 text-difficulty-medium" />
                    Bug / Error
                  </div>
                </SelectItem>
                <SelectItem value="ui">
                  <div className="flex items-center">
                    <Palette className="w-4 h-4 mr-2 text-primary" />
                    UI / Design Issue
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-difficulty-easy" />
                    Feature Request
                  </div>
                </SelectItem>
                <SelectItem value="feedback">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-foreground" />
                    General Feedback
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-4">
            <Label htmlFor="subject" className="text-sm font-semibold text-foreground/80">Subject</Label>
            <Input 
              id="subject" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Code editor freezes on large files" 
              className="w-full h-11 bg-background/50" 
            />
          </div>
        </div>

        {/* Description (Textarea) */}
        <div className="space-y-4">
          <Label htmlFor="description" className="text-sm font-semibold text-foreground/80">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[300px] w-full rounded-md border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y custom-scrollbar"
            placeholder={`• Bug/Issue: What happened? Include steps to reproduce if possible.\n• Feature Request: What should we add and why?\n• UI/Feedback: Any design tweaks or general thoughts you'd like to share?`}
          />
        </div>

        {/* Screenshot Upload & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
          <div className="space-y-2 flex-grow">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-semibold text-foreground/80">Screenshots (Optional)</Label>
              <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                {files.length}/5 uploaded
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Image Previews */}
              {files.map((f) => (
                <div 
                  key={f.id} 
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-background/50"
                >
                  <img 
                    src={f.preview} 
                    alt="Screenshot preview" 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Remove Button (Always Visible) */}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow-sm bg-destructive/90 hover:bg-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile(f.id);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {/* Upload Button/Dropzone */}
              {files.length < 5 && (
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
                    id="file-upload"
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <UploadCloud className="w-6 h-6 text-muted-foreground/70 mb-1" />
                  <span className="text-[10px] font-medium text-muted-foreground/80">Upload</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 mb-2 flex flex-col items-end gap-2">
            {isError && (
              <span className="text-sm text-destructive font-medium">
                {error?.message || "Something went wrong"}
              </span>
            )}
            <Button size="lg" onClick={handleSubmit} disabled={isPending || !title || !description}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                   <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
