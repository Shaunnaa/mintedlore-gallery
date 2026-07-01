"use client";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center border border-white/10 border-dashed rounded-2xl">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
        <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">User Roles & Access</h2>
      <p className="mt-2 max-w-sm text-stone-400">
        Coming soon — grant <span className="text-emerald-400 font-semibold">Game Creator</span> roles to specific wallet addresses so they can publish game stories on the platform.
      </p>
    </div>
  );
}
