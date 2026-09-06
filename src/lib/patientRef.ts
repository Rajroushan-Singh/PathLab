/** Encode patient UID for URLs — avoids exposing raw IDs in the address bar. */
export function encodePatientRef(userUid: string): string {
  const bytes = new TextEncoder().encode(userUid);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode patient ref from URL back to user_uid. */
export function decodePatientRef(ref: string): string {
  try {
    const base64 = ref.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? base64 : base64 + "=".repeat(4 - (base64.length % 4));
    const binary = atob(pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return ref;
  }
}

export function patientDetailPath(userUid: string): string {
  return `/patient/${encodePatientRef(userUid)}`;
}
