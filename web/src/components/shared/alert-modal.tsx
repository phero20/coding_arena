import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryActionLabel?: string;
  primaryAction?: () => void;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
  hideCancel?: boolean;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  description,
  icon = <AlertTriangle className="w-6 h-6 text-primary" />,
  primaryActionLabel = "Home",
  primaryAction,
  cancelLabel = "Cancel",
  variant = "default",
  hideCancel = false,
}: AlertModalProps) {
  const handlePrimaryAction = () => {
    if (primaryAction) {
      primaryAction();
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            {icon && (
              <div className="flex items-center justify-center rounded-full bg-muted p-3 text-foreground">
                {icon}
              </div>
            )}
            <AlertDialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground mt-4 text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          {!hideCancel && (
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={onClose}>
                {cancelLabel}
              </Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button variant={variant} onClick={handlePrimaryAction}>
              {primaryActionLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
