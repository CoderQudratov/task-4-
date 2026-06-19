
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Never";

  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
