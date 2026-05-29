export interface Workspace {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Diagram {
  id: string;
  workspaceId: string;
  title: string;
  documentState: any; // Serialized Tldraw store state
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

export interface UpdateWorkspaceInput {
  name: string;
}

export interface CreateDiagramInput {
  title: string;
}

export interface UpdateDiagramInput {
  title?: string;
  documentState?: any;
}
