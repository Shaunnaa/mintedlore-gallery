"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [filterPlacement, setFilterPlacement] = useState<"all" | "hero" | "sidebar">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const { publicKey } = useWallet();

  const fetchAds = (wallet: string) => {
    fetch(`/api/admin/promotions?wallet=${wallet}`)
      .then(r => r.json())
      .then(d => setAds(d.promotions || []))
      .catch(console.error);
  };

  useEffect(() => {
    if (publicKey) fetchAds(publicKey.toBase58());
  }, [publicKey]);

  const handleCreateAd = () => {
    setEditingAd({ placement: "hero", badge_text: "", title: "", description: "", image_url: "", button_text: "Learn More", button_url: "", button_2_text: "", button_2_url: "", is_active: false, display_order: 0, start_date: "", end_date: "" });
    setIsAdModalOpen(true);
  };

  const handleEditAd = (ad: any) => { 
    // Convert UTC timestamps to local datetime strings for the input fields
    const toLocalString = (isoString: string) => {
      if (!isoString) return "";
      const d = new Date(isoString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    setEditingAd({ 
      ...ad,
      start_date: toLocalString(ad.start_date),
      end_date: toLocalString(ad.end_date)
    }); 
    setIsAdModalOpen(true); 
  };

  const handleDeleteAd = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this promotion? This cannot be undone.")) return;
    if (!publicKey) return;
    await fetch(`/api/admin/promotions/${id}?wallet=${publicKey.toBase58()}`, { method: "DELETE" });
    setAds(ads.filter(a => a.promotions_id !== id));
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    
    // Clean up dates for the database
    const payload = { ...editingAd };
    payload.start_date = payload.start_date ? new Date(payload.start_date).toISOString() : null;
    payload.end_date = payload.end_date ? new Date(payload.end_date).toISOString() : null;

    const isNew = !editingAd.promotions_id;
    const res = await fetch(
      isNew ? `/api/admin/promotions?wallet=${publicKey.toBase58()}` : `/api/admin/promotions/${editingAd.promotions_id}?wallet=${publicKey.toBase58()}`,
      { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    if (res.ok) { fetchAds(publicKey.toBase58()); setIsAdModalOpen(false); }
    else {
      const errorData = await res.json().catch(() => null);
      alert(`Failed to save promotion. ${errorData?.error || ""}`);
    }
  };

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Hero Banners & Ads</h1>
          <p className="mt-2 text-sm text-stone-400">Manage dynamic promotions shown on the homepage hero slider and sidebar.</p>
        </div>
        <button onClick={handleCreateAd}
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-emerald-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Promotion
        </button>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-500">Placement:</span>
          <select value={filterPlacement} onChange={e => setFilterPlacement(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-semibold text-white focus:border-emerald-500/50 focus:outline-none">
            <option value="all">All</option>
            <option value="hero">Hero Banners</option>
            <option value="sidebar">Sidebar Ads</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-500">Status:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-semibold text-white focus:border-emerald-500/50 focus:outline-none">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Inactive (Expired)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {ads
          .filter(ad => filterPlacement === "all" || ad.placement === filterPlacement)
          .filter(ad => {
            const isExpired = ad.end_date && new Date(ad.end_date).getTime() < new Date().getTime();
            if (filterStatus === "all") return true;
            if (filterStatus === "active") return ad.is_active && !isExpired;
            if (filterStatus === "inactive") return !ad.is_active && !isExpired;
            if (filterStatus === "expired") return isExpired;
            return true;
          })
          .map(ad => (
          <div key={ad.promotions_id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-xl">
            {ad.image_url && (
              <div className="relative h-36 w-full overflow-hidden bg-black/30">
                <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover opacity-80" />
                <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ad.placement === "sidebar" ? "bg-violet-500/80 text-white" : "bg-emerald-500/80 text-white"}`}>
                  {ad.placement}
                </span>
                {(() => {
                  const isExpired = ad.end_date && new Date(ad.end_date).getTime() < new Date().getTime();
                  if (isExpired) {
                    return (
                      <span className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-400/20 text-red-300">
                        ○ Inactive (Expired)
                      </span>
                    );
                  }
                  return (
                    <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${ad.is_active ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"}`}>
                      {ad.is_active ? "● Active" : "○ Inactive"}
                    </span>
                  );
                })()}
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                {ad.badge_text && <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-400">{ad.badge_text}</span>}
                <h3 className="text-base font-bold text-white line-clamp-2">{ad.title}</h3>
                <p className="mt-1 text-xs text-stone-400 line-clamp-2">{ad.description}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEditAd(ad)} className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Edit</button>
                <button onClick={() => handleDeleteAd(ad.promotions_id)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {ads.filter(ad => filterPlacement === "all" || ad.placement === filterPlacement)
            .filter(ad => {
              const isExpired = ad.end_date && new Date(ad.end_date).getTime() < new Date().getTime();
              if (filterStatus === "all") return true;
              if (filterStatus === "active") return ad.is_active && !isExpired;
              if (filterStatus === "inactive") return !ad.is_active && !isExpired;
              if (filterStatus === "expired") return isExpired;
              return true;
            }).length === 0 && (
          <div className="col-span-full py-20 text-center border border-white/10 border-dashed rounded-2xl">
            <p className="text-stone-400">No promotions match your filters.</p>
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {isAdModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl md:p-8">
            <h2 className="text-2xl font-bold text-white">{editingAd.promotions_id ? "Edit Promotion" : "New Promotion"}</h2>
            <form onSubmit={handleSaveAd} className="mt-6 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Placement</label>
                  <select value={editingAd.placement} onChange={e => setEditingAd({...editingAd, placement: e.target.value})}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none">
                    <option value="hero">Hero Banner (Top Slider)</option>
                    <option value="sidebar">Sidebar Ad (Sponsored Box)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Badge Text</label>
                  <input value={editingAd.badge_text || ""} onChange={e => setEditingAd({...editingAd, badge_text: e.target.value})}
                    placeholder="e.g. PLATFORM NEWS"
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">Title <span className="text-red-400">*</span></label>
                <input required value={editingAd.title} onChange={e => setEditingAd({...editingAd, title: e.target.value})}
                  placeholder="e.g. Monetize Your Community Lore"
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">Description</label>
                <textarea rows={2} value={editingAd.description || ""} onChange={e => setEditingAd({...editingAd, description: e.target.value})}
                  placeholder="Short supporting text..."
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-stone-400">Background Image URL <span className="text-red-400">*</span></label>
                <input required value={editingAd.image_url} onChange={e => setEditingAd({...editingAd, image_url: e.target.value})}
                  placeholder="https://.../banner.jpg"
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Button 1 Text</label>
                  <input value={editingAd.button_text || ""} onChange={e => setEditingAd({...editingAd, button_text: e.target.value})}
                    placeholder="Learn More"
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Button 1 URL</label>
                  <input value={editingAd.button_url || ""} onChange={e => setEditingAd({...editingAd, button_url: e.target.value})}
                    placeholder="https://..."
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Button 2 Text</label>
                  <input value={editingAd.button_2_text || ""} onChange={e => setEditingAd({...editingAd, button_2_text: e.target.value})}
                    placeholder="Update Hub"
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Button 2 URL</label>
                  <input value={editingAd.button_2_url || ""} onChange={e => setEditingAd({...editingAd, button_2_url: e.target.value})}
                    placeholder="https://..."
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-stone-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Start Date (Optional)</label>
                  <input type="datetime-local" value={editingAd.start_date || ""}
                    onChange={e => setEditingAd({...editingAd, start_date: e.target.value})}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none [color-scheme:dark]" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-stone-400">End Date (Optional)</label>
                    <button type="button" 
                      onClick={() => {
                        const nowLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        setEditingAd({...editingAd, end_date: nowLocal, is_active: false});
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300">
                      Expire Now
                    </button>
                  </div>
                  <input type="datetime-local" value={editingAd.end_date || ""}
                    onChange={e => setEditingAd({...editingAd, end_date: e.target.value})}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-stone-400">Display Order</label>
                  <input type="number" min="0" value={editingAd.display_order}
                    onChange={e => setEditingAd({...editingAd, display_order: parseInt(e.target.value) || 0})}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="is_active" checked={editingAd.is_active}
                    onChange={e => setEditingAd({...editingAd, is_active: e.target.checked})}
                    className="h-4 w-4 accent-emerald-400" />
                  <label htmlFor="is_active" className="text-sm font-semibold text-stone-300">Active (show on site)</label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-6">
                <button type="button" onClick={() => setIsAdModalOpen(false)}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 hover:text-white">Cancel</button>
                <button type="submit"
                  className="rounded-lg bg-emerald-400 px-6 py-2.5 text-sm font-bold text-neutral-950 hover:bg-emerald-300">Save Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
