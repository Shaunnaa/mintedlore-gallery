"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

type SceneType = "space" | "village" | "launch" | "travel" | "arrival";

type StoryScene = {
  id: number;
  name: string;
  text: string;
  color: string;
  type: SceneType;
};

type ThemeSettings = {
  primaryColor: string;
  backgroundColor: string;
  story?: { title: string; scenes: StoryScene[] };
};

type Community = {
  id: number;
  name: string;
  slug: string;
  preferred_view: string;
  description: string;
  theme_settings: ThemeSettings | null;
  owner_wallet: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SCENE_TYPES: { value: SceneType; label: string; icon: string; description: string }[] = [
  { value: "space",   label: "Deep Space",    icon: "🌌", description: "Stars, nebula, darkness" },
  { value: "village", label: "Planet Village",icon: "🏘️", description: "Dome houses with NFT faces" },
  { value: "launch",  label: "Rocket Launch", icon: "🚀", description: "Launchpad + rocket on pad" },
  { value: "travel",  label: "Space Travel",  icon: "☄️", description: "Flying rocket + asteroids" },
  { value: "arrival", label: "New World",     icon: "🌿", description: "Green planet arrival screen" },
];

const PRESET_COLORS = [
  "#7c3aed","#6d28d9","#4f46e5","#0ea5e9","#06b6d4",
  "#10b981","#34d399","#f59e0b","#f97316","#ef4444",
  "#ec4899","#a78bfa","#60a5fa","#818cf8","#2dd4bf",
];

const DEFAULT_SCENES: StoryScene[] = [
  { id: 0, name: "The Void",    text: "Before time itself was recorded on-chain…",               color: "#3b0764", type: "space"   },
  { id: 1, name: "The Signal",  text: "A mysterious transmission emerged from the coordinates.",  color: "#1e1b4b", type: "space"   },
  { id: 2, name: "The Village", text: "A civilization of NFT holders thrived on the surface.",   color: "#6d28d9", type: "village" },
  { id: 3, name: "Ignition",    text: "Countdown began. One brave holder would carry the mission.", color: "#0c1a2e", type: "launch"  },
  { id: 4, name: "New World",   text: "A new planet. A new chapter. The collection had arrived.", color: "#052e16", type: "arrival" },
];

// ── Scene row component ───────────────────────────────────────────────────────

function SceneRow({ scene, index, onChange, onRemove, canRemove }: {
  scene: StoryScene; index: number;
  onChange: (u: StoryScene) => void;
  onRemove: () => void; canRemove: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition">
        <span className="text-lg">{SCENE_TYPES.find(t => t.value === scene.type)?.icon ?? "🌌"}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{scene.name || `Scene ${index + 1}`}</p>
          <p className="text-xs text-stone-600 truncate">{scene.text}</p>
        </div>
        <div className="h-3 w-3 rounded-full" style={{ background: scene.color }} />
        <span className="text-stone-600 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 py-4 space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Scene Name</label>
            <input className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50"
              value={scene.name} onChange={e => onChange({ ...scene, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Narration Text</label>
            <textarea rows={2} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 resize-none"
              value={scene.text} onChange={e => onChange({ ...scene, text: e.target.value })} />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Scene Visual</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SCENE_TYPES.map(t => (
                <button key={t.value} onClick={() => onChange({ ...scene, type: t.value })}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition ${scene.type === t.value ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"}`}>
                  <span className="text-base">{t.icon}</span>
                  <span className="text-[11px] font-bold text-white">{t.label}</span>
                  <span className="text-[9px] text-stone-500">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => onChange({ ...scene, color: c })}
                  className={`h-7 w-7 rounded-full border-2 transition ${scene.color === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
              <input type="color" value={scene.color} onChange={e => onChange({ ...scene, color: e.target.value })}
                className="h-7 w-7 rounded-full cursor-pointer border-2 border-white/10" />
            </div>
          </div>
          {canRemove && (
            <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300 transition">
              Remove this scene
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EditCommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const { connected, publicKey } = useWallet();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Edit mode tab
  const [editMode, setEditMode]   = useState<"visual" | "code">("visual");

  // Visual editor state
  const [preferredView, setPreferredView] = useState("timeline5");
  const [primaryColor,  setPrimaryColor]  = useState("#34d399");
  const [storyTitle,    setStoryTitle]    = useState("");
  const [scenes, setScenes]               = useState<StoryScene[]>(DEFAULT_SCENES);

  // Code editor state
  const [rawJson,   setRawJson]   = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Load community from API
  useEffect(() => {
    fetch(`/api/community/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (!data.community) { setLoading(false); return; }
        const c: Community = data.community;
        setCommunity(c);
        setPreferredView(c.preferred_view ?? "timeline5");
        const ts = c.theme_settings;
        if (ts) {
          setPrimaryColor(ts.primaryColor ?? "#34d399");
          setStoryTitle(ts.story?.title ?? c.name);
          setScenes(ts.story?.scenes ?? DEFAULT_SCENES);
          setRawJson(JSON.stringify(ts, null, 2));
        } else {
          setStoryTitle(c.name);
          setRawJson(JSON.stringify({ primaryColor: "#34d399", backgroundColor: "#050505", story: { title: c.name, scenes: DEFAULT_SCENES } }, null, 2));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const updateScene = (i: number, updated: StoryScene) =>
    setScenes(prev => prev.map((s, idx) => idx === i ? updated : s));

  const addScene = () => setScenes(prev => [
    ...prev,
    { id: prev.length, name: `Scene ${prev.length + 1}`, text: "A new chapter begins…", color: PRESET_COLORS[prev.length % PRESET_COLORS.length], type: "space" as SceneType },
  ]);

  const removeScene = (i: number) =>
    setScenes(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, id: idx })));

  const handleSave = async () => {
    if (!publicKey || !community) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    setJsonError(null);

    let themeSettings: ThemeSettings;

    if (editMode === "code") {
      // Validate JSON
      try {
        themeSettings = JSON.parse(rawJson);
      } catch (e) {
        setJsonError("Invalid JSON — please fix the syntax before saving.");
        setSaving(false);
        return;
      }
    } else {
      themeSettings = { primaryColor, backgroundColor: "#050505", story: { title: storyTitle, scenes } };
    }

    try {
      const res = await fetch(`/api/community/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerWallet: publicKey.toBase58(),
          preferredView,
          description: community.description,
          themeSettings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / not found ───────────────────────────────────────────────────

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070e]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );

  if (!community) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07070e] text-white">
      <p className="text-stone-400">Community not found.</p>
      <Link href="/dashboard" className="text-sm text-violet-400 underline">← Dashboard</Link>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#07070e] text-stone-50">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-xs text-stone-600 hover:text-stone-400">← My Communities</Link>
            <h1 className="mt-2 text-2xl font-black text-white">{community.name}</h1>
            <p className="text-xs text-stone-500">/{community.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${community.slug}`} target="_blank"
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-stone-400 transition hover:text-white">
              Preview ↗
            </Link>
            <button onClick={handleSave} disabled={saving || !connected}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${saved ? "border border-emerald-500 text-emerald-400" : "bg-violet-600 text-white hover:bg-violet-500"} disabled:opacity-40`}>
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">{error}</div>}

        {/* Mode tabs — No Code / Code Editor */}
        <div className="mb-8 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {([
            { id: "visual", icon: "✨", label: "No Code Editor" },
            { id: "code",   icon: "💻", label: "Code Editor" },
          ] as { id: "visual" | "code"; icon: string; label: string }[]).map(tab => (
            <button key={tab.id} onClick={() => setEditMode(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${editMode === tab.id ? "bg-violet-600 text-white" : "text-stone-500 hover:text-stone-300"}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ══ NO CODE EDITOR ══ */}
        {editMode === "visual" && (
          <div className="space-y-8">

            {/* Page Content — name (read-only) + description (editable) */}
            <section>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-500">Page Content</h2>
              <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Community Name</label>
                  <input readOnly value={community.name}
                    className="w-full rounded-lg border border-white/5 bg-black/30 px-4 py-2.5 text-sm text-stone-500 outline-none cursor-not-allowed" />
                  <p className="mt-1 text-[10px] text-stone-700">Name is fixed at creation.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Description</label>
                  <textarea rows={3} value={community.description ?? ""}
                    onChange={e => setCommunity(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                    placeholder="Tell visitors what this community is about…" />
                </div>
              </div>
            </section>

            {/* Page Style */}
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-500">Page Style</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { value: "timeline5", icon: "🚀", label: "Scroll Story",  desc: "Cinematic journey" },
                  { value: "timeline4", icon: "📖", label: "Story Mode",    desc: "Chapter cards" },
                  { value: "timeline1", icon: "📜", label: "Timeline 1",    desc: "Alternating layout" },
                  { value: "timeline2", icon: "🎨", label: "Timeline 2",    desc: "Visual timeline" },
                  { value: "timeline3", icon: "⚡", label: "Timeline 3",    desc: "Progress style" },
                ].map(v => (
                  <button key={v.value} onClick={() => setPreferredView(v.value)}
                    className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${preferredView === v.value ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"}`}>
                    <span className="text-xl">{v.icon}</span>
                    <span className={`text-xs font-bold ${preferredView === v.value ? "text-violet-300" : "text-white"}`}>{v.label}</span>
                    <span className="text-[10px] text-stone-500">{v.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Accent Color */}
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-500">Accent Color</h2>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${primaryColor === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  className="h-8 w-8 rounded-full cursor-pointer border-2 border-white/10" />
              </div>
            </section>

            {/* Story Scenes — only for Scroll Story */}
            {preferredView === "timeline5" && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Story Scenes <span className="text-violet-400">({scenes.length})</span>
                  </h2>
                  {scenes.length < 10 && (
                    <button onClick={addScene}
                      className="rounded-lg border border-violet-500/40 px-3 py-1.5 text-xs font-semibold text-violet-400 transition hover:border-violet-400 hover:text-violet-300">
                      + Add Scene
                    </button>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Story Title</label>
                  <input className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                    value={storyTitle} onChange={e => setStoryTitle(e.target.value)} placeholder="e.g. The Mad Lads Saga" />
                </div>
                <div className="space-y-2">
                  {scenes.map((scene, i) => (
                    <SceneRow key={i} scene={scene} index={i}
                      onChange={updated => updateScene(i, updated)}
                      onRemove={() => removeScene(i)}
                      canRemove={scenes.length > 2} />
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-stone-600">Each scene maps to a scroll section. Users scroll through them in order.</p>
              </section>
            )}
          </div>
        )}

        {/* ══ CODE EDITOR ══ */}
        {editMode === "code" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
              💻 Edit raw <code className="rounded bg-amber-900/30 px-1">theme_settings</code> JSON for full control. Invalid JSON will not save.
            </div>
            <textarea rows={22} spellCheck={false} value={rawJson} onChange={e => setRawJson(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs text-emerald-300 outline-none focus:border-amber-500/50" />
            {jsonError && <p className="text-xs text-red-400">⚠ {jsonError}</p>}
            <p className="text-[10px] text-stone-600">
              Valid scene types: <code>space</code> · <code>village</code> · <code>launch</code> · <code>travel</code> · <code>arrival</code>
            </p>
          </div>
        )}

        {/* Save footer */}
        <div className="sticky bottom-4 mt-10 flex justify-end">
          <button onClick={handleSave} disabled={saving || !connected}
            className={`rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest shadow-2xl transition ${saved ? "border border-emerald-500 text-emerald-400" : "bg-violet-600 text-white hover:bg-violet-500"} disabled:opacity-40`}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
