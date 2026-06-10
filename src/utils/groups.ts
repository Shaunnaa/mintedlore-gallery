export type Group = {
  id: number;
  route: string;
  name: string;
  symbol: string;
};

export const groups: Group[] = [
  {
    id: 0,
    route: "Group0",
    name: "The Lore Gallery",
    symbol: "mad_lads",
  },
  {
    id: 1,
    route: "Group1",
    name: "Solana Creative Guild",
    symbol: "famous_fox_federation",
  },
  {
    id: 2,
    route: "Group2",
    name: "EcoCanvas Collective",
    symbol: "claynosaurz",
  },
];

export const defaultGroup = groups[0];

export function getGroupByRoute(route: string | undefined): Group {
  return groups.find((group) => group.route === route) ?? defaultGroup;
}
