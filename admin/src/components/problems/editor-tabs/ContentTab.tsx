import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContentTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ContentTab({ formData, setFormData }: ContentTabProps) {
  return (
    <div className="grid grid-cols-1  gap-8 h-full min-h-[600px]">
      <div className="space-y-2 flex flex-col h-full">
        <Label htmlFor="description">Problem Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="flex-grow min-h-[400px] font-mono text-sm resize-y"
          required
        />
      </div>

      <div className="space-y-2 flex flex-col h-full">
        <Label htmlFor="solutions">Solutions / Explanation</Label>
        <Textarea
          id="solutions"
          value={formData.solutions}
          onChange={(e) =>
            setFormData({ ...formData, solutions: e.target.value })
          }
          className="min-h-[400px] font-mono text-sm resize-y"
          placeholder="Write the official solution or editorial here..."
        />
      </div>
    </div>
  );
}
