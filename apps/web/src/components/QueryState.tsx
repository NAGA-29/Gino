import { Alert, Center, Loader } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { ApiError } from "../api/client";

export const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.detailMessage : err instanceof Error ? err.message : String(err);

export function ErrorAlert({ error }: { error: unknown }) {
  return (
    <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Error">
      {errorMessage(error)}
    </Alert>
  );
}

/** useQuery の結果を loading / error / data に振り分ける */
export function QueryState<T>({
  query,
  children,
}: {
  query: { isPending: boolean; error: unknown; data: T | undefined };
  children: (data: T) => ReactNode;
}) {
  if (query.isPending)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  if (query.error) return <ErrorAlert error={query.error} />;
  return <>{children(query.data as T)}</>;
}
