"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useCreateSolution, useUpdateSolution } from "@/hooks/mutations/use-solution.mutations";
import { toast } from "sonner";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

// Components
import { SolutionEditorHeader } from "./components/SolutionEditorHeader";
import { SolutionEditorStyles } from "./components/SolutionEditorStyles";

// Hooks & Constants
import { useSolutionMdeOptions } from "./hooks/use-solution-mde-options";
import { INITIAL_SOLUTION_TEMPLATE } from "./constants/solution.constants";

// Register languages for PrismLight
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";

SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("c++", cpp);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("sql", sql);

// Import EasyMDE CSS
import "easymde/dist/easymde.min.css";

// Dynamic import for SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

interface SolutionEditorProps {
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  onSuccess?: () => void;
  solutionId?: string;
  initialTitle?: string;
  initialContent?: string;
}

export const SolutionEditor: React.FC<SolutionEditorProps> = ({
  problemId,
  problemTitle,
  problemSlug,
  onSuccess,
  solutionId,
  initialTitle = "",
  initialContent = INITIAL_SOLUTION_TEMPLATE,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const { mutate: createSolution, isPending: isCreating } = useCreateSolution(problemId);
  const { mutate: updateSolution, isPending: isUpdating } = useUpdateSolution(problemId);
  const isPending = isCreating || isUpdating;
  const isEditMode = !!solutionId;

  const mdeOptions = useSolutionMdeOptions();

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error("Please provide both a title and content.");
      return;
    }

    if (trimmedTitle.length < 5) {
      toast.error("Title must be at least 5 characters long.");
      return;
    }

    if (trimmedContent.length < 20) {
      toast.error("Content must be at least 20 characters long.");
      return;
    }

    if (isEditMode && solutionId) {
      updateSolution(
        { solutionId, data: { title: trimmedTitle, content: trimmedContent, language: "markdown" } },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to update.");
          },
        },
      );
    } else {
      createSolution(
        { 
          title: trimmedTitle, 
          content: trimmedContent, 
          language: "markdown",
          problemTitle,
          problemSlug
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to publish.");
          },
        },
      );
    }
  }, [title, content, isEditMode, solutionId, createSolution, updateSolution, onSuccess]);

  return (
    <div className="solution-editor-root p-4">
      <SolutionEditorStyles />
      
      <SolutionEditorHeader
        title={title}
        setTitle={setTitle}
        isEditMode={isEditMode}
        isPending={isPending}
        onPublish={handleSubmit}
      />

      <SimpleMDE value={content} onChange={setContent} options={mdeOptions as any} />
    </div>
  );
};
