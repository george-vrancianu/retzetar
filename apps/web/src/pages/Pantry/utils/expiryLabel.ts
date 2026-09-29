export function expiryLabel(expiresAt: string) {
  const date = new Date(expiresAt);
  const formatted = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return `Expired · ${formatted}`;
  if (days <= 3) return `Expires soon · ${formatted}`;
  return `Expires ${formatted}`;
}
