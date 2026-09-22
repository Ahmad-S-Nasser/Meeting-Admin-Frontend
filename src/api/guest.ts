import { api } from "./client";

export interface GuestJoinPreview {
  meetingId: string;
  meetingTitle: string;
  scope: "Any" | "Attendee";
  prefilledName?: string;
}

export interface GuestJoinToken {
  token: string;
  expiresAt: string;
  meetingId: string;
  participantName: string;
  canShareScreen: boolean;
  canRecord: boolean;
}

// Fully anonymous - no session token on either call.
export const guestApi = {
  preview: (joinToken: string) => api.get<GuestJoinPreview>(`/api/v1/guest/join-links/${joinToken}`),
  mintToken: (joinToken: string, name: string) =>
    api.post<GuestJoinToken>(`/api/v1/guest/join-links/${joinToken}/token`, { name }),
};
