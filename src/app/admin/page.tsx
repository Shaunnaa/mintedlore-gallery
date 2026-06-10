"use client";

import { useState } from "react";
import { COMMUNITIES } from "@/lib/communities";

export default function AdminDashboard() {
  const [groups, setGroups] = useState(
    COMMUNITIES.map((c) => ({ ...c, vipThreshold: 1 }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isSlugEdited, setIsSlugEdited] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (groups.find((g) => g.id === editingGroup.id)) {
      setGroups(
        groups.map((g) => (g.id === editingGroup.id ? editingGroup : g))
      );
    } else {
      setGroups([...groups, editingGroup]);
    }
    setIsModalOpen(false);
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
            VIP Settings (Soon)
          </button>
          <button className="rounded-lg px-4 py-3 text-left text-sm font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-white">
            Superbase Sync (Soon)
          </button>
        </nav>

        <div className="mt-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-emerald-200">
            <strong>Demo Mode:</strong> Supabase auth is bypassed. Data is saved
            in local browser state.
          </p>
        </div>
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
        </header>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-emerald-900/20"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-stone-300 ring-1 ring-white/10">
                    /{group.slug}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    {group.preferredView}
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
                      {group.collectionAddress}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">VIP Threshold:</span>
                    <span className="font-bold text-emerald-400">
                      {group.vipThreshold} NFT(s)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleEdit(group)}
                  className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Edit Settings
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-2xl">
              <p className="text-stone-400">No groups found. Create one to get started.</p>
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
                <div className="flex flex-col gap-2">
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
