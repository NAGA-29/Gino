import { Anchor, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { SCOPES, STATUSES } from "@air/schema";
import { Link } from "react-router-dom";
import { ScopeBadge, StatusBadge, VersionBadge } from "../components/Badges";
import { QueryState } from "../components/QueryState";
import { formatDate } from "../components/date";
import { useDashboard } from "../hooks/queries";

export function DashboardPage() {
  const query = useDashboard();
  return (
    <Stack>
      <Title order={2}>Dashboard</Title>
      <QueryState query={query}>
        {(d) => (
          <>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Card withBorder>
                <Text c="dimmed" size="sm">
                  Instructions
                </Text>
                <Text fz={36} fw={700}>
                  {d.total}
                </Text>
                <Anchor component={Link} to="/instructions" size="sm">
                  一覧を見る →
                </Anchor>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm" mb="xs">
                  By Scope
                </Text>
                <Stack gap={4}>
                  {SCOPES.map((s) => (
                    <Group key={s} justify="space-between">
                      <Anchor component={Link} to={`/instructions?scope=${s}`} underline="never">
                        <ScopeBadge scope={s} />
                      </Anchor>
                      <Text fw={600}>{d.byScope[s] ?? 0}</Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
              <Card withBorder>
                <Text c="dimmed" size="sm" mb="xs">
                  By Status
                </Text>
                <Stack gap={4}>
                  {STATUSES.map((s) => (
                    <Group key={s} justify="space-between">
                      <Anchor component={Link} to={`/instructions?status=${s}`} underline="never">
                        <StatusBadge status={s} />
                      </Anchor>
                      <Text fw={600}>{d.byStatus[s] ?? 0}</Text>
                    </Group>
                  ))}
                  <Group justify="space-between" mt="xs">
                    <Anchor component={Link} to="/projects" size="sm">
                      Projects
                    </Anchor>
                    <Text fw={600}>{d.projectCount}</Text>
                  </Group>
                </Stack>
              </Card>
            </SimpleGrid>

            <Card withBorder>
              <Title order={4} mb="sm">
                Recent Changes
              </Title>
              {d.recentChanges.length === 0 ? (
                <Text c="dimmed">まだ変更はありません。</Text>
              ) : (
                <Table.ScrollContainer minWidth={500}>
                  <Table verticalSpacing="xs">
                    <Table.Tbody>
                      {d.recentChanges.map((r) => (
                        <Table.Tr key={`${r.instructionId}-${r.version}`}>
                          <Table.Td>
                            <Anchor component={Link} to={`/instructions/${r.instructionId}`} fw={600}>
                              {r.displayName}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>
                            <VersionBadge version={r.version} />
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed" lineClamp={1}>
                              {r.changeSummary}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {formatDate(r.createdAt)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Card>
          </>
        )}
      </QueryState>
    </Stack>
  );
}
