/** coon-meeting-sdk's CallRoom hands back a raw recording Blob and requires the host app to
 * decide where it goes (see the SDK's own docs - recording is entirely client-side, Coon.Meeting
 * never stores it). Triggering a browser download is the simplest real, durable persistence path
 * available without adding dashboard-backend storage - the user ends up with the file on disk.
 */
export function recordingExtension(mimeType: string, includesVideo: boolean): string {
  if (mimeType.includes("mp4")) return includesVideo ? "mp4" : "m4a";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  return includesVideo ? "mp4" : "m4a";
}

export function downloadRecording(blob: Blob, meta: { startedAt: Date; mimeType: string; includesVideo: boolean }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meeting-recording-${meta.startedAt.toISOString().replace(/[:.]/g, "-")}.${recordingExtension(meta.mimeType, meta.includesVideo)}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
