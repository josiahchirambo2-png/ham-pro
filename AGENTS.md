# Project architecture rules

- Use `src/assets/kit-ai-symbol.png.asset.json` as the canonical KIT AI brand artwork; installed-app icons remain optimized files in `public/` because browser manifests require direct icon files.
- Study-group content is end-to-end encrypted with the room key (`src/lib/roomkey.ts`): chat messages, edits and every whiteboard event are stored as `hpx1:` ciphertext, and the room key itself is required (min 4 chars) at group creation and stored only on members' devices. The database enforces the `hpx1:` prefix for whiteboard payloads.
- Whiteboard strokes derive their AES key from the stored room key, or from the group-id fallback passphrase when the room has no key — events must always be `hpx1:` ciphertext to satisfy the database CHECK.
- Flashcards are offline-first in `localStorage` (`kitai_flashcards_v1`) with ts-fsrs scheduling; there is no server table for them.
- Live lessons embed Jitsi's public meet.jit.si (room per group); recording is intentionally not enabled until a Jitsi/8x8 account is connected.
- `pdfjs-dist` is dynamically imported inside the whiteboard only when a PDF is opened, so SSR never loads it.
