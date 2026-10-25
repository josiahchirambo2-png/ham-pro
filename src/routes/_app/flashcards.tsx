import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  fsrs, generatorParameters, createEmptyCard, Rating,
  type Card as FsrsCard, type RecordLog,
} from "ts-fsrs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layers, Plus, Play, Trash2, ArrowLeft, Brain, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — KIT AI" },
      { name: "description", content: "Offline flashcards with spaced repetition — study any subject on KIT AI." },
    ],
  }),
  component: Flashcards,
});

// ============ Storage (offline-first, lives in this browser) ============
const STORE_KEY = "kitai_flashcards_v1";
type Stored = { due: string; stability: number; difficulty: number; elapsed_days: number; scheduled_days: number; reps: number; lapses: number; state: number; last_review: string | null; learning_steps: number };
type CardRow = { id: string; front: string; back: string; card: Stored };
type Deck = { id: string; name: string; created: string; cards: CardRow[] };
type Store = { decks: Deck[] };

function load(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return { decks: Array.isArray(raw.decks) ? raw.decks : [] };
  } catch { return { decks: [] }; }
}
function save(s: Store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* storage full */ }
}
function uid() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

function isDue(c: Stored, now: Date): boolean {
  const state = c.state as unknown as number;
  if (state === 0) return true; // State.New
  return new Date(c.due).getTime() <= now.getTime();
}

function grade(stored: Stored, g: 1 | 2 | 3 | 4): Stored {
  const revived = {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : null,
  } as unknown as FsrsCard;
  const log: RecordLog = scheduler.repeat(revived, new Date());
  const next = log[g].card;
  return {
    ...next,
    due: (next.due as unknown as Date).toISOString(),
    last_review: next.last_review ? (next.last_review as unknown as Date).toISOString() : null,
  } as Stored;
}

// ============ Component ============
function Flashcards() {
  const [store, setStore] = useState<Store>(() => ({ decks: [] }));
  const [me, setMe] = useState<string | null>(null);
  const [view, setView] = useState<{ deckId: string; studying: boolean } | null>(null);
  const [deckName, setDeckName] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [reveal, setReveal] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    setStore(load());
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  useEffect(() => { if (store.decks.length) save(store); }, [store]);

  const deck = useMemo(() => store.decks.find((d) => d.id === view?.deckId) ?? null, [store, view]);
  const now = useMemo(() => new Date(), [view?.studying]);
  const dueCards = useMemo(
    () => (deck ? deck.cards.filter((c) => isDue(c.card, now)) : []),
    [deck, now],
  );
  const current = dueCards[0] ?? null;

  function addDeck(e: React.FormEvent) {
    e.preventDefault();
    const name = deckName.trim();
    if (!name) return;
    const d: Deck = { id: uid(), name, created: new Date().toISOString(), cards: [] };
    setStore((s) => ({ decks: [...s.decks, d] }));
    setDeckName("");
    toast.success("Deck created");
  }

  function deleteDeck(id: string) {
    setStore((s) => ({ decks: s.decks.filter((d) => d.id !== id) }));
    if (view?.deckId === id) setView(null);
  }

  function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!deck || !front.trim() || !back.trim()) return;
    const row: CardRow = { id: uid(), front: front.trim(), back: back.trim(), card: createEmptyCard(new Date()) as unknown as Stored };
    setStore((s) => ({
      decks: s.decks.map((d) => d.id === deck.id ? { ...d, cards: [...d.cards, row] } : d),
    }));
    setFront(""); setBack("");
  }

  function deleteCard(cardId: string) {
    if (!deck) return;
    setStore((s) => ({ decks: s.decks.map((d) => d.id === deck.id ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d) }));
  }

  function rate(g: 1 | 2 | 3 | 4) {
    if (!deck || !current) return;
    setStore((s) => ({
      decks: s.decks.map((d) => d.id === deck.id ? {
        ...d,
        cards: d.cards.map((c) => c.id === current.id ? { ...c, card: grade(c.card, g) } : c),
      } : d),
    }));
    setReveal(false);
    setReviewed((n) => n + 1);
  }

  const totalCards = store.decks.reduce((n, d) => n + d.cards.length, 0);
  const totalDue = store.decks.reduce((n, d) => n + d.cards.filter((c) => isDue(c.card, new Date())).length, 0);

  // ============ Study session ============
  if (view?.studying && deck) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => { setView(null); setReveal(false); }}>
            <ArrowLeft className="size-4" /> Exit session
          </Button>
          <span className="text-xs text-muted-foreground">{dueCards.length} left · {reviewed} reviewed</span>
        </div>
        {current ? (
          <div className="mt-6 rounded-3xl border bg-card p-8 min-h-72 flex flex-col">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Question</p>
            <p className="mt-2 text-lg font-medium whitespace-pre-wrap">{current.front}</p>
            {reveal ? (
              <>
                <hr className="my-4 border-border" />
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Answer</p>
                <p className="mt-2 text-lg whitespace-pre-wrap">{current.back}</p>
              </>
            ) : (
              <Button variant="outline" className="mt-auto self-start" onClick={() => setReveal(true)}>Show answer</Button>
            )}
            {reveal && (
              <div className="mt-6 grid grid-cols-4 gap-2">
                <Button variant="destructive" size="sm" onClick={() => rate(1)}>Again</Button>
                <Button variant="outline" size="sm" onClick={() => rate(2)}>Hard</Button>
                <Button variant="default" size="sm" onClick={() => rate(3)}>Good</Button>
                <Button variant="outline" size="sm" onClick={() => rate(4)}>Easy</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <p className="font-medium">All caught up in this deck</p>
            <p className="text-sm text-muted-foreground">Cards come back when the schedule says so — that is what makes them stick.</p>
            <Button variant="outline" onClick={() => { setView(null); setReveal(false); }}>Back to decks</Button>
          </div>
        )}
      </div>
    );
  }

  // ============ Deck detail ============
  if (view && deck) {
    const deckDue = deck.cards.filter((c) => isDue(c.card, new Date())).length;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Button size="sm" variant="ghost" onClick={() => setView(null)}><ArrowLeft className="size-4" /> All decks</Button>
        <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-primary" /> {deck.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{deck.cards.length} cards · {deckDue} due now</p>
          </div>
          <Button onClick={() => { setView({ deckId: deck.id, studying: true }); setReveal(false); setReviewed(0); }} disabled={deckDue === 0}>
            <Play className="size-4" /> Study {deckDue > 0 ? `(${deckDue})` : ""}
          </Button>
        </div>

        <form onSubmit={addCard} className="mt-6 rounded-2xl border bg-card p-4 space-y-3">
          <div className="space-y-1"><Label>Front (question or word)</Label><Textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} placeholder="What is photosynthesis?" maxLength={500} /></div>
          <div className="space-y-1"><Label>Back (answer)</Label><Textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} placeholder="The process plants use to turn light into food." maxLength={500} /></div>
          <Button type="submit" size="sm" disabled={!front.trim() || !back.trim()}><Plus className="size-4" /> Add card</Button>
        </form>

        <div className="mt-4 space-y-2">
          {deck.cards.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.front}</p>
                <p className="text-xs text-muted-foreground truncate">{c.back}</p>
              </div>
              <Button size="icon" variant="ghost" className="size-7" onClick={() => deleteCard(c.id)}><Trash2 className="size-3.5" /></Button>
            </div>
          ))}
          {deck.cards.length === 0 && <p className="text-sm text-muted-foreground">No cards yet — add your first one above.</p>}
        </div>
      </div>
    );
  }

  // ============ Decks list ============
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Brain className="text-primary" /> Flashcards</h1>
        <p className="text-muted-foreground mt-1">
          {me ? "Your decks live on this device and work offline. KIT schedules every card so you review it exactly when you are about to forget it." :
            "Your decks live on this device and work offline — no sign-in needed."}
        </p>
        {totalCards > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{totalCards} cards across {store.decks.length} decks · {totalDue} due now</p>
        )}
      </div>

      <form onSubmit={addDeck} className="mt-6 flex gap-2 max-w-md">
        <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="New deck name, e.g. Biology — Cells" maxLength={60} />
        <Button type="submit" disabled={!deckName.trim()}><Plus className="size-4" /> Add</Button>
      </form>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.decks.map((d) => {
          const dDue = d.cards.filter((c) => isDue(c.card, new Date())).length;
          return (
            <div key={d.id} className="rounded-2xl border bg-card p-5 hover:shadow-[var(--shadow-leaf)] transition">
              <button onClick={() => setView({ deckId: d.id, studying: false })} className="text-left w-full">
                <h2 className="font-semibold">{d.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{d.cards.length} cards · {dDue} due</p>
              </button>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setView({ deckId: d.id, studying: true })} disabled={dDue === 0}>
                  <Play className="size-3.5" /> Study
                </Button>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => deleteDeck(d.id)}><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          );
        })}
      </div>
      {store.decks.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
          No decks yet. Create one above, or make decks for each subject you are studying.
        </p>
      )}
    </div>
  );
}
