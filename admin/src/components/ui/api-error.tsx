import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiErrorProps {
  error: any;
  title?: string;
  className?: string;
}

export function ApiError({ error, title = "Error", className }: ApiErrorProps) {
  if (!error) return null;

  // Extract message from Axios error format (backend standard), standard Error, or string
  let errorMessage = "An unexpected error occurred.";
  
  if (error?.response?.data?.message) {
    // Coding Arena Backend format: { success: false, message: "...", error: "..." }
    errorMessage = error.response.data.message;
  } else if (error?.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Final safety check: if errorMessage somehow ended up being an object (e.g. {code, message}), extract or stringify
  if (typeof errorMessage === "object" && errorMessage !== null) {
    errorMessage = (errorMessage as any).message || JSON.stringify(errorMessage);
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}
