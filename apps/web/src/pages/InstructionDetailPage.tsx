import { Badge, Button, Card, Code, Group, List, Menu, Stack, Tabs, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { STATUSES, type InstructionDetail, type Status } from "@air/schema";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { ScopeBadge, StatusBadge, VersionBadge } from "../components/Badges";
import { QueryState } from "../components/QueryState";
import { formatDate } from "../components/date";
import { notifyError, notifySuccess } from "../components/notify";
import { ExportPreview } from "../features/export/ExportPreview";
import { ActivationView } from "../features/instruction/ActivationView";
import { InstructionProjects } from "../features/instruction/InstructionProjects";
import { VersionList } from "../features/instruction/VersionList";
import { useInstruction, useInvalidatingMutation } from "../hooks/queries";

const TABS = ["overview", "activation", "instructions", "versions", "projects", "export"] as const;

export function InstructionDetailPage() {
  const { id = "" } = useParams();
  const query = useInstruction(id);
  return <QueryState query={query}>{(i) => <Detail instruction={i} />}</QueryState>;
}

function Detail({ instruction: i }: { instruction: InstructionDetail }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get("tab") as (typeof TABS)[number]) ? params.get("tab")! : "overview";
  const content = i.currentVersion?.content;

  const setStatus = useInvalidatingMutation((status: Status) => endpoints.updateInstruction(i.id, { status }));
  const remove = useInvalidatingMutation(() => endpoints.deleteInstruction(i.id));

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: `${i.displayName} を削除しますか?`,
      children: (
        <Text size="sm">
          全Versionと Project への紐付けも削除されます。残しておきたい場合は Status を archived にしてください。
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        remove.mutate(undefined, {
          onSuccess: () => {
            notifySuccess("削除しました");
            navigate("/instructions");
          },
          onError: notifyError,
        }),
    });

  return (
    <Stack>
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={2}>{i.displayName}</Title>
          <Group gap="xs">
            <Text c="dimmed" className="mono" size="sm">
              {i.name}
            </Text>
            <VersionBadge version={i.currentVersion?.version} />
            <ScopeBadge scope={i.scope} />
            <StatusBadge status={i.status} />
          </Group>
        </Stack>
        <Group>
          <Button leftSection={<IconEdit size={16} />} onClick={() => navigate(`/instructions/${i.id}/edit`)}>
            Edit
          </Button>
          <Menu position="bottom-end">
            <Menu.Target>
              <Button variant="default" px="xs" aria-label="more">
                <IconDots size={16} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Status</Menu.Label>
              {STATUSES.filter((s) => s !== i.status).map((s) => (
                <Menu.Item key={s} onClick={() => setStatus.mutate(s, { onError: notifyError })}>
                  → {s}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={confirmDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Tabs value={tab} onChange={(t) => setParams(t && t !== "overview" ? { tab: t } : {}, { replace: true })}>
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="activation">Activation</Tabs.Tab>
          <Tabs.Tab value="instructions">Instructions</Tabs.Tab>
          <Tabs.Tab value="versions">Versions</Tabs.Tab>
          <Tabs.Tab value="projects" rightSection={i.projects.length ? <Badge size="xs">{i.projects.length}</Badge> : null}>
            Projects
          </Tabs.Tab>
          <Tabs.Tab value="export">Export</Tabs.Tab>
        </Tabs.List>

        <Card withBorder mt="md">
          <Tabs.Panel value="overview">
            <Stack>
              <Text>{i.description || <Text span c="dimmed">No description</Text>}</Text>
              <Group gap={6}>
                {content?.tags.map((t) => (
                  <Badge key={t} variant="light" tt="none">
                    #{t}
                  </Badge>
                ))}
              </Group>
              <Text size="sm" c="dimmed">
                Rules: {content?.instructions.length ?? 0} · When: {content?.activation.when.length ?? 0} · Created{" "}
                {formatDate(i.createdAt)} · Updated {formatDate(i.updatedAt)}
              </Text>
              {i.currentVersion?.changeSummary && (
                <Text size="sm">
                  Latest change: <Text span c="dimmed">{i.currentVersion.changeSummary}</Text>
                </Text>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="activation">{content && <ActivationView activation={content.activation} />}</Tabs.Panel>

          <Tabs.Panel value="instructions">
            {content && (
              <Stack>
                {content.instructions.length ? (
                  <List spacing={4}>
                    {content.instructions.map((r) => (
                      <List.Item key={r}>{r}</List.Item>
                    ))}
                  </List>
                ) : (
                  <Text c="dimmed">No rules</Text>
                )}
                {content.body && (
                  <Code block style={{ whiteSpace: "pre-wrap" }}>
                    {content.body}
                  </Code>
                )}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="versions">
            <VersionList instructionId={i.id} currentVersionId={i.currentVersionId} />
          </Tabs.Panel>

          <Tabs.Panel value="projects">
            <InstructionProjects instruction={i} />
          </Tabs.Panel>

          <Tabs.Panel value="export">
            {tab === "export" && <ExportPreview request={{ instructionIds: [i.id], format: "markdown" }} />}
          </Tabs.Panel>
        </Card>
      </Tabs>
    </Stack>
  );
}
