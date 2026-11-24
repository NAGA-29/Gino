import { Anchor, Button, Card, Group, Modal, Stack, Tabs, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Project } from "@air/schema";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { QueryState } from "../components/QueryState";
import { notifyError, notifySuccess } from "../components/notify";
import { ExportPreview } from "../features/export/ExportPreview";
import { ProjectForm } from "../features/project/ProjectForm";
import { ProjectProfile } from "../features/project/ProjectProfile";
import { keys, useDeleteMutation, useInvalidatingMutation, useProject } from "../hooks/queries";

export function ProjectDetailPage() {
  const { id = "" } = useParams();
  const query = useProject(id);
  return <QueryState query={query}>{(p) => <Detail project={p} />}</QueryState>;
}

function Detail({ project }: { project: Project }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string | null>("profile");
  const [editing, { open, close }] = useDisclosure(false);
  const update = useInvalidatingMutation((v: { name: string; description: string }) =>
    endpoints.updateProject(project.id, v),
  );
  const remove = useDeleteMutation(() => endpoints.deleteProject(project.id), keys.project(project.id));

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: `${project.name} を削除しますか?`,
      children: <Text size="sm">Instruction自体は削除されません。紐付けのみ解除されます。</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          // mutateAsync は画面がアンマウントされても解決するため、確実に遷移できる
          await remove.mutateAsync();
          navigate("/projects");
          notifySuccess("削除しました");
        } catch (err) {
          notifyError(err);
        }
      },
    });

  return (
    <Stack>
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Anchor component={Link} to="/projects" size="sm">
            ← Projects
          </Anchor>
          <Title order={2}>{project.name}</Title>
          {project.description && <Text c="dimmed">{project.description}</Text>}
        </Stack>
        <Group>
          <Button variant="default" leftSection={<IconEdit size={16} />} onClick={open}>
            Edit
          </Button>
          <Button variant="subtle" color="red" leftSection={<IconTrash size={16} />} onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Group>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="export">Export</Tabs.Tab>
        </Tabs.List>
        <Card withBorder mt="md">
          <Tabs.Panel value="profile">
            <ProjectProfile projectId={project.id} />
          </Tabs.Panel>
          <Tabs.Panel value="export">
            {tab === "export" && <ExportPreview request={{ projectId: project.id, format: "markdown" }} />}
          </Tabs.Panel>
        </Card>
      </Tabs>

      <Modal opened={editing} onClose={close} title="Edit Project">
        <ProjectForm
          initial={{ name: project.name, description: project.description }}
          submitLabel="Save"
          loading={update.isPending}
          onCancel={close}
          onSubmit={(v) =>
            update.mutate(v, {
              onSuccess: () => {
                notifySuccess("保存しました");
                close();
              },
              onError: notifyError,
            })
          }
        />
      </Modal>
    </Stack>
  );
}
