"use client";

import { useState, useEffect } from "react";
import { COMMUNITIES } from "@/lib/communities";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";

const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function AdminDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const { connected, publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsAdmin(false);
      return;
    }
    
    // Check admin status and fetch data
    fetch(`/api/admin/check?wallet=${publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => {
        setIsAdmin(data.isAdmin);
        if (data.isAdmin) {
          fetch(`/api/admin/collections?wallet=${publicKey.toBase58()}`)
            .then(res => res.json())
            .then(d => setGroups(d.collections || []))
            .catch(console.error);
        }
      })
      .catch(() => setIsAdmin(false));
  }, [connected, publicKey]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    // Return the exact same "Community Not Found" UI as the dynamic routes
    // This perfectly masks the /admin route as just another invalid community search.
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-5 text-stone-50">
        <section className="max-w-xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Community Not Found
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            This community hub does not exist yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center border border-emerald-300/50 bg-emerald-300 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-white"
          >
            Back to Platform
          </Link>
        </section>
      </main>
    );
  }

  const handleCreateNew = () => {
    setIsSlugEdited(false);
    setEditingGroup({
      id: Date.now(),
      name: "",
      slug: "",
      collectionAddress: "",
      vipThreshold: 1,
      preferredView: "timeline1",
      description: "",
      image: "/window.svg",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (group: any) => {
    setIsSlugEdited(true); // Treat existing groups as having edited slugs
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditingGroup((prev: any) => {
      const next = { ...prev, name: newName };
      if (!isSlugEdited) {
        next.slug = newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "");
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setEditingGroup((prev: any) => ({ ...prev, slug: e.target.value }));
  };

  const handleDelete = (id: number) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) return;

    try {
      const res = await fetch(`/api/community/${editingGroup.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerWallet: publicKey.toBase58(),
          name: editingGroup.name,
          description: editingGroup.description,
          vipThreshold: editingGroup.vipThreshold,
          preferredView: editingGroup.preferredView,
          image: editingGroup.image,
        }),
      });

      if (res.ok) {
        setGroups(
          groups.map((g) => (g.id === editingGroup.id ? editingGroup : g))
        );
        setIsModalOpen(false);
      } else {
        alert("Failed to save changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-neutral-950 text-stone-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-white/10 bg-[#101014] p-6 md:block">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Admin Panel
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          <button className="rounded-lg bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-300 transition-colors">
            Groups & Communities
          </button>
          <button className="rounded-lg px-4 py-3 text-left text-sm font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-white">
            Hero Banners & Ads
          </button>
          <button className="rounded-lg px-4 py-3 text-left text-sm font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-white">
            User Roles & Access
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Groups</h1>
            <p className="mt-2 text-sm text-stone-400">
              Create and configure NFT communities, set Magic Eden links, and
              define VIP thresholds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
            >
              <span>Sort: {sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
              {sortOrder === "asc" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5 4v-12m0 0l-4 4m4-4l4 4" />
                </svg>
              )}
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Group
            </button>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {groups.filter(g => !g.parent_community_id).sort((a, b) => {
            if (sortOrder === "asc") return a.name.localeCompare(b.name);
            return b.name.localeCompare(a.name);
          }).map((group) => {
            const children = groups.filter(g => g.parent_community_id === group.id);
            const isExpanded = expandedIds[group.id];

            return (
              <div key={group.id} className="flex flex-col gap-3">
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-900/20">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-stone-300 ring-1 ring-white/10">
                        /{group.slug}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Collection
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-400">
                      {group.description}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">Collection:</span>
                        <span className="max-w-[120px] truncate font-mono text-stone-300">
                          {group.collection_address}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">Stories:</span>
                        <span className="font-bold text-emerald-400">
                          {children.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(group)}
                        className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                    {children.length > 0 && (
                      <button
                        onClick={() => toggleExpand(group.id)}
                        className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-stone-400 transition hover:bg-white/5 hover:text-white"
                      >
                        {isExpanded ? "Hide Stories ▲" : "View Stories ▼"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Render Child Stories if expanded */}
                {isExpanded && children.length > 0 && (
                  <div className="ml-6 space-y-3 border-l-2 border-emerald-500/20 pl-4">
                    {children.map(story => (
                      <div key={story.id} className="relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1f] p-4 transition hover:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-stone-300 ring-1 ring-white/10 mb-2">
                              /{story.slug}
                            </span>
                            <h4 className="text-base font-bold text-white">{story.name}</h4>
                          </div>
                          <span className="text-xl">📖</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(story)}
                            className="flex-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(story.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {groups.filter(g => !g.parent_community_id).length === 0 && (
            <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-2xl">
              <p className="text-stone-400">No collections found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit/Create Modal */}
      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl md:p-8">
            <h2 className="text-2xl font-bold text-white">
              {groups.find((g) => g.id === editingGroup.id)
                ? "Edit Group Settings"
                : "Create New Group"}
            </h2>
            <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">
                    Group Name
                  </label>
                  <input
                    required
                    value={editingGroup.name}
                    onChange={handleNameChange}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. Solana Guild"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">
                    URL Slug
                  </label>
                  <input
                    required
                    value={editingGroup.slug}
                    onChange={handleSlugChange}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. solana_guild"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Magic Eden Collection Address (Symbol)
                </label>
                <input
                  required
                  value={editingGroup.collectionAddress}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      collectionAddress: e.target.value,
                    })
                  }
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="e.g. famous_fox_federation"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Only show Preferred View for Stories (which have a parent_community_id) */}
                {editingGroup.parent_community_id && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-stone-400">
                      Preferred View
                    </label>
                    <select
                      value={editingGroup.preferredView}
                      onChange={(e) =>
                        setEditingGroup({
                          ...editingGroup,
                          preferredView: e.target.value as any,
                        })
                      }
                      className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    >
                      <option value="timeline1">Timeline 1 (Standard)</option>
                      <option value="timeline2">Timeline 2 (Story Article)</option>
                      <option value="timeline3">Timeline 3 (Cyberpunk HUD)</option>
                      <option value="gallery">Gallery (Grid)</option>
                    </select>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 ${!editingGroup.parent_community_id ? 'col-span-2' : ''}`}>
                  <label className="text-sm font-semibold text-stone-400">
                    NFTs Required for VIP
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingGroup.vipThreshold}
                    onChange={(e) =>
                      setEditingGroup({
                        ...editingGroup,
                        vipThreshold: parseInt(e.target.value) || 1,
                      })
                    }
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Cover Image URL
                </label>
                <input
                  value={editingGroup.image || ""}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      image: e.target.value,
                    })
                  }
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="e.g. https://.../image.png"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingGroup.description}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      description: e.target.value,
                    })
                  }
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="Describe your community..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-stone-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-400 px-6 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
