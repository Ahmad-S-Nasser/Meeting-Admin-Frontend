import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { AcceptInvitePage } from "./pages/AcceptInvitePage";
import { MeetingsListPage } from "./pages/MeetingsListPage";
import { NewMeetingPage } from "./pages/NewMeetingPage";
import { MeetingDetailPage } from "./pages/MeetingDetailPage";
import { CallPage } from "./pages/CallPage";
import { OrgSettingsPage } from "./pages/OrgSettingsPage";
import { GuestJoinPage } from "./pages/GuestJoinPage";

export default function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invites/:token" element={<AcceptInvitePage />} />
      <Route path="/join/:token" element={<GuestJoinPage />} />

      <Route element={<RequireAuth />}>
        {/* CallPage is full-screen, deliberately outside AppLayout's nav/header chrome. */}
        <Route path="/meetings/:id/call" element={<CallPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/meetings" replace />} />
          <Route path="/meetings" element={<MeetingsListPage />} />
          <Route path="/meetings/new" element={<NewMeetingPage />} />
          <Route path="/meetings/:id" element={<MeetingDetailPage />} />
          <Route path="/org" element={<OrgSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
