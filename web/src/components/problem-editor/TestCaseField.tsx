"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { beautifyTestCaseInput } from "@/lib/test-case";
import { Card } from "../ui/card";

interface TestCaseFieldProps {
  label: string;
  value: string;
  isOutput?: boolean;
}

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
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3" />
      )}
    </Button>
  );
};

export const TestCaseField: React.FC<TestCaseFieldProps> = ({
  label,
  value,
  isOutput,
}) => {
  const displayValue = !isOutput ? beautifyTestCaseInput(value) : value;

  return (
    <Card className="space-y-1.5 group p-4 ">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
          {label}
        </label>
        <CopyButton value={displayValue} />
      </div>
      <div
        className={cn(
          "w-full p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap transition-all duration-300",
          "bg-muted border border-border",
          isOutput ? "text-foreground" : "text-primary/90",
        )}
      >
        {displayValue}
      </div>
    </Card>
  );
};
