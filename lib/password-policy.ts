/** Mirrors the server's staff password rules (`mls-server/src/utils/password-policy.ts`). */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;

export interface PasswordRule {
  label: string;
  met: boolean;
}

/**
 * Checks a candidate password against each rule, so the form can show which
 * ones are still unmet.
 *
 * @param value - The candidate new password.
 */
export function checkPassword(value: string): PasswordRule[] {
  return [
    {
      label: `${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
      met: value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
    },
    { label: "A lowercase letter", met: /[a-z]/.test(value) },
    { label: "An uppercase letter", met: /[A-Z]/.test(value) },
    { label: "A number", met: /[0-9]/.test(value) },
    { label: "A symbol", met: /[^A-Za-z0-9]/.test(value) },
  ];
}
