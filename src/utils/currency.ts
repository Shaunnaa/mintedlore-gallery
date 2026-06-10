const LAMPORTS_PER_SOL = 1_000_000_000;

export function lamportsToSol(lamports: number | null | undefined): string {
  if (typeof lamports !== "number" || Number.isNaN(lamports)) {
    return "0.00";
  }

  return (lamports / LAMPORTS_PER_SOL).toFixed(2);
}
