
export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  department: string;
  password?: string;
};

export type Permissions = {
  [userId: string]: 'owner' | 'write' | 'read';
};

export type DepartmentPermissions = {
  [department: string]: 'write' | 'read';
};

export type Document = {
  id:string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'excel';
  modified: string;
  size: string;
  content?: string;
  url?: string;
  permissions: Permissions;
  departmentPermissions?: DepartmentPermissions;
  ownerId: string;
};

export type Folder = {
  id: string;
  name: string;
  type: 'folder';
  modified: string;
  size: string;
  children: FileSystemItem[];
  permissions: Permissions;
  departmentPermissions?: DepartmentPermissions;
  ownerId: string;
};

export type FileSystemItem = Folder | Document;
