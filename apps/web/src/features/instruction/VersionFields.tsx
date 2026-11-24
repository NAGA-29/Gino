import { Badge, Button, Card, Group, SimpleGrid, Text, TextInput, Title } from "@mantine/core";
import { bumpVersion, type BumpKind } from "@air/domain";

const BUMP_HINT: Record<BumpKind, string> = {
  major: "Activation Rule の変更 / ルール削除 → MAJOR 推奨",
  minor: "ルール・タグの追加 → MINOR 推奨",
  patch: "文章修正 → PATCH 推奨",
};

export function VersionFields({
  version,
  changeSummary,
  onChange,
  currentVersion,
  suggested,
  error,
}: {
  version: string;
  changeSummary: string;
  onChange: (v: { version: string; changeSummary: string }) => void;
  currentVersion?: string;
  suggested?: BumpKind | null;
  error?: string;
}) {
  return (
    <Card withBorder>
      <Group justify="space-between" mb="sm">
        <Title order={4}>Version</Title>
        {currentVersion && (
          <Text size="sm" c="dimmed">
            current: <span className="mono">v{currentVersion}</span>
          </Text>
        )}
      </Group>
      {currentVersion && suggested && (
        <Group mb="sm" gap="xs">
          <Badge color={suggested === "major" ? "red" : suggested === "minor" ? "blue" : "gray"}>{suggested}</Badge>
          <Text size="sm">{BUMP_HINT[suggested]}</Text>
          {(["patch", "minor", "major"] as const).map((k) => (
            <Button
              key={k}
              size="compact-xs"
              variant={k === suggested ? "filled" : "default"}
              onClick={() => onChange({ version: bumpVersion(currentVersion, k), changeSummary })}
            >
              {bumpVersion(currentVersion, k)}
            </Button>
          ))}
        </Group>
      )}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <TextInput
          label="Version"
          description="SemVer (手動入力可)"
          required
          classNames={{ input: "mono" }}
          value={version}
          error={error}
          onChange={(e) => onChange({ version: e.currentTarget.value, changeSummary })}
        />
        <TextInput
          label="Change Summary"
          placeholder="何を変更したか"
          value={changeSummary}
          onChange={(e) => onChange({ version, changeSummary: e.currentTarget.value })}
        />
      </SimpleGrid>
    </Card>
  );
}
