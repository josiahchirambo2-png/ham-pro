// Client-side end-to-end encryption for study group chat.
// The room key never leaves the device in plaintext — the server only stores a
// bcrypt hash of it (group_secrets), so messages cannot be read server-side.

const PREFIX = "hpx1:";
const KEY_STORE = "hampro_roomkeys_v1";

function b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s);
}

function unb64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function deriveRoomKey(passphrase: string, groupId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(`hampro:${groupId}`), iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptMessage(plain: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  return `${PREFIX}${b64(iv)}.${b64(ct)}`;
}

export function isEncrypted(payload: string): boolean {
  return typeof payload === "string" && payload.startsWith(PREFIX);
}

export async function decryptMessage(payload: string, key: CryptoKey | null): Promise<string> {
  if (!isEncrypted(payload)) return payload;
  if (!key) return "🔒 Locked — enter the room key to read this message";
  try {
    const [ivPart, ctPart] = payload.slice(PREFIX.length).split(".");
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(ivPart) },
      key,
      unb64(ctPart) as unknown as BufferSource,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return "🔒 Could not decrypt — wrong room key";
  }
}

// Room keys are kept only in this browser.
function readStore(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY_STORE) || "{}"); } catch { return {}; }
}

export function getStoredRoomKey(groupId: string): string | null {
  return readStore()[groupId] ?? null;
}

export function storeRoomKey(groupId: string, passphrase: string) {
  const s = readStore();
  s[groupId] = passphrase;
  try { localStorage.setItem(KEY_STORE, JSON.stringify(s)); } catch { /* ignore */ }
}

export function clearRoomKey(groupId: string) {
  const s = readStore();
  delete s[groupId];
  try { localStorage.setItem(KEY_STORE, JSON.stringify(s)); } catch { /* ignore */ }
}
