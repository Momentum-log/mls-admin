/**
 * RBAC constants shared between the client's permission checks and the
 * places that guard the Super Admin role record itself.
 */

/**
 * Wildcard granting every permission. Seeded onto the Super Admin role.
 *
 * Prefer testing for this over the role's name when asking "is the current
 * admin a superuser" — renaming the role would otherwise revoke access.
 */
export const SUPERUSER_WILDCARD = "*";

/**
 * The name of the built-in Super Admin role.
 *
 * Used only where the *role record* is the subject — hiding its edit and
 * delete controls, or protecting staff assigned to it. The server guards the
 * same way (`staff.controller.ts` refuses to rename or delete a role by this
 * name), so matching on the name here keeps client and server consistent.
 *
 * Never use this to decide what the current admin may do; that is what the
 * wildcard is for.
 */
export const SUPER_ADMIN_ROLE_NAME = "Super Admin";
