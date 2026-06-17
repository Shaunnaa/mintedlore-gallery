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
  customHtml?: string;
  customCss?: string;
  customCode?: string;
  assetIds?: string[];
  selectedAssetIds?: string[];
};

type Community = {
  id: number;
  name: string;
  slug: string;
  collection_address: string;
  collection_type: "type_a" | "type_b";
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
  const [deleting, setDeleting]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Edit mode tab
  const [editMode, setEditMode]   = useState<"visual" | "html" | "code">("visual");

  // Visual editor state
  const [preferredView, setPreferredView] = useState("timeline5");
  const [primaryColor,  setPrimaryColor]  = useState("#34d399");
  const [storyTitle,    setStoryTitle]    = useState("");
  const [scenes, setScenes]               = useState<StoryScene[]>(DEFAULT_SCENES);

  // HTML editor state
  const [customHtml, setCustomHtml] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [gameAssets, setGameAssets] = useState<{ _id: string; name: string; image: string }[]>([]);

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
          setCustomHtml(ts.customHtml ?? "");
          setCustomCode(ts.customCode ?? "");
          setAssetIds(ts.assetIds ?? []);
          setSelectedAssetIds(ts.selectedAssetIds ?? []);
          setRawJson(JSON.stringify(ts, null, 2));
        } else {
          setStoryTitle(c.name);
          setRawJson(JSON.stringify({ primaryColor: "#34d399", backgroundColor: "#050505", story: { title: c.name, scenes: DEFAULT_SCENES } }, null, 2));
        }
        if (c.collection_address === "star_atlas") {
          fetch("https://galaxy.staratlas.com/nfts")
            .then(res => res.json())
            .then((items: any[]) => {
              const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
              setGameAssets(sorted);
            })
            .catch(console.error);
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
    } else if (editMode === "html" || (community.collection_address === "star_atlas" && community.collection_type !== "type_b")) {
      themeSettings = {
        primaryColor,
        backgroundColor: "#050505",
        ...(community.theme_settings as object || {}),
        customHtml,
        customCode,
        assetIds,
        selectedAssetIds,
      };
    } else if (community.collection_type === "type_b") {
       themeSettings = {
        primaryColor,
        backgroundColor: "#050505",
        ...(community.theme_settings as object || {}),
        customHtml,
        customCode,
        assetIds,
        selectedAssetIds,
      };
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

  const handleDelete = async () => {
    if (!publicKey || !community) return;
    if (!confirm("Are you absolutely sure you want to delete this community? This action cannot be undone.")) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/community/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerWallet: publicKey.toBase58(),
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete community");
      }
      
      window.location.href = "/dashboard";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
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
  const isTypeB = community.collection_type === "type_b";
  const isGameStory = isTypeB && community.collection_address === "star_atlas";
  const isGame = community.collection_address === "star_atlas" && !isTypeB;

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
        {!isGame && !isGameStory && (
          <div className="mb-8 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {([
              { id: "visual", icon: "✨", label: "No Code Editor" },
              { id: "html",   icon: "🌐", label: "HTML Editor" },
              { id: "code",   icon: "💻", label: "Code Editor" },
            ] as { id: "visual" | "html" | "code"; icon: string; label: string }[]).map(tab => (
              <button key={tab.id} onClick={() => setEditMode(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${editMode === tab.id ? "bg-violet-600 text-white" : "text-stone-500 hover:text-stone-300"}`}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ══ NO CODE EDITOR ══ */}
        {!isGame && !isGameStory && editMode === "visual" && (
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

        {/* ══ HTML EDITOR ══ */}
        {!isGameStory && (editMode === "html" || isGame) && (
          <div className="space-y-4">
            {isGame && (
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-500">Game Hub Editor</h2>
                </div>
                <div className="text-sm text-stone-400">
                  Game Integrations use dynamic layouts.
                </div>
              </div>
            )}

            {/* Asset Selection */}
                <div className="mt-10 border-t border-white/10 pt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">Display Assets</h2>
                      <p className="mt-1 text-[10px] text-stone-500">Select specific game assets to display. If none are selected, all assets will be shown.</p>
                    </div>
                    {selectedAssetIds.length > 0 && (
                      <button 
                        onClick={() => setSelectedAssetIds([])}
                        className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-white"
                      >
                        Clear Selection ({selectedAssetIds.length})
                      </button>
                    )}
                  </div>
                  
                  {gameAssets.length > 0 ? (
                    <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 sm:grid-cols-3 md:grid-cols-4">
                      {gameAssets.map(asset => {
                        const isSelected = selectedAssetIds.includes(asset._id);
                        return (
                          <button
                            key={asset._id}
                            onClick={() => {
                              setSelectedAssetIds(prev => 
                                isSelected ? prev.filter(id => id !== asset._id) : [...prev, asset._id]
                              );
                            }}
                            className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${isSelected ? "border-cyan-500 bg-cyan-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                          >
                            <div className="aspect-square w-full bg-black/50">
                              <img src={asset.image} alt={asset.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="p-2">
                              <p className="truncate text-[10px] font-bold text-white">{asset.name}</p>
                            </div>
                            {isSelected && (
                              <div className="absolute right-1 top-1 rounded-full bg-cyan-500 p-0.5 text-neutral-950">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-white/5 bg-black/20">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    </div>
                  )}
                </div>

            {!isGame && !isGameStory && (
              <>
                <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                  <p className="text-xs text-cyan-300">🌐 Write custom HTML. Make sure your Preferred View is set to "Custom (With Code)" to see this.</p>
                  <button
                    onClick={() => setCustomHtml(prev => prev + `\n<!-- Magic Eden Marketplace Embed -->\n<div style="width: 100%; height: 800px; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); margin-top: 40px;">\n  <iframe \n    src="https://play.staratlas.com/market" \n    width="100%" \n    height="100%" \n    frameborder="0"\n    allow="fullscreen"\n  ></iframe>\n</div>\n`)}
                    className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/40"
                  >
                    + Insert Marketplace NFT Demo
                  </button>
                </div>
                <textarea rows={22} spellCheck={false} value={customHtml} onChange={e => setCustomHtml(e.target.value)}
                  placeholder="<div class='text-white'>Hello Web3!</div>"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-4 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-cyan-500/50" />
              </>
            )}
          </div>
        )}

        {/* ══ TYPE B EDITOR ══ */}
        {isGameStory && (
          <div className="space-y-4">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-500">Story Editor</h2>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500">Target Game Assets (Select Multiple)</label>
              {gameAssets.length > 0 ? (
                <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 sm:grid-cols-3 md:grid-cols-4">
                  {gameAssets.map(asset => {
                    const idx = assetIds.indexOf(asset._id);
                    const isSelected = idx !== -1;
                    return (
                      <button
                        key={asset._id}
                        onClick={() => {
                          setAssetIds(prev => 
                            isSelected ? prev.filter(id => id !== asset._id) : [...prev, asset._id]
                          );
                        }}
                        className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                      >
                        <div className="aspect-square w-full bg-black/50">
                          <img src={asset.image} alt={asset.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[10px] font-bold text-white">{asset.name}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-neutral-950">
                            {idx + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-white/5 p-4 text-center text-xs text-stone-500">
                  Loading game assets...
                </div>
              )}
              
              {/* Selected Assets Rearrangement */}
              {assetIds.length > 0 && (
                <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Selected Assets Order
                    </label>
                    <span className="text-xs font-bold text-emerald-500">{assetIds.length} Selected</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {assetIds.map((id, index) => {
                      const asset = gameAssets.find(a => a._id === id);
                      if (!asset) return null;
                      return (
                        <div key={id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2">
                          <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                              {index + 1}
                            </span>
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-black/50">
                              <img src={asset.image} alt={asset.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="truncate text-xs font-bold text-white">{asset.name}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => {
                                if (index === 0) return;
                                setAssetIds(prev => {
                                  const next = [...prev];
                                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                  return next;
                                });
                              }}
                              disabled={index === 0}
                              className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-stone-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => {
                                if (index === assetIds.length - 1) return;
                                setAssetIds(prev => {
                                  const next = [...prev];
                                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                  return next;
                                });
                              }}
                              disabled={index === assetIds.length - 1}
                              className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-stone-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => {
                                setAssetIds(prev => prev.filter(a => a !== id));
                              }}
                              className="ml-2 flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <label className="mt-6 block text-[10px] font-bold uppercase tracking-widest text-stone-500">Story HTML Code</label>
              <textarea 
                rows={12} 
                spellCheck={false} 
                value={customCode} 
                onChange={e => setCustomCode(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-4 font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500/50"
              />
              <p className="text-[10px] text-stone-500">Use {'{{NFT_IMAGE_1}}'} and {'{{NFT_NAME_1}}'} to inject the assets selected above based on their numbered order.</p>
            </div>
          </div>
        )}

        {/* ══ JSON EDITOR ══ */}
        {!isGame && !isGameStory && editMode === "code" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
              💻 Edit raw <code className="rounded bg-amber-900/30 px-1">theme_settings</code> JSON for full control. Invalid JSON will not save.
            </div>
            <textarea rows={22} spellCheck={false} value={rawJson} onChange={e => setRawJson(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-4 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-amber-500/50" />
            {jsonError && <p className="text-xs text-red-400">⚠ {jsonError}</p>}
            <p className="text-[10px] text-stone-600">
              Valid scene types: <code>space</code> · <code>village</code> · <code>launch</code> · <code>travel</code> · <code>arrival</code>
            </p>
          </div>
        )}

        {/* Save footer */}
        <div className="sticky bottom-4 mt-10 flex justify-between rounded-2xl border border-white/10 bg-[#07070e]/80 p-4 backdrop-blur-xl">
          <button onClick={handleDelete} disabled={deleting || saving || !connected}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-bold uppercase tracking-widest text-red-400 shadow-xl transition hover:bg-red-500/20 disabled:opacity-40">
            {deleting ? "Deleting..." : "Delete Community"}
          </button>
          
          <button onClick={handleSave} disabled={saving || deleting || !connected}
            className={`rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest shadow-2xl transition ${saved ? "border border-emerald-500 text-emerald-400" : "bg-violet-600 text-white hover:bg-violet-500"} disabled:opacity-40`}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
