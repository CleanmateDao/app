export function formatRelativeTime(createdAt: number): string {
  const createdAtMs = createdAt * 1000;
  const diffMs = Date.now() - createdAtMs;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatDateBucket(createdAt: number): string {
  const d = new Date(createdAt * 1000);
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
