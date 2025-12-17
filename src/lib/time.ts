/**
 * Subgraph timestamps are usually `BigInt` (string) in **seconds**.
 * Some sources might already be milliseconds; this helper handles both.
 */
export function bigIntTimestampToMs(bigIntString: string): number {
  const n = Number(bigIntString);
  if (!Number.isFinite(n)) return Date.now();
  return n > 1e12 ? n : n * 1000;
}

export function formatRelativeTimeFromBigInt(createdAt: string): string {
  const createdAtMs = bigIntTimestampToMs(createdAt);
  const diffMs = Date.now() - createdAtMs;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatDateBucketFromBigInt(createdAt: string): string {
  const d = new Date(bigIntTimestampToMs(createdAt));
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfThatDay = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).getTime();
  const diffDays = Math.floor(
    (startOfToday - startOfThatDay) / (24 * 60 * 60 * 1000)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


