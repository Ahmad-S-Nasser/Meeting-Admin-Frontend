import { api } from "./client";

export type MeetingStatus = "Scheduled" | "Cancelled";
export type MeetingVisibility = "Private" | "Any";

export interface MeetingAttendee {
  name: string;
  email?: string;
}

export interface BlockedParticipant {
  participantExternalId: string;
  name: string;
  email?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  timeZone?: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  createdByName: string;
  status: MeetingStatus;
  visibility: MeetingVisibility;
  isOrganizer: boolean;
  createdAt: string;
  updatedAt: string;
  attendees: MeetingAttendee[];
  blockedParticipants: BlockedParticipant[];
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  scheduledAt: string;
  timeZone?: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  visibility?: MeetingVisibility;
  attendees: { email: string; name?: string }[];
}

export interface UpdateMeetingInput {
  title: string;
  description?: string;
  scheduledAt: string;
  timeZone?: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  visibility?: MeetingVisibility;
}

export interface CallTokenResponse {
  token: string;
  expiresAt: string;
  meetingId: string;
  canShareScreen: boolean;
  canRecord: boolean;
}

export interface JoinLinkResponse {
  url: string;
}

export type PermissionMode = "OrganizerOnly" | "Selected" | "Everyone";

export interface PermissionPolicy {
  mode: PermissionMode;
  allowedParticipantIds: string[];
}

export interface SelectablePerson {
  externalId: string;
  name: string;
  email?: string;
}

/** Who may share a screen / record. The organizer always can, whatever this says. */
export interface MeetingSettings {
  screenShare: PermissionPolicy;
  recording: PermissionPolicy;
  people: SelectablePerson[];
}

export interface MyPermissions {
  canShareScreen: boolean;
  canRecord: boolean;
}

export interface InviteLink {
  url: string;
  /** "join-link": the reusable guest link - anyone with it can join. "meeting-page": only people
      already invited can open it. */
  kind: "join-link" | "meeting-page";
}

export const meetingsApi = {
  list: (token: string) => api.get<Meeting[]>("/api/v1/meetings", token),
  get: (id: string, token: string) => api.get<Meeting>(`/api/v1/meetings/${id}`, token),
  create: (input: CreateMeetingInput, token: string) => api.post<Meeting>("/api/v1/meetings", input, token),
  update: (id: string, input: UpdateMeetingInput, token: string) => api.put<void>(`/api/v1/meetings/${id}`, input, token),
  cancel: (id: string, token: string) => api.delete<void>(`/api/v1/meetings/${id}`, token),
  callToken: (id: string, token: string) => api.post<CallTokenResponse>(`/api/v1/meetings/${id}/call-token`, undefined, token),
  kickParticipant: (meetingId: string, participantExternalId: string, token: string) =>
    api.post<void>(`/api/v1/meetings/${meetingId}/participants/${encodeURIComponent(participantExternalId)}/kick`, undefined, token),
  blockParticipant: (meetingId: string, participantExternalId: string, token: string) =>
    api.post<void>(`/api/v1/meetings/${meetingId}/participants/${encodeURIComponent(participantExternalId)}/block`, undefined, token),
  unblockParticipant: (meetingId: string, participantExternalId: string, token: string) =>
    api.post<void>(`/api/v1/meetings/${meetingId}/participants/${encodeURIComponent(participantExternalId)}/unblock`, undefined, token),
  // "Any"-visibility shareable link - reusable by anyone, no attendee list involved.
  getOrCreateAnyJoinLink: (meetingId: string, token: string) =>
    api.post<JoinLinkResponse>(`/api/v1/meetings/${meetingId}/join-links/any`, undefined, token),
  revokeAnyJoinLink: (meetingId: string, token: string) =>
    api.delete<void>(`/api/v1/meetings/${meetingId}/join-links/any`, token),
  // Private-visibility: adds the email as a verified attendee and mints them a one-person link.
  inviteGuest: (meetingId: string, email: string, name: string | undefined, token: string) =>
    api.post<JoinLinkResponse>(`/api/v1/meetings/${meetingId}/join-links/attendee`, { email, name }, token),
  // Organizer only.
  getSettings: (meetingId: string, token: string) =>
    api.get<MeetingSettings>(`/api/v1/meetings/${meetingId}/settings`, token),
  updateSettings: (meetingId: string, settings: Pick<MeetingSettings, "screenShare" | "recording">, token: string) =>
    api.put<void>(`/api/v1/meetings/${meetingId}/settings`, settings, token),
  // Any participant - polled during a call so a change the organizer makes reaches everyone.
  myPermissions: (meetingId: string, token: string) =>
    api.get<MyPermissions>(`/api/v1/meetings/${meetingId}/my-permissions`, token),
  // Never creates a link - only the organizer mints one; this just reads what already exists.
  inviteLink: (meetingId: string, token: string) =>
    api.get<InviteLink>(`/api/v1/meetings/${meetingId}/invite-link`, token),
};
