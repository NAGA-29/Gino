const fmt = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" });
export const formatDate = (iso: string) => fmt.format(new Date(iso));
