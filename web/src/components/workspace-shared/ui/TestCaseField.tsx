"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";
import type { TestCaseFieldProps } from "@/types/component.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { beautifyTestCaseInput, formatValue } from "@/lib/test-case";
import { Card } from "@/components/ui/card";
import { MultiTableRenderer, safeJsonParse, getTableFormat } from "./DataFrameRenderer";


const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-6 text-muted-foreground hover:text-primary transition-colors"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-3 text-status-accepted" />
      ) : (
        <Copy className="size-3" />
      )}
    </Button>
  );
};

export const TestCaseField: React.FC<
  TestCaseFieldProps & { isError?: boolean; problemTopics?: string[] }
> = ({ label, value, isOutput, isError, problemTopics = [] }) => {
  const parsedValue = safeJsonParse(value);

  const isDatabaseProblem = useMemo(() => {
    return problemTopics?.includes("Database") || problemTopics?.includes("Pandas");
  }, [problemTopics]);

  const isTableLayout = !isError && isDatabaseProblem && (getTableFormat(parsedValue) !== null || (typeof parsedValue === "object" && parsedValue !== null && !Array.isArray(parsedValue) && Object.values(parsedValue).some(v => getTableFormat(safeJsonParse(v)) !== null)));

  const displayValue = isError 
    ? value 
    : isOutput 
      ? formatValue(parsedValue)
      : beautifyTestCaseInput(value);

  return (
    <Card className="space-y-1.5 group p-4 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 px-0.5">
          {isError && <AlertCircle className="size-3 text-destructive" />}
          <label
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isError ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {label}
          </label>
        </div>
        <CopyButton value={typeof value === 'string' ? value : JSON.stringify(value)} />
      </div>
      <div
        className={cn(
          "w-full p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap transition-all duration-300",
          "border",
          isError
            ? "border-destructive/20 bg-destructive/5 text-destructive"
            : "border-border bg-muted",
          isOutput && !isError ? "text-foreground" : "",
          !isOutput && !isError ? "text-primary/90" : "",
        )}
      >
        {isTableLayout ? <MultiTableRenderer value={parsedValue} /> : displayValue}
      </div>
    </Card>
  );
};
