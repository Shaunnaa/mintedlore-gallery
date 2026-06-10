export function OwnedBadge() {
  return (
    <div className="flex w-max items-center gap-1.5 rounded-full border border-blue-400/50 bg-blue-500/20 px-3 py-1 text-xs font-bold tracking-widest text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] backdrop-blur-md">
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      YOU OWN THIS
    </div>
  );
}
