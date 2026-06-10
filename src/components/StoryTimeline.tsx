const storyEvents = [
  {
    year: "Origin",
    title: "A Single Group With A Shared Signal",
    body: "The collection view starts from one group identity, then follows the market, holders, and special access around that group.",
  },
  {
    year: "Market",
    title: "Live Listings Become The Front Door",
    body: "Magic Eden powers the visible market layer with active listings, prices, artwork, and marketplace links.",
  },
  {
    year: "Wallet",
    title: "Ownership Unlocks Special Access",
    body: "Helius checks connected wallets for collection NFTs, so holders can be recognized without exposing API keys in the browser.",
  },
  {
    year: "Next",
    title: "Story, Utility, And Community",
    body: "The dashboard can grow into holder rewards, curated drops, group lore, and wallet-gated experiences.",
  },
];

export function StoryTimeline() {
  return (
    <section className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          Timeline / Story
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Collection Story Layer
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          A narrative view for explaining the collection, market activity,
          wallet access, and future utility in one clean timeline.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {storyEvents.map((event) => (
          <article
            key={event.title}
            className="border border-white/10 bg-[#101014] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/[0.055]"
          >
            <p className="text-sm font-semibold text-cyan-200">{event.year}</p>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {event.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              {event.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
