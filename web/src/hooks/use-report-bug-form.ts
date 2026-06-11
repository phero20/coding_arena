import { useState, useEffect, useRef } from "react";
import { useSubmitReportBugMutation } from "./mutations/use-report-bug.mutations";
import { toast } from "sonner"; // Assuming sonner is used for toasts, or we can just navigate away

export interface PreviewFile {
  id: string;
  file: File;
  preview: string;
}

export function useReportBugForm() {
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);

  const { mutateAsync: submitReport, isPending, isError, error, isSuccess, reset } = useSubmitReportBugMutation();

  // Cleanup object URLs when component unmounts
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (newFilesList: FileList | File[]) => {
    const validFiles = Array.from(newFilesList).filter((f) => f.type.startsWith("image/"));
    
    setFiles((prev) => {
      if (prev.length >= 5) return prev;
      
      const toAdd = validFiles.slice(0, 5 - prev.length);
      const newPreviewFiles = toAdd.map((f) => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        preview: URL.createObjectURL(f),
      }));
      
      return [...prev, ...newPreviewFiles];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!title || !description || !type) return;

    try {
      await submitReport({
        title,
        description,
        type,
        images: files.map((f) => f.file),
      });

      // Reset form on success
      setTitle("");
      setDescription("");
      setType("bug");
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      
      toast?.success?.("Bug report submitted successfully!");
    } catch (error: any) {
      toast?.error?.(error.message || "Failed to submit bug report");
    }
  };

  return {
    type,
    setType,
    title,
    setTitle,
    description,
    setDescription,
    dragActive,
    files,
    isPending,
    isError,
    error,
    isSuccess,
    resetMutation: reset,
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    handleSubmit,
  };
}
