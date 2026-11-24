import { Badge } from "@mantine/core";
import type { Scope, Status } from "@air/schema";

const SCOPE_COLORS: Record<Scope, string> = {
  general: "blue",
  organization: "grape",
  personal: "teal",
  project: "orange",
  experimental: "pink",
};

const STATUS_COLORS: Record<Status, string> = {
  draft: "gray",
  review: "yellow",
  published: "green",
  deprecated: "orange",
  archived: "dark",
};

export const ScopeBadge = ({ scope }: { scope: Scope }) => (
  <Badge variant="light" color={SCOPE_COLORS[scope]} tt="capitalize">
    {scope}
  </Badge>
);

export const StatusBadge = ({ status }: { status: Status }) => (
  <Badge variant="dot" color={STATUS_COLORS[status]} tt="capitalize">
    {status}
  </Badge>
);

export const VersionBadge = ({ version }: { version?: string | null }) => (
  <Badge variant="outline" color="gray" tt="none" className="mono">
    {version ? `v${version}` : "—"}
  </Badge>
);
