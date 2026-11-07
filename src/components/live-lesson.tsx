import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, X, Mic, MicOff, PhoneOff } from "lucide-react";

// Integrated live lesson rooms for a study group. The room runs on Jitsi's
// public meet service: HD video, screen sharing and breakout rooms work out of
// the box. Session recording needs a Jitsi/8x8 account — stated in the UI.

export function LiveLesson({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const [joined, setJoined] = useState(false);
  const [mutedHint, setMutedHint] = useState(false);
  const room = `kitai-${groupId.replace(/-/g, "").slice(0, 20)}`;
  const src = `https://meet.jit.si/${room}#config.prejoinPageEnabled=true&config.requireDisplayName=true&config.startWithVideoMuted=${mutedHint}`;

  useEffect(() => () => { setJoined(false); }, [groupId]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="border-b p-2 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold flex items-center gap-1.5"><Video className="size-4 text-primary" /> Live lesson</span>
        <span className="text-[10px] text-muted-foreground">Room: {room}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {joined && (
            <Button size="sm" variant="ghost" onClick={() => setMutedHint((v) => !v)} title="Reload with video on/off">
              {mutedHint ? <><MicOff className="size-4" /> Camera off</> : <><Mic className="size-4" /> Camera on</>}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}><X className="size-4" /> Close</Button>
        </div>
      </div>
      {!joined ? (
        <div className="flex-1 grid place-items-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto size-16 rounded-3xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <Video className="size-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">Start a live lesson for this group</p>
              <p className="text-sm text-muted-foreground mt-1">
                HD video and audio calling, screen sharing and breakout rooms — everyone in the group can open the same room.
              </p>
            </div>
            <Button size="lg" onClick={() => setJoined(true)}><Video className="size-4" /> Enter the room</Button>
            <p className="text-[11px] text-muted-foreground">
              Session recording is not enabled yet — it needs a Jitsi or 8x8 account. Ask the developer to connect one.
            </p>
          </div>
        </div>
      ) : (
        <>
          <iframe
            title="Live lesson room"
            src={src}
            className="flex-1 w-full min-h-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
          />
          <p className="border-t p-1.5 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <PhoneOff className="size-3" /> Use the red button inside the room to leave — Close returns you to the chat.
          </p>
        </>
      )}
    </div>
  );
}
