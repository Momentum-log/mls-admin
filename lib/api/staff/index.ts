import apiClient from "../index";
import {
  Role,
  Staff,
  CreateRolePayload,
  CreateStaffPayload,
  AssignRolePayload,
  PermissionGroup,
  UpdateRolePayload,
} from "@/types/staff";

// ─── STAFF MANAGEMENT ────────────────────────────────────────────────────────

export const getAllRoles = async (): Promise<Role[]> => {
  const { data } = await apiClient.get<Role[]>("/admin/staff/get-all-roles");
  return data;
};

export const createNewRole = async (
  payload: CreateRolePayload,
): Promise<Role> => {
  const { data } = await apiClient.post<Role>(
    "/admin/staff/create-new-role",
    payload,
  );
  return data;
};

export const updateRole = async (
  id: string,
  payload: UpdateRolePayload,
): Promise<Role> => {
  const { data } = await apiClient.put<Role>(
    `/admin/staff/update-role/${id}`,
    payload,
  );
  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/staff/delete-role/${id}`);
};

export const getPermissions = async (): Promise<PermissionGroup[]> => {
  const { data } = await apiClient.get<PermissionGroup[]>(
    "/admin/staff/roles/permissions",
  );
  return data;
};

export const getAllStaff = async (): Promise<Staff[]> => {
  const { data } = await apiClient.get<Staff[]>("/admin/staff/get-all-staff");
  return data;
};

export const createNewStaff = async (
  payload: CreateStaffPayload,
): Promise<Staff> => {
  const { data } = await apiClient.post<Staff>(
    "/admin/staff/create-new-staff",
    payload,
  );
  return data;
};

export const assignStaffRole = async (
  id: string,
  payload: AssignRolePayload,
): Promise<Staff> => {
  const { data } = await apiClient.put<Staff>(
    `/admin/staff/assign-staff-role/${id}`,
    payload,
  );
  return data;
};

export const suspendStaff = async (id: string): Promise<Staff> => {
  const { data } = await apiClient.put<Staff>(`/admin/staff/suspend-staff/${id}`);
  return data;
};

export const enableStaff = async (id: string): Promise<Staff> => {
  const { data } = await apiClient.put<Staff>(`/admin/staff/enable-staff/${id}`);
  return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/staff/delete-staff/${id}`);
};
