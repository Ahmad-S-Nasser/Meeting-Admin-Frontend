import { api } from "./client";
import type { AuthResponse } from "./auth";

export interface InvitePreview {
  organizationName: string;
  email: string;
}

export const invitesApi = {
  preview: (token: string) => api.get<InvitePreview>(`/api/v1/invites/${token}`),
  acceptNew: (token: string, name: string, password: string) =>
    api.post<AuthResponse>(`/api/v1/invites/${token}/accept-new`, { name, password }),
  accept: (token: string, sessionToken: string) =>
    api.post<AuthResponse>(`/api/v1/invites/${token}/accept`, undefined, sessionToken),
};
