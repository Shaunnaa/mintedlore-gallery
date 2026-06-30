"use client";

import SearchBar from "@/components/search/SearchBar";

interface Props {
  items: { name: string; slug: string; type: string }[];
}

export default function GallerySearch({ items }: Props) {
  return (
    <SearchBar
      placeholder="Search NFT collections and stories..."
      filterOptions={["All", "Collection", "Story"]}
      items={items}
      className="mt-6"
    />
  );
}
