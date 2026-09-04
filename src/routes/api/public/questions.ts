/* ---------------------------------------------------------------------------
 * KIT AI public questions API  ·  written by hand by Josiah Brian Chirambo
 * GET /api/public/questions?subject=Mathematics&limit=5
 * Header: x-ham-api-key: <HAM_PRO_API_KEY>
 * Returns hand-typed ECZ past paper questions. No personal data is exposed.
 * ------------------------------------------------------------------------- */
import { createFileRoute } from "@tanstack/react-router";
import { ECZ_PAPERS } from "@/lib/ecz-past-papers";

function unauthorized() {
  return Response.json({ error: "Invalid or missing API key" }, { status: 401 });
}

export const Route = createFileRoute("/api/public/questions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env["HAM_PRO_API_KEY"];
        if (!expected) return Response.json({ error: "API not configured" }, { status: 503 });

        const url = new URL(request.url);
        const provided =
          request.headers.get("x-ham-api-key") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          url.searchParams.get("key");

        if (!provided || provided.length !== expected.length) return unauthorized();
        // constant-ish time compare, written out rather than pulled from a lib
        let diff = 0;
        for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
        if (diff !== 0) return unauthorized();

        const subject = url.searchParams.get("subject");
        const level = url.searchParams.get("level");
        const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 10));

        const papers = ECZ_PAPERS.filter(
          (p) =>
            (!subject || p.subject.toLowerCase() === subject.toLowerCase()) &&
            (!level || p.level.toLowerCase() === level.toLowerCase()),
        );
        const questions = papers.flatMap((p) =>
          p.questions.map((q) => ({ ...q, subject: p.subject, level: p.level, year: p.year, paper: p.paper })),
        ).slice(0, limit);

        return Response.json({ count: questions.length, questions });
      },
    },
  },
});
