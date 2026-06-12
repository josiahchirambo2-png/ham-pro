import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — HAM PRO" }] }),
  component: Profile,
});

function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id); setEmail(user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (p) {
        setName(p.display_name ?? ""); setLevel(p.education_level ?? "");
        setSyllabus(p.syllabus ?? ""); setBio(p.bio ?? "");
        if (p.avatar_url) {
          setAvatarPath(p.avatar_url);
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(p.avatar_url, 3600);
          if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
        }
      }
    })();
  }, []);

  async function save() {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({ display_name: name, education_level: level, syllabus, bio, avatar_url: avatarPath, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || !userId) return;
    const path = `${userId}/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true });
    if (error) return toast.error(error.message);
    setAvatarPath(path);
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
    toast.success("Picture uploaded — click Save to keep it");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="text-xl">{(name || email || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Camera className="size-4" /> Change picture</Button>
            <p className="text-xs text-muted-foreground mt-1">{email}</p>
          </div>
        </div>
        <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Education level</Label><Input placeholder="e.g. Grade 10, Year 2 University" value={level} onChange={(e) => setLevel(e.target.value)} /></div>
          <div><Label>Preferred syllabus</Label><Input placeholder="e.g. Zambian (ECZ)" value={syllabus} onChange={(e) => setSyllabus(e.target.value)} /></div>
        </div>
        <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
        <Button onClick={save} className="w-full">Save profile</Button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">HAM PRO — created by Josiah Brian Chirambo</p>
    </div>
  );
}