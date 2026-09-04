// Lightweight client-side moderation for KIT AI study groups.
// Filters profanity/harassment and nudges off-topic chat back toward learning.

const BANNED = [
  // profanity / slurs (kept short; matched as whole-ish words)
  "fuck","shit","bitch","asshole","bastard","dick","piss","cunt","slut","whore",
  "nigger","nigga","faggot","retard","retarded","kys","kill yourself",
  // harassment / threats
  "i hate you","shut up loser","go die",
  // sexual content
  "porn","nude","nudes","sex chat","sexting",
];

const EDU_HINTS = [
  "math","algebra","geometry","calculus","science","biology","chemistry","physics",
  "history","geography","english","grammar","essay","study","homework","exam","test",
  "question","answer","problem","solve","formula","equation","theory","chapter","lesson",
  "syllabus","teacher","class","school","university","college","note","notes","read",
  "book","practice","quiz","revision","revise","learn","explain","define","example",
  "project","assignment","syllabi","ecz","zambia","subject","topic","concept",
  "hi","hello","hey","thanks","thank you","please","ok","yes","no","help",
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}

export type ModerationResult = { ok: true } | { ok: false; reason: string };

export function moderateMessage(raw: string): ModerationResult {
  const text = normalize(raw);
  if (!text) return { ok: false, reason: "Message is empty." };
  if (raw.length > 1000) return { ok: false, reason: "Message is too long (max 1000 characters)." };

  for (const word of BANNED) {
    const re = new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(\\s|$)`, "i");
    if (re.test(text)) {
      return { ok: false, reason: "Please keep messages respectful and free of profanity or harassment." };
    }
  }

  // Only enforce education focus for longer messages so short greetings/acks pass.
  const words = text.split(" ");
  if (words.length >= 6) {
    const hasEdu = EDU_HINTS.some((k) => text.includes(k));
    if (!hasEdu) {
      return {
        ok: false,
        reason: "Study groups are for learning. Try framing your message around a subject, question, or study topic.",
      };
    }
  }

  return { ok: true };
}