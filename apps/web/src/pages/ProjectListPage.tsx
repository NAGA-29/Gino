import { Badge, Button, Card, Group, Modal, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { QueryState } from "../components/QueryState";
import { formatDate } from "../components/date";
import { notifyError, notifySuccess } from "../components/notify";
import { ProjectForm } from "../features/project/ProjectForm";
import { useInvalidatingMutation, useProjects } from "../hooks/queries";

export function ProjectListPage() {
  const query = useProjects();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const create = useInvalidatingMutation(endpoints.createProject);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Projects</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          New Project
        </Button>
      </Group>

      <QueryState query={query}>
        {(projects) =>
          projects.length === 0 ? (
            <Text c="dimmed">Projectはまだありません。</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {projects.map((p) => (
                <Card key={p.id} withBorder component={Link} to={`/projects/${p.id}`}>
                  <Group justify="space-between" mb={4}>
                    <Text fw={700}>{p.name}</Text>
                    <Badge variant="light">{p.instructionCount} instructions</Badge>
                  </Group>
                  <Text size="sm" c="dimmed" lineClamp={2} mih={40}>
                    {p.description || "—"}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">
                    Updated {formatDate(p.updatedAt)}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          )
        }
      </QueryState>

      <Modal opened={opened} onClose={close} title="New Project">
        <ProjectForm
          submitLabel="Create"
          loading={create.isPending}
          onCancel={close}
          onSubmit={(v) =>
            create.mutate(v, {
              onSuccess: (p) => {
                notifySuccess(`${p.name} を作成しました`);
                close();
                navigate(`/projects/${p.id}`);
              },
              onError: notifyError,
            })
          }
        />
      </Modal>
    </Stack>
  );
}
