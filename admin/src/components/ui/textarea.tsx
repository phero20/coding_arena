import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, autoResize = true, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);

    const resize = () => {
      if (!autoResize) return;
      if (localRef.current) {
        localRef.current.style.height = "auto";
        localRef.current.style.height = `${localRef.current.scrollHeight + 2}px`;
      }
    };

    React.useEffect(() => {
      if (autoResize) resize();
    }, [props.value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      resize();
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          autoResize ? "resize-none overflow-hidden" : "",
          className,
        )}
        onChange={handleChange}
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
