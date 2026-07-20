"use client";

import SearchBar from "@/components/search/SearchBar";

interface Props {
  items: { name: string; slug: string; type: string }[];
}

export default function GamesSearch({ items }: Props) {
  return (
    <SearchBar
      placeholder="Search game titles and stories..."
      filterOptions={["All", "Games"]}
      items={items}
      className="mt-6"
    />
  );
}
