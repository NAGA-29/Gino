import { Button, Checkbox, Group, Table, Text } from "@mantine/core";
import { IconGitCompare } from "@tabler/icons-react";
import { compareSemver } from "@air/domain";
import { useState } from "react";
import { Link } from "react-router-dom";
import { VersionBadge } from "../../components/Badges";
import { QueryState } from "../../components/QueryState";
import { formatDate } from "../../components/date";
import { useVersions } from "../../hooks/queries";

export function VersionList({ instructionId, currentVersionId }: { instructionId: string; currentVersionId: string | null }) {
  const query = useVersions(instructionId);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (v: string) =>
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s.slice(-1), v]));

  const [from, to] = [...selected].sort(compareSemver);

  return (
    <QueryState query={query}>
      {(versions) => (
        <>
          <Group justify="space-between" mb="sm">
            <Text size="sm" c="dimmed">
              2つ選択して差分を表示
            </Text>
            <Button
              size="xs"
              leftSection={<IconGitCompare size={14} />}
              disabled={selected.length !== 2}
              component={Link}
              to={`/instructions/${instructionId}/diff?from=${from}&to=${to}`}
            >
              Compare {selected.length === 2 ? `v${from} → v${to}` : ""}
            </Button>
          </Group>
          <Table verticalSpacing="xs">
            <Table.Tbody>
              {versions.map((v, i) => {
                const prev = versions[i + 1];
                return (
                  <Table.Tr key={v.id}>
                    <Table.Td w={40}>
                      <Checkbox
                        checked={selected.includes(v.version)}
                        onChange={() => toggle(v.version)}
                        aria-label={`select v${v.version}`}
                      />
                    </Table.Td>
                    <Table.Td w={120}>
                      <Group gap={4}>
                        <VersionBadge version={v.version} />
                        {v.id === currentVersionId && (
                          <Text size="xs" c="green">
                            current
                          </Text>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{v.changeSummary || <Text span c="dimmed">—</Text>}</Text>
                    </Table.Td>
                    <Table.Td w={170}>
                      <Text size="sm" c="dimmed">
                        {formatDate(v.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td w={90}>
                      {prev && (
                        <Button
                          size="compact-xs"
                          variant="subtle"
                          component={Link}
                          to={`/instructions/${instructionId}/diff?from=${prev.version}&to=${v.version}`}
                        >
                          diff
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </>
      )}
    </QueryState>
  );
}
