export type CommunityView = "timeline1" | "timeline2" | "timeline3" | "timeline4" | "timeline5" | "gallery";

export type ThemeSettings = {
  primaryColor: string;
  backgroundColor: string;
  borderStyle: string;
};

export type Community = {
  id: number;
  name: string;
  slug: string;
  collectionAddress: string;
  preferredView: CommunityView;
  description: string;
  image: string;
  themeSettings?: ThemeSettings;
  vipThreshold?: number;
};

export const COMMUNITIES: Community[] = [
  {
    id: 0,
    name: "The Lore Gallery",
    slug: "mad_lads",
    collectionAddress: "mad_lads",
    preferredView: "timeline1",
    description:
      "A narrative-first gallery where NFT ownership, market activity, and collection mythology meet.",
    image: "/window.svg",
  },
  {
    id: 1,
    name: "Solana Guild",
    slug: "famous_fox_federation",
    collectionAddress: "famous_fox_federation",
    preferredView: "gallery",
    description:
      "A creative guild profile built around active listings, market metrics, and collector discovery.",
    image: "/globe.svg",
    vipThreshold: 1,
  },
  {
    id: 3,
    name: "Demo 1 (VIP Access)",
    slug: "demo1",
    collectionAddress: "demo1_collection",
    preferredView: "timeline2",
    description: "A demo group showcasing what happens when a user holds all required NFTs for full VIP Access.",
    image: "/window.svg",
    vipThreshold: 10,
  },
  {
    id: 4,
    name: "Demo 2 (Progress)",
    slug: "demo2",
    collectionAddress: "demo2_collection",
    preferredView: "timeline3",
    description: "A demo group showcasing the VIP progress bar when a user holds some, but not all required NFTs (e.g., 5/10).",
    image: "/window.svg",
    vipThreshold: 10,
  },
  {
    id: 5,
    name: "Demo 3 (Holder Sign)",
    slug: "demo3",
    collectionAddress: "famous_fox_federation",
    preferredView: "timeline1",
    description: "A demo group showing a verified 'Holder Sign' badge next to the title when the user holds the required NFTs.",
    image: "/window.svg",
    vipThreshold: 1,
  },
  {
    id: 6,
    name: "Demo 4 (Story Mode)",
    slug: "demo4",
    collectionAddress: "mad_lads",
    preferredView: "timeline4",
    description: "A cinematic storytelling experience. Each NFT is a chapter in an unfolding on-chain saga. Scroll to reveal the story.",
    image: "/window.svg",
  },
  {
    id: 7,
    name: "Demo 5 (Scroll Story)",
    slug: "demo5",
    collectionAddress: "famous_fox_federation",
    preferredView: "timeline5",
    description: "An alien world awaits. Scroll to journey from deep space, through a planet village, into a rocket launch — and arrive at your NFT collection.",
    image: "/window.svg",
  },
];

export function getCommunityBySlug(slug: string): Community | undefined {
  return COMMUNITIES.find((community) => community.slug === slug);
}
