export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
  // Support for OTP/Magic link if needed in future, but standard login for now
}

export interface AuthResponse {
  admin: User;
  token?: string;
  message?: string;
}
