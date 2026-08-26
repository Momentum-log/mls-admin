import apiClient from "../../index";

/**
 * Interface for the password rotation response.
 */
export interface RotationResponse {
  message: string;
}

/**
 * Triggers a manual rotation of the Super Admin password.
 * This endpoint is public but protected by the deterministically generated resetKey.
 *
 * @param resetKey - The 8-character Weekly Reset Key sent to the Super Admin via email.
 * @returns A success message if the rotation was successful.
 */
export const rotateSuperAdminPassword = async (
  resetKey: string,
): Promise<RotationResponse> => {
  const { data } = await apiClient.post<RotationResponse>(
    "/admin/security/rotate",
    {
    resetKey,
  });
  return data;
};
