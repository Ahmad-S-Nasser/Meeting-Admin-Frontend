import { api } from "./client";

export type OrgRole = "Owner" | "Member";

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  role: OrgRole;
}

export interface MeResponse {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  role: OrgRole;
}

export const authApi = {
  signup: (email: string, password: string, name: string, organizationName: string) =>
    api.post<AuthResponse>("/api/v1/auth/signup", { email, password, name, organizationName }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/v1/auth/login", { email, password }),
  me: (token: string) => api.get<MeResponse>("/api/v1/me", token),
};
