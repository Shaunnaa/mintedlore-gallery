"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

type FilterType = "day" | "week" | "month" | "year" | "all";

export default function AdminDashboard() {
  const { publicKey } = useWallet();
  const [filter, setFilter] = useState<FilterType>("month");
  const [data, setData] = useState<{ totalViews: number; chartData: any[]; topPerformers: any[]; platformTotals: { profiles: number; collections: number; stories: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;
    
    setLoading(true);
    fetch(`/api/admin/analytics?wallet=${publicKey.toBase58()}&filter=${filter}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [publicKey, filter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* Platform Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#121216] p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Profiles</p>
          <p className="mt-2 text-3xl font-black text-white">{data.platformTotals.profiles.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121216] p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Collections</p>
          <p className="mt-2 text-3xl font-black text-white">{data.platformTotals.collections.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121216] p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Stories</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{data.platformTotals.stories.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Key Metrics */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-lg bg-black/40 p-1 ring-1 ring-white/10">
          {(["day", "week", "month", "year", "all"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded-md ${
                filter === f ? "bg-emerald-500/20 text-emerald-400" : "text-stone-400 hover:text-white"
              }`}
            >
              {f === "day" ? "24H" : f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-3 text-center">
            <p className="text-xs font-semibold uppercase text-stone-500">Total Views</p>
            <p className="mt-1 text-2xl font-black text-white">{data.totalViews.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-3 text-center">
            <p className="text-xs font-semibold uppercase text-stone-500">Avg / Day</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">
              {data.chartData.length > 0 ? Math.round(data.totalViews / data.chartData.length).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-xl">
        <h3 className="mb-6 text-lg font-bold text-white">Platform Traffic</h3>
        <div className="h-80 w-full">
          {data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickMargin={10} minTickGap={20} />
                <YAxis stroke="#ffffff40" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#1a1a1f", borderColor: "#ffffff20", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#34d399", fontWeight: "bold" }}
                />
                <Line type="monotone" dataKey="views" name="Views" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: "#101014", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-sm text-stone-500">No views logged for this timeframe.</div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-xl">
        <h3 className="mb-6 text-lg font-bold text-white">Top 5 Collections & Stories</h3>
        <div className="h-64 w-full">
          {data.topPerformers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topPerformers} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff40" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={12} width={100} tick={{ fill: '#a8a29e' }} />
                <RechartsTooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: "#1a1a1f", borderColor: "#ffffff20", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="count" name="Total Views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-sm text-stone-500">No data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
