"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ collection_id, stories_id }: { collection_id?: number, stories_id?: number }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    
    // Create a unique key for this specific page
    const storageKey = `mintedlore_view_${collection_id || "null"}_${stories_id || "null"}`;
    const lastViewedStr = localStorage.getItem(storageKey);
    
    // If this browser has already logged a view for this exact page within the last 10 minutes, skip it!
    if (lastViewedStr) {
      const lastViewed = parseInt(lastViewedStr, 10);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - lastViewed < tenMinutes) {
        tracked.current = true;
        return;
      }
    }
    
    // Mark as tracked locally with current timestamp
    tracked.current = true;
    localStorage.setItem(storageKey, Date.now().toString());
    
    fetch("/api/analytics/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection_id, stories_id }),
    }).catch(console.error);
  }, [collection_id, stories_id]);

  return null;
}
