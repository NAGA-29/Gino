import { Anchor, Group, Table, Text } from "@mantine/core";
import type { InstructionDetail } from "@air/schema";
import { Link } from "react-router-dom";
import { ScopeBadge, StatusBadge, VersionBadge } from "../../components/Badges";
import { formatDate } from "../../components/date";

export function InstructionTable({ items }: { items: InstructionDetail[] }) {
  if (items.length === 0) return <Text c="dimmed">該当するInstructionはありません。</Text>;
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Scope</Table.Th>
            <Table.Th>Version</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Project</Table.Th>
            <Table.Th>Updated At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((i) => (
            <Table.Tr key={i.id}>
              <Table.Td>
                <Anchor component={Link} to={`/instructions/${i.id}`} fw={600}>
                  {i.displayName}
                </Anchor>
                <Text size="xs" c="dimmed" className="mono">
                  {i.name}
                </Text>
              </Table.Td>
              <Table.Td>
                <ScopeBadge scope={i.scope} />
              </Table.Td>
              <Table.Td>
                <VersionBadge version={i.currentVersion?.version} />
              </Table.Td>
              <Table.Td>
                <StatusBadge status={i.status} />
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                  {i.projects.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      —
                    </Text>
                  ) : (
                    i.projects.map((p) => (
                      <Anchor key={p.id} component={Link} to={`/projects/${p.id}`} size="sm">
                        {p.name}
                      </Anchor>
                    ))
                  )}
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {formatDate(i.updatedAt)}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
