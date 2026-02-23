export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  adminCode: string;
  isActive: boolean;
  role: Role;
  lastActive: string;
  lastLogin: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateStaffPayload {
  email: string;
  name: string;
  roleId?: string;
  inlineRole?: CreateRolePayload;
}

export interface AssignRolePayload {
  roleId: string;
  notify?: boolean;
}
