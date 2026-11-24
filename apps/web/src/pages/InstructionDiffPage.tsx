import { Anchor, Badge, Card, Group, SegmentedControl, Select, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { DiffView } from "../components/DiffView";
import { QueryState } from "../components/QueryState";
import { useDiff, useInstruction, useVersions } from "../hooks/queries";

const SECTION_LABELS: Record<string, string> = {
  activation: "Activation Diff",
  instructions: "Instruction Diff",
  body: "Body Diff",
  tags: "Tag Diff",
};

export function InstructionDiffPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<"sections" | "unified">("sections");
  const instruction = useInstruction(id);
  const versions = useVersions(id);

  const from = params.get("from");
  const to = params.get("to");
  const diff = useDiff(id, from, to);

  const options = (versions.data ?? []).map((v) => ({ value: v.version, label: `v${v.version}` }));
  const set = (key: "from" | "to", value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <Stack>
      <Stack gap={2}>
        <Anchor component={Link} to={`/instructions/${id}?tab=versions`} size="sm">
          ← {instruction.data?.displayName ?? "Instruction"}
        </Anchor>
        <Title order={2}>Diff</Title>
      </Stack>

      <Card withBorder>
        <Group align="flex-end">
          <Select label="From" data={options} value={from} onChange={(v) => set("from", v)} w={160} />
          <IconArrowRight size={18} style={{ marginBottom: 10 }} />
          <Select label="To" data={options} value={to} onChange={(v) => set("to", v)} w={160} />
          <SegmentedControl
            ml="auto"
            value={mode}
            onChange={(v) => setMode(v as typeof mode)}
            data={[
              { value: "sections", label: "By section" },
              { value: "unified", label: "Unified" },
            ]}
          />
        </Group>
      </Card>

      {!from || !to ? (
        <Text c="dimmed">比較する2つのVersionを選択してください。</Text>
      ) : (
        <QueryState query={diff}>
          {(d) => (
            <Stack>
              <Group gap="xs">
                <Badge color="green" variant="light">
                  +{d.stats.additions}
                </Badge>
                <Badge color="red" variant="light">
                  -{d.stats.deletions}
                </Badge>
              </Group>
              {mode === "unified" ? (
                <DiffView unified={d.unified} />
              ) : (
                d.sections.map((s) => (
                  <Card withBorder key={s.section}>
                    <Group justify="space-between" mb={s.changed ? "sm" : 0}>
                      <Title order={5}>{SECTION_LABELS[s.section] ?? s.section}</Title>
                      <Badge variant="light" color={s.changed ? "orange" : "gray"}>
                        {s.changed ? "changed" : "unchanged"}
                      </Badge>
                    </Group>
                    {s.changed && <DiffView unified={s.unified} />}
                  </Card>
                ))
              )}
            </Stack>
          )}
        </QueryState>
      )}
    </Stack>
  );
}
