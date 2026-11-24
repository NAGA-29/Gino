import { Button, Code, CopyButton, Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import type { ExportRequest, ExportResult } from "@air/schema";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../api/endpoints";
import { QueryState } from "../../components/QueryState";

export function downloadResult(result: ExportResult) {
  const blob = new Blob([result.content], { type: `${result.mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exportリクエストの結果をプレビューし、コピー/ダウンロードできるようにする */
export function ExportPreview({ request, enabled = true }: { request: ExportRequest; enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["export", request],
    queryFn: () => endpoints.export(request),
    enabled,
  });

  if (!enabled) return <Text c="dimmed">Export対象を選択してください。</Text>;

  return (
    <QueryState query={query}>
      {(result) => (
        <Stack>
          <Group justify="space-between">
            <Text size="sm" c="dimmed" className="mono">
              {result.filename}
            </Text>
            <Group gap="xs">
              <CopyButton value={result.content}>
                {({ copied, copy }) => (
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    onClick={copy}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </CopyButton>
              <Button size="xs" leftSection={<IconDownload size={14} />} onClick={() => downloadResult(result)}>
                Download
              </Button>
            </Group>
          </Group>
          <Code block style={{ maxHeight: 600, overflow: "auto" }}>
            {result.content}
          </Code>
        </Stack>
      )}
    </QueryState>
  );
}
