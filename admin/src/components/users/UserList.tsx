import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useUserAdmin } from "@/hooks/useUserAdmin";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface UserListProps {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function UserList({ onView, onEdit }: UserListProps) {
  const { users, isLoading, isError, error, deleteUser } = useUserAdmin();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.fullName && user.fullName.toLowerCase().includes(query))
    );
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="secondary" className="bg-green-500/10 text-green-500">{status}</Badge>;
      case "inactive": return <Badge variant="secondary">{status}</Badge>;
      case "banned": return <Badge variant="destructive">{status}</Badge>;
      case "suspended": return <Badge variant="destructive" className="bg-orange-500/10 text-orange-500">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge variant="default">{role}</Badge>;
      case "moderator": return <Badge variant="secondary">{role}</Badge>;
      case "user": return <Badge variant="outline">{role}</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading users...">
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by username, email, or name..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(!filteredUsers || filteredUsers.length === 0) ? (
          <EmptyState message="No matching users found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs uppercase">
                            {user.username.slice(0, 2)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span>{user.username}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onView(user.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(user.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </QueryState>
  );
}
