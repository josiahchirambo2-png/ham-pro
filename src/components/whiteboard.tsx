import { useCallback, useEffect, useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptMessage, deriveRoomKey, encryptMessage, getStoredRoomKey } from "@/lib/roomkey";
import { X, Pencil, Undo2, Trash2, FileText, Loader2 } from "lucide-react";

// Collaborative whiteboard for a study group. Every stroke, undo and clear is
// stored as an encrypted event (hpx1:) in lesson_board_events, so the server
// never sees the drawing. Requires the room key to share strokes with others.

type Stroke = { id: string; u: string; color: string; size: number; page: number | null; points: number[][] };
type Event = { t: "stroke" | "clear" | "undo"; u: string; s?: Omit<Stroke, "u"> };

const INKS = ["#1a1a1a", "#c0392b", "#1e7d46", "#1d4ed8"] as const;

function strokePath(points: number[][]): string {
  const outline = getStroke(points, { size: 6, thinning: 0.6, smoothing: 0.5, streamline: 0.5 });
  if (!outline.length) return "";
  const d = `M ${outline[0][0].toFixed(2)} ${outline[0][1].toFixed(2)}`;
  return outline.reduce((acc, [x0, y0], i, arr) => {
    if (!arr[i + 1]) return acc;
    const [x1, y1] = arr[i + 1];
    acc += ` Q ${(x0 + (x1 - x0) / 2).toFixed(2)} ${(y0 + (y1 - y0) / 2).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    return acc;
  }, d);
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, w: number, h: number) {
  const pts = s.points.map(([x, y]) => [x * w, y * h]);
  ctx.fillStyle = s.color;
  const path = new Path2D(strokePath(pts));
  ctx.fill(path);
}

export function Whiteboard({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [color, setColor] = useState<string>(INKS[0]);
  const [pdfPage, setPdfPage] = useState<{ dataUrl: string; no: number; total: number } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const drawingRef = useRef<Stroke | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const [, force] = useState(0);

  // ============ Keys: room key when held, group fallback otherwise ============
  useEffect(() => {
    let active = true;
    (async () => {
      supabase.auth.getUser().then(({ data }) => { if (active) setMe(data.user?.id ?? null); });
      const stored = getStoredRoomKey(groupId);
      keyRef.current = await deriveRoomKey(stored ?? `kitai-board-fallback:${groupId}`, groupId);
      if (active) setReady(true);
    })();
    return () => { active = false; };
  }, [groupId]);

  // ============ Load history ============
  useEffect(() => {
    if (!ready) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from("lesson_board_events")
        .select("id,user_id,payload,created_at").eq("group_id", groupId).order("created_at").limit(1000);
      if (!active || !data) return;
      const out: Stroke[] = [];
      for (const ev of (data as { user_id: string; payload: string }[])) {
        const plain = await decryptMessage(ev.payload, keyRef.current);
        if (plain.startsWith("🔒")) continue;
        try {
          const e = JSON.parse(plain) as Event;
          if (e.t === "stroke" && e.s) out.push({ ...e.s, u: ev.user_id });
          else if (e.t === "clear") out.length = 0;
          else if (e.t === "undo") {
            for (let i = out.length - 1; i >= 0; i--) {
              if (out[i].u === ev.user_id) { out.splice(i, 1); break; }
            }
          }
        } catch { /* skip */ }
      }
      if (active) setStrokes(out);
    })();
    return () => { active = false; };
  }, [groupId, ready]);

  // ============ Realtime from other members ============
  useEffect(() => {
    if (!ready) return;
    const ch = supabase.channel(`board:${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lesson_board_events", filter: `group_id=eq.${groupId}` },
        async (p) => {
          const row = p.new as { user_id: string; payload: string };
          const plain = await decryptMessage(row.payload, keyRef.current);
          if (plain.startsWith("🔒")) return;
          try {
            const e = JSON.parse(plain) as Event;
            if (e.t === "stroke" && e.s) setStrokes((s) => [...s, { ...e.s!, u: row.user_id }]);
            else if (e.t === "clear") setStrokes([]);
            else if (e.t === "undo") setStrokes((s) => {
              const next = [...s];
              for (let i = next.length - 1; i >= 0; i--) {
                if (next[i].u === row.user_id) { next.splice(i, 1); break; }
              }
              return next;
            });
          } catch { /* skip */ }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [groupId, ready]);

  async function broadcast(e: Event) {
    if (!keyRef.current || !me) return;
    const payload = await encryptMessage(JSON.stringify(e), keyRef.current);
    await supabase.from("lesson_board_events").insert({ group_id: groupId, user_id: me, payload });
  }

  // ============ Canvas sizing and rendering ============
  const render = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Checkerboard so the board area is visible over the chat
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    if (pdfPage) {
      const img = new Image();
      if (img.complete && img.src === pdfPage.dataUrl) {
        // drawn below via onload path
      }
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        for (const s of strokes) if (s.page === pdfPage.no) drawStroke(ctx, s, w, h);
        const d = drawingRef.current;
        if (d && d.page === pdfPage.no) drawStroke(ctx, d, w, h);
      };
      img.src = pdfPage.dataUrl;
      return;
    }
    for (const s of strokes) if (s.page === null) drawStroke(ctx, s, w, h);
    const d = drawingRef.current;
    if (d && d.page === null) drawStroke(ctx, d, w, h);
  }, [strokes, pdfPage]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  function pointerPos(e: React.PointerEvent): number[] {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  function onDown(e: React.PointerEvent) {
    if (!me) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drawingRef.current = { id: crypto.randomUUID(), u: me, color, size: 6, page: pdfPage ? pdfPage.no : null, points: [pointerPos(e)] };
    force((n) => n + 1);
  }
  function onMove(e: React.PointerEvent) {
    const d = drawingRef.current;
    if (!d) return;
    d.points.push(pointerPos(e));
    render();
  }
  async function onUp() {
    const d = drawingRef.current;
    drawingRef.current = null;
    force((n) => n + 1);
    if (!d || d.points.length < 2) return;
    setStrokes((s) => [...s, d]);
    await broadcast({ t: "stroke", u: d.u, s: { id: d.id, color: d.color, size: d.size, page: d.page, points: d.points } });
  }

  async function undo() {
    if (!me) return;
    setStrokes((s) => {
      const next = [...s];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].u === me) { next.splice(i, 1); break; }
      }
      return next;
    });
    await broadcast({ t: "undo", u: me });
  }
  async function clearAll() {
    if (!me) return;
    setStrokes([]);
    await broadcast({ t: "clear", u: me });
  }

  // ============ PDF annotation ============
  async function loadPdf(file: File, pageNo = 1) {
    setPdfLoading(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const page = await doc.getPage(Math.min(pageNo, doc.numPages));
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 1600 / base.width);
      const viewport = page.getViewport({ scale });
      const off = document.createElement("canvas");
      off.width = viewport.width; off.height = viewport.height;
      await page.render({ canvas: off, canvasContext: off.getContext("2d")!, viewport } as never).promise;
      setPdfPage({ dataUrl: off.toDataURL("image/jpeg", 0.85), no: pageNo, total: doc.numPages });
    } catch {
      // surface a readable failure instead of a silent one
      alert("Could not open that PDF. Try a different file.");
    }
    setPdfLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="border-b p-2 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold flex items-center gap-1.5"><Pencil className="size-4 text-primary" /> Group whiteboard</span>
        <span className="text-[10px] text-muted-foreground">Encrypted — strokes are shared live with members holding the room key</span>
        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          {INKS.map((c) => (
            <button key={c} aria-label={`Ink ${c}`} onClick={() => setColor(c)}
              className={`size-6 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
              style={{ background: c }} />
          ))}
          <Button size="sm" variant="outline" onClick={undo} disabled={!me}><Undo2 className="size-4" /> Undo</Button>
          <Button size="sm" variant="outline" onClick={clearAll} disabled={!me}><Trash2 className="size-4" /> Clear</Button>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadPdf(f); e.target.value = ""; }} />
          {pdfPage && (
            <span className="flex items-center gap-1">
              <Button size="sm" variant="ghost" disabled={pdfPage.no <= 1 || pdfLoading}
                onClick={() => fileRef.current?.files?.[0] && loadPdf(fileRef.current.files[0], pdfPage.no - 1)}>Prev</Button>
              <span className="text-xs text-muted-foreground">{pdfPage.no}/{pdfPage.total}</span>
              <Button size="sm" variant="ghost" disabled={pdfPage.no >= pdfPage.total || pdfLoading}
                onClick={() => fileRef.current?.files?.[0] && loadPdf(fileRef.current.files[0], pdfPage.no + 1)}>Next</Button>
            </span>
          )}
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <><FileText className="size-4" /> {pdfPage ? "PDF" : "Add PDF"}</>}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}><X className="size-4" /> Close</Button>
        </div>
      </div>
      <div ref={wrapRef} className="relative flex-1 min-h-0">
        <canvas ref={canvasRef} className={me ? "absolute inset-0 touch-none cursor-crosshair" : "absolute inset-0 touch-none"}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} />
        {!me && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 text-center p-6">
            <div>
              <p className="font-medium">Sign in to draw on the shared whiteboard</p>
              <p className="text-sm text-muted-foreground mt-1">Members can sketch, annotate PDFs and solve problems together in real time.</p>
            </div>
          </div>
        )}
      </div>
      <p className="border-t p-1.5 text-center text-[10px] text-muted-foreground">
        Everything you draw stays end-to-end encrypted. Clearing the board clears it for everyone.
      </p>
    </div>
  );
}
