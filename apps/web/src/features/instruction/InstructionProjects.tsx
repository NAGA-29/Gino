import { ActionIcon, Anchor, Button, Group, Select, Stack, Table, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { InstructionDetail } from "@air/schema";
import { useState } from "react";
import { Link } from "react-router-dom";
import { endpoints } from "../../api/endpoints";
import { notifyError, notifySuccess } from "../../components/notify";
import { useInvalidatingMutation, useProjects } from "../../hooks/queries";

export function InstructionProjects({ instruction }: { instruction: InstructionDetail }) {
  const projects = useProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const link = useInvalidatingMutation((pid: string) =>
    endpoints.linkProjectInstruction(pid, { instructionId: instruction.id }),
  );
  const unlink = useInvalidatingMutation((pid: string) => endpoints.unlinkProjectInstruction(pid, instruction.id));

  const linked = new Set(instruction.projects.map((p) => p.id));
  const options = (projects.data ?? []).filter((p) => !linked.has(p.id)).map((p) => ({ value: p.id, label: p.name }));

  return (
    <Stack>
      <Group align="flex-end">
        <Select
          label="Projectに追加"
          placeholder={options.length ? "Projectを選択" : "追加できるProjectはありません"}
          data={options}
          value={projectId}
          onChange={setProjectId}
          searchable
          w={300}
        />
        <Button
          disabled={!projectId}
          loading={link.isPending}
          onClick={() =>
            projectId &&
            link.mutate(projectId, {
              onSuccess: () => {
                setProjectId(null);
                notifySuccess("Projectに追加しました");
              },
              onError: notifyError,
            })
          }
        >
          Add
        </Button>
      </Group>
      {instruction.projects.length === 0 ? (
        <Text c="dimmed" size="sm">
          どのProjectにも紐付いていません。
        </Text>
      ) : (
        <Table>
          <Table.Tbody>
            {instruction.projects.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>
                  <Anchor component={Link} to={`/projects/${p.id}`}>
                    {p.name}
                  </Anchor>
                </Table.Td>
                <Table.Td w={50}>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="remove"
                    onClick={() => unlink.mutate(p.id, { onError: notifyError })}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
