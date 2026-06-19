import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExecutionTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ExecutionTab({ formData, setFormData }: ExecutionTabProps) {
  return (
    <div className="space-y-6 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="function_signature">
            Function Signature (JSON)
          </Label>
          <Textarea
            id="function_signature"
            value={formData.function_signature}
            onChange={(e) =>
              setFormData({
                ...formData,
                function_signature: e.target.value,
              })
            }
            className="min-h-[250px] font-mono text-xs bg-muted/30"
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="class_signature">Class Signature (JSON)</Label>
          <Textarea
            id="class_signature"
            value={formData.class_signature}
            onChange={(e) =>
              setFormData({ ...formData, class_signature: e.target.value })
            }
            className="min-h-[250px] font-mono text-xs bg-muted/30"
            placeholder="{}"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 flex flex-col h-full">
          <Label htmlFor="code_snippets">Code Snippets (JSON)</Label>
          <Textarea
            id="code_snippets"
            value={formData.code_snippets}
            onChange={(e) =>
              setFormData({ ...formData, code_snippets: e.target.value })
            }
            className="min-h-[400px] font-mono text-xs bg-muted/30"
            placeholder={`{"python": "def solve(): pass"}`}
          />
        </div>
        <div className="space-y-2 flex flex-col h-full">
          <Label htmlFor="judging_policy">
            Judging Policy (JSON)
          </Label>
          <Textarea
            id="judging_policy"
            value={formData.judging_policy}
            onChange={(e) =>
              setFormData({
                ...formData,
                judging_policy: e.target.value,
              })
            }
            className="min-h-[400px] font-mono text-xs bg-muted/30"
            placeholder={`{"comparator_mode": "problem_specific", "output_order": "any_order"}`}
          />
        </div>
      </div>
    </div>
  );
}
