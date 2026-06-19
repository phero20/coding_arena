import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function BasicInfoTab({ formData, setFormData }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="problem_id">Problem ID</Label>
          <Input
            id="problem_id"
            value={formData.problem_id}
            onChange={(e) =>
              setFormData({ ...formData, problem_id: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="problem_slug">Slug</Label>
          <Input
            id="problem_slug"
            value={formData.problem_slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                problem_slug: e.target.value,
              })
            }
            required
          />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            key={formData.difficulty}
            value={formData.difficulty}
            onValueChange={(val) =>
              setFormData({ ...formData, difficulty: val })
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="problem_type">Problem Type</Label>
          <Select
            value={formData.problem_type}
            onValueChange={(val) =>
              setFormData({ ...formData, problem_type: val })
            }
          >
            <SelectTrigger id="problem_type">
              <SelectValue placeholder="Select problem type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="function">Function</SelectItem>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center justify-between rounded-md border p-4 shadow-sm bg-muted/10 h-full mt-2 md:mt-0">
          <div className="space-y-0.5 flex flex-col">
            <Label htmlFor="is_premium" className="text-sm font-medium cursor-pointer">
              Premium Problem
            </Label>
          </div>
          <Switch
            id="is_premium"
            checked={formData.is_premium}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_premium: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="topics">Topics (comma separated)</Label>
        <Input
          id="topics"
          value={formData.topics}
          onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
          placeholder="array, hash-table, math"
        />
      </div>
    </div>
  );
}
