import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserAdmin } from "@/hooks/useUserAdmin";
import { Loader2, ChevronLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/user";

interface UserEditorProps {
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserEditor({ id, onSuccess, onCancel }: UserEditorProps) {
  const { users, createUser, updateUser, isCreating, isUpdating, isLoading } =
    useUserAdmin();

  const initialData = id ? users.find((u) => u.id === id) : null;
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    fullName: "",
    status: "active",
    role: "user",
    githubUsername: "",
    linkedinUsername: "",
    leetcodeUsername: "",
  });

  useEffect(() => {
    if (!initialData) {
      setFormData({
        username: "",
        email: "",
        fullName: "",
        status: "active",
        role: "user",
        githubUsername: "",
        linkedinUsername: "",
        leetcodeUsername: "",
      });
      return;
    }

    setFormData({
      ...initialData,
      status: initialData.status || "active",
      role: initialData.role || "user",
    });
  }, [initialData]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await updateUser({ id, payload: formData });
    } else {
      await createUser(formData);
    }
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full min-h-0 space-y-4 p-1"
    >
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onCancel}
            className="gap-1 rounded-full shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {id ? "Edit User" : "Create User"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {id
                ? "Update user profile, status, and role."
                : "Manually add a new user to the platform."}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="gap-2 px-4"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save User"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Username</Label>
              <Input
                required
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Role</Label>
              <Select
                key={formData.role}
                value={formData.role}
                onValueChange={(value: "user" | "admin" | "moderator") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Status</Label>
              <Select
                key={formData.status}
                value={formData.status}
                onValueChange={(
                  value: "active" | "inactive" | "banned" | "suspended",
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>GitHub Username</Label>
              <Input
                value={formData.githubUsername || ""}
                onChange={(e) =>
                  setFormData({ ...formData, githubUsername: e.target.value })
                }
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>LinkedIn Username</Label>
              <Input
                value={formData.linkedinUsername || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedinUsername: e.target.value })
                }
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>LeetCode Username</Label>
              <Input
                value={formData.leetcodeUsername || ""}
                onChange={(e) =>
                  setFormData({ ...formData, leetcodeUsername: e.target.value })
                }
                placeholder="johndoe"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
