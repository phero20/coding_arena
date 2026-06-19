import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

interface ExamplesRulesTabProps {
  formData: any;
  setFormData: (data: any) => void;
  addConstraint: () => void;
  updateConstraint: (idx: number, text: string) => void;
  removeConstraint: (idx: number) => void;
  addHint: () => void;
  updateHint: (idx: number, text: string) => void;
  removeHint: (idx: number) => void;
  addFollowUp: () => void;
  updateFollowUp: (idx: number, text: string) => void;
  removeFollowUp: (idx: number) => void;
  addExample: () => void;
  updateExample: (idx: number, text: string) => void;
  removeExample: (idx: number) => void;
}

export function ExamplesRulesTab({
  formData,
  addConstraint,
  updateConstraint,
  removeConstraint,
  addHint,
  updateHint,
  removeHint,
  addFollowUp,
  updateFollowUp,
  removeFollowUp,
  addExample,
  updateExample,
  removeExample,
}: ExamplesRulesTabProps) {
  return (
    <div className="space-y-8 flex flex-col">
      <div className="space-y-6 flex flex-col">
        {/* Constraints */}
        <div className="p-4 border rounded-md space-y-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Constraints</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addConstraint}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Constraint
            </Button>
          </div>
          <div className="space-y-3">
            {formData.constraints.map((constraint: string, idx: number) => (
              <div key={idx} className="relative group flex items-center gap-1">
                <Input
                  value={constraint}
                  onChange={(e) => updateConstraint(idx, e.target.value)}
                  placeholder={`Constraint ${idx + 1}`}
                  className="pr-10 bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeConstraint(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {formData.constraints.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No constraints added yet.
              </p>
            )}
          </div>
        </div>

        {/* Hints */}
        <div className="p-4 border rounded-md space-y-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Hints</Label>
            <Button type="button" variant="outline" size="sm" onClick={addHint}>
              <Plus className="h-4 w-4 mr-2" /> Add Hint
            </Button>
          </div>
          <div className="space-y-3">
            {formData.hints.map((hint: string, idx: number) => (
              <div key={idx} className="relative group flex items-center gap-1">
                <Input
                  value={hint}
                  onChange={(e) => updateHint(idx, e.target.value)}
                  placeholder={`Hint ${idx + 1}`}
                  className="pr-10 bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHint(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {formData.hints.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No hints added yet.
              </p>
            )}
          </div>
        </div>

        {/* Follow Ups */}
        <div className="p-4 border rounded-md space-y-4 bg-muted/5">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Follow Ups</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFollowUp}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Follow Up
            </Button>
          </div>
          <div className="space-y-3">
            {formData.follow_ups.map((follow: string, idx: number) => (
              <div key={idx} className="relative group flex items-center gap-1">
                <Input
                  value={follow}
                  onChange={(e) => updateFollowUp(idx, e.target.value)}
                  placeholder={`Follow up ${idx + 1}`}
                  className="pr-10 bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFollowUp(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {formData.follow_ups.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No follow ups added yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Examples</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExample}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Example
          </Button>
        </div>
        {formData.examples.map((ex: any, idx: number) => (
          <div
            key={idx}
            className="p-4 border rounded-md space-y-3 bg-muted/10 relative group"
          >
            <div className="flex items-center w-full justify-between">
              <Label className="text-muted-foreground text-xs font-semibold">
                Example {idx + 1}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExample(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <Textarea
              placeholder="Input: ...\nOutput: ..."
              value={ex.example_text}
              onChange={(e) => updateExample(idx, e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
        ))}
        {formData.examples.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No examples added yet.
          </p>
        )}
      </div>
    </div>
  );
}
