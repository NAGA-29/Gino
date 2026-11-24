import { ActionIcon, Anchor, Button, Group, NumberInput, Select, Stack, Switch, Table, Text, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { SCOPE_LAYER_ORDER } from "@air/domain";
import type { ProjectInstruction } from "@air/schema";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../api/endpoints";
import { ScopeBadge, StatusBadge, VersionBadge } from "../../components/Badges";
import { QueryState } from "../../components/QueryState";
import { notifyError } from "../../components/notify";
import { useInstructions, useInvalidatingMutation, useProjectInstructions } from "../../hooks/queries";

const LAYER_TITLES: Record<string, string> = {
  general: "General",
  organization: "Organization",
  personal: "Personal",
  project: "Project",
  experimental: "Experimental",
};

/**
 * Project Profile 編集 (設計書 §12)
 *   General + Personal + Project + Task Specific
 */
export function ProjectProfile({ projectId }: { projectId: string }) {
  const query = useProjectInstructions(projectId);
  const all = useInstructions();
  const [adding, setAdding] = useState<string | null>(null);

  const upsert = useInvalidatingMutation((pi: { instructionId: string; enabled: boolean; priority: number }) =>
    endpoints.linkProjectInstruction(projectId, pi),
  );
  const unlink = useInvalidatingMutation((instructionId: string) =>
    endpoints.unlinkProjectInstruction(projectId, instructionId),
  );

  const update = (pi: ProjectInstruction, patch: Partial<{ enabled: boolean; priority: number }>) =>
    upsert.mutate(
      { instructionId: pi.instruction.id, enabled: pi.enabled, priority: pi.priority, ...patch },
      { onError: notifyError },
    );

  return (
    <QueryState query={query}>
      {(items) => {
        const linked = new Set(items.map((i) => i.instruction.id));
        const options = (all.data ?? [])
          .filter((i) => !linked.has(i.id))
          .map((i) => ({ value: i.id, label: `${i.displayName} (${i.scope})` }));

        return (
          <Stack>
            <Group align="flex-end">
              <Select
                label="Instructionを追加"
                placeholder="検索して選択"
                searchable
                data={options}
                value={adding}
                onChange={setAdding}
                w={360}
                nothingFoundMessage="該当なし"
              />
              <Button
                disabled={!adding}
                loading={upsert.isPending}
                onClick={() =>
                  adding &&
                  upsert.mutate(
                    { instructionId: adding, enabled: true, priority: 0 },
                    { onSuccess: () => setAdding(null), onError: notifyError },
                  )
                }
              >
                Add
              </Button>
            </Group>

            {items.length === 0 && <Text c="dimmed">Instructionが紐付いていません。</Text>}

            {SCOPE_LAYER_ORDER.map((scope) => {
              const group = items.filter((i) => i.instruction.scope === scope);
              if (!group.length) return null;
              return (
                <Stack key={scope} gap="xs">
                  <Title order={5}>{LAYER_TITLES[scope]}</Title>
                  <Table verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Instruction</Table.Th>
                        <Table.Th w={110}>Version</Table.Th>
                        <Table.Th w={120}>Status</Table.Th>
                        <Table.Th w={110}>Priority</Table.Th>
                        <Table.Th w={80}>Enabled</Table.Th>
                        <Table.Th w={50} />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {group.map((pi) => (
                        <Table.Tr key={pi.instruction.id} opacity={pi.enabled ? 1 : 0.5}>
                          <Table.Td>
                            <Group gap="xs">
                              <Anchor component={Link} to={`/instructions/${pi.instruction.id}`} fw={600}>
                                {pi.instruction.displayName}
                              </Anchor>
                              <ScopeBadge scope={pi.instruction.scope} />
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <VersionBadge version={pi.instruction.currentVersion?.version} />
                          </Table.Td>
                          <Table.Td>
                            <StatusBadge status={pi.instruction.status} />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              size="xs"
                              w={80}
                              defaultValue={pi.priority}
                              onBlur={(e) => {
                                const priority = Number(e.currentTarget.value);
                                if (Number.isInteger(priority) && priority !== pi.priority) update(pi, { priority });
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Switch checked={pi.enabled} onChange={(e) => update(pi, { enabled: e.currentTarget.checked })} />
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              aria-label="remove"
                              onClick={() => unlink.mutate(pi.instruction.id, { onError: notifyError })}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              );
            })}
            <Text size="xs" c="dimmed">
              構成順: General → Organization → Personal → Project → Experimental (同レイヤー内は Priority 降順)
            </Text>
          </Stack>
        );
      }}
    </QueryState>
  );
}
