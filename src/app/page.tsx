import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import { getSupabase } from "@/lib/supabase";
import HeroSlider from "@/components/home/HeroSlider";
import AdBanner from "@/components/home/AdBanner";

export const revalidate = 0; // Prevent Next.js from aggressively caching the homepage so views update

export default async function HomeRedesign() {
  const supabase = getSupabase();

  // 1. Fetch Promotions
  const { data: promotions } = await supabase.from("promotions").select("*").eq("is_active", true);
  const heroSlides = promotions?.filter(p => p.placement === "hero") || [];
  const sidebarAds = promotions?.filter(p => p.placement === "sidebar") || [];

  // 2. Fetch Recent Stories
  const { data: recentStoriesData } = await supabase
    .from("stories")
    .select("*, collection:collection_id(name, slug)")
    .order("created_at", { ascending: false })
    .limit(4);
    
  const recentStories = recentStoriesData || [];

  // 3. Fetch Top Views
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split("T")[0];

  const { data: viewsData } = await supabase
    .from("analytics_daily_views")
    .select(`
      view_count, 
      collection:collection_id(collection_id, name, slug, image),
      story:stories_id(stories_id, name, slug, image, collection:collection_id(slug))
    `)
    .gte("view_date", dateStr);

  const collectionStats: Record<string, any> = {};
  const storyStats: Record<string, any> = {};
  
  if (viewsData) {
    for (const row of viewsData) {
      if (row.collection) {
        const coll = Array.isArray(row.collection) ? row.collection[0] : row.collection;
        if (coll && coll.collection_id) {
          const cid = coll.collection_id.toString();
          if (!collectionStats[cid]) {
            collectionStats[cid] = {
              id: coll.collection_id,
              name: coll.name,
              slug: coll.slug,
              image: coll.image,
              total_views: 0
            };
          }
          collectionStats[cid].total_views += row.view_count;
        }
      }
      
      if (row.story) {
        const st = Array.isArray(row.story) ? row.story[0] : row.story;
        if (st && st.stories_id) {
          const sid = st.stories_id.toString();
          if (!storyStats[sid]) {
            const parentColl = Array.isArray(st.collection) ? st.collection[0] : st.collection;
            storyStats[sid] = {
              id: st.stories_id,
              name: st.name,
              slug: st.slug,
              image: st.image,
              parent_slug: parentColl?.slug,
              total_views: 0
            };
          }
          storyStats[sid].total_views += row.view_count;
        }
      }
    }
  }

  const topCollections = Object.values(collectionStats)
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 5);
    
  const topStories = Object.values(storyStats)
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 5);

  // 4. Fetch all items for search
  const { data: allCollections } = await supabase.from("collection").select("name, slug, category");
  const { data: allStories } = await supabase.from("stories").select("name, slug, collection:collection_id(slug)");

  const searchItems = [
    ...(allCollections || []).map(c => ({
      name: c.name,
      slug: c.slug,
      type: c.category === "game" ? "Games" : "Collection"
    })),
    ...(allStories || []).map(s => {
      const parentSlug = Array.isArray(s.collection) ? s.collection[0]?.slug : s.collection?.slug;
      return {
        name: s.name,
        slug: parentSlug ? `${parentSlug}/${s.slug}` : s.slug,
        type: "Stories"
      }
    })
  ];

  return (
    <main className="min-h-screen w-full bg-neutral-950 font-sans text-stone-50 selection:bg-emerald-500/30">
      
      {/* ── 1. HERO CAROUSEL ── */}
      <HeroSlider slides={heroSlides} />

      <div className="mb-8"></div>

      {/* ── SEARCH & DISCOVERY BAR ── */}
      <SearchBar
        placeholder="Search collections, games, and stories..."
        filterOptions={["All", "Collection", "Games", "Stories"]}
        items={searchItems}
        className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-8 mb-8"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-12 space-y-20 pb-20">
        
        {/* ── 2. NEWLY MINTED LORE (New Stories) ── */}
        <section>
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Newly Minted Lore</h2>
            <p className="text-sm text-stone-400 mt-1">The latest chapters published across the ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentStories.length > 0 ? recentStories.map((story, i) => {
              const communityName = Array.isArray(story.collection) 
                ? story.collection[0]?.name 
                : story.collection?.name || "Unknown";
              const parentSlug = Array.isArray(story.collection) 
                ? story.collection[0]?.slug 
                : story.collection?.slug || "";
                
              const publishDate = new Date(story.created_at);
              const isRecent = (Date.now() - publishDate.getTime()) < 86400000;
              const timeDisplay = isRecent ? "Today" : publishDate.toLocaleDateString();

              return (
              <Link href={`/${parentSlug ? parentSlug + "/" : ""}${story.slug}`} key={i} className="group flex flex-col gap-4">
                <div className="aspect-[4/3] w-full rounded-2xl bg-stone-900 border border-white/10 overflow-hidden relative group-hover:border-emerald-500/50 transition-colors">
                   {story.image ? (
                     <img src={story.image} alt={story.name} className="w-full h-full object-cover opacity-80" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-stone-700 font-bold uppercase tracking-widest text-xs">
                       {communityName.substring(0,3)}
                     </div>
                   )}
                   <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                     Chapter
                   </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">{communityName}</p>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{story.name}</h3>
                  <p className="text-xs text-stone-500 mt-2">{timeDisplay}</p>
                </div>
              </Link>
            )}) : (
              <div className="col-span-full py-12 text-center border border-white/10 border-dashed rounded-2xl text-stone-500">
                No recent stories published yet.
              </div>
            )}
          </div>
        </section>
        
        {/* ── 3. PROMOTED AD (Middle Banner) ── */}
        <AdBanner ads={sidebarAds} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ── 4. TOP TRENDING COLLECTIONS ── */}
          <section>
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Top Collections</h2>
              <p className="text-sm text-stone-400 mt-1">Most read hubs this week.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {topCollections.length > 0 ? topCollections.map((comm, index) => (
                <Link href={`/${comm.slug}`} key={comm.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl font-black text-stone-700 w-8 text-center">{index + 1}</div>
                  <div className="h-14 w-14 rounded-xl bg-stone-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {comm.image && comm.image !== "/window.svg" ? (
                      <img src={comm.image} alt={comm.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-stone-600">{comm.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{comm.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-stone-400">
                      <span>👁️ {comm.total_views} Views</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors">
                      Visit Hub
                    </button>
                  </div>
                </Link>
              )) : (
                <div className="py-12 text-center border border-white/10 border-dashed rounded-2xl text-stone-500">
                  No reading data available for this week.
                </div>
              )}
            </div>
          </section>

          {/* ── 4. TOP TRENDING STORIES ── */}
          <section>
            <div className="mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Top Stories</h2>
              <p className="text-sm text-stone-400 mt-1">Most read chapters this week.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {topStories.length > 0 ? topStories.map((story, index) => (
                <Link href={`/${story.parent_slug ? story.parent_slug + "/" : ""}${story.slug}`} key={story.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl font-black text-stone-700 w-8 text-center">{index + 1}</div>
                  <div className="h-14 w-14 rounded-xl bg-stone-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {story.image && story.image !== "/window.svg" ? (
                      <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-stone-600">{story.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{story.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-stone-400">
                      <span>👁️ {story.total_views} Views</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <button className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1.5 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors">
                      Read Story
                    </button>
                  </div>
                </Link>
              )) : (
                <div className="py-12 px-4 text-center border border-white/10 border-dashed rounded-2xl text-stone-500 text-sm">
                  No reading data available for this week.
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
