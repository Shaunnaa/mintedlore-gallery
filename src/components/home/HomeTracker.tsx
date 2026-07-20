"use client";

import { useEffect } from "react";

export default function HomeTracker() {
  useEffect(() => {
    // Only track once per session to avoid spamming
    if (sessionStorage.getItem("tracked_homepage")) return;
    
    fetch("/api/analytics/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_type: "homepage" }),
    })
      .then(() => sessionStorage.setItem("tracked_homepage", "true"))
      .catch(console.error);
  }, []);

  return null;
}
