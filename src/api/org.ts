import { api } from "./client";
import type { OrgRole } from "./auth";

export interface OrgMember {
  userId: string;
  email: string;
  name: string;
  role: OrgRole;
  joinedAt: string;
}

export const orgApi = {
  members: (token: string) => api.get<OrgMember[]>("/api/v1/org/members", token),
  invite: (email: string, token: string) => api.post<void>("/api/v1/org/invites", { email }, token),
};
