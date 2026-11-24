import { Badge, Group, List, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { Activation } from "@air/schema";

function Section({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <Stack gap={4}>
      <Title order={5} c={color}>
        {title}
      </Title>
      {items.length ? (
        <List size="sm" spacing={2}>
          {items.map((i) => (
            <List.Item key={i}>{i}</List.Item>
          ))}
        </List>
      ) : (
        <Text size="sm" c="dimmed">
          —
        </Text>
      )}
    </Stack>
  );
}

function Contexts({ title, items }: { title: string; items: string[] }) {
  return (
    <Stack gap={4}>
      <Title order={5}>{title}</Title>
      {items.length ? (
        <Group gap={6}>
          {items.map((c) => (
            <Badge key={c} variant="light" tt="none">
              {c}
            </Badge>
          ))}
        </Group>
      ) : (
        <Text size="sm" c="dimmed">
          —
        </Text>
      )}
    </Stack>
  );
}

export function ActivationView({ activation }: { activation: Activation }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Section title="When" items={activation.when} color="green" />
      <Section title="When Not" items={activation.whenNot} color="red" />
      <Contexts title="Required Context" items={activation.requiredContext} />
      <Contexts title="Preferred Context" items={activation.preferredContext} />
    </SimpleGrid>
  );
}
