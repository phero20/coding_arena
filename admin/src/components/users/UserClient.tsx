"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { UserList } from "./UserList";
import { UserEditor } from "./UserEditor";
import { UserViewer } from "./UserViewer";

export function UserClient() {
  return (
    <AcademyDataPage
      title="User Management"
      description="Manage platform users, roles, and statuses."
      itemNamePlural="Users"
      renderTable={(props) => <UserList {...props} />}
      renderViewer={(props) => <UserViewer {...props} />}
      renderEditor={(props) => <UserEditor {...props} />}
    />
  );
}
