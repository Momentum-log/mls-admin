import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRoles,
  createNewRole,
  updateRole,
  deleteRole,
  getPermissions,
  getAllStaff,
  createNewStaff,
  assignStaffRole,
  suspendStaff,
  enableStaff,
  deleteStaff,
} from "@/lib/api/staff";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CreateRolePayload,
  CreateStaffPayload,
  AssignRolePayload,
  UpdateRolePayload,
} from "@/types/staff";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createNewRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create role"));
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update role"));
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete role"));
    },
  });
};

export const useAvailablePermissions = () => {
  return useQuery({
    queryKey: ["available-permissions"],
    queryFn: getPermissions,
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createNewStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] }); // Roles might have changed if inlineRole was used
      toast.success("Staff member created successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to create staff"));
    },
  });
};

export const useAssignStaffRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignRolePayload }) =>
      assignStaffRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff role updated successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to assign role"));
    },
  });
};

export const useSuspendStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suspendStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff suspended successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to suspend staff"));
    },
  });
};

export const useEnableStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enableStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff enabled successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to enable staff"));
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member deleted successfully");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to delete staff"));
    },
  });
};
