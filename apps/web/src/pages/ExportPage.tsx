import { Card, Grid, MultiSelect, SegmentedControl, Select, Stack, Text, Title } from "@mantine/core";
import type { ExportRequest } from "@air/schema";
import { useMemo, useState } from "react";
import { ExportPreview } from "../features/export/ExportPreview";
import { useInstructions, useProjects } from "../hooks/queries";

export function ExportPage() {
  const [mode, setMode] = useState<"instructions" | "project">("project");
  const [instructionIds, setInstructionIds] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const instructions = useInstructions();
  const projects = useProjects();

  const request = useMemo<ExportRequest>(
    () =>
      mode === "project"
        ? { projectId: projectId ?? undefined, format: "markdown" }
        : { instructionIds, format: "markdown" },
    [mode, projectId, instructionIds],
  );
  const enabled = mode === "project" ? Boolean(projectId) : instructionIds.length > 0;

  return (
    <Stack>
      <Title order={2}>Export</Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Stack>
              <SegmentedControl
                value={mode}
                onChange={(v) => setMode(v as typeof mode)}
                data={[
                  { value: "project", label: "Project" },
                  { value: "instructions", label: "Instructions" },
                ]}
              />
              {mode === "project" ? (
                <Select
                  label="Project"
                  placeholder="Projectを選択"
                  searchable
                  data={(projects.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
                  value={projectId}
                  onChange={setProjectId}
                />
              ) : (
                <MultiSelect
                  label="Instructions"
                  placeholder="選択した順に出力"
                  searchable
                  data={(instructions.data ?? []).map((i) => ({ value: i.id, label: i.displayName }))}
                  value={instructionIds}
                  onChange={setInstructionIds}
                />
              )}
              <Select label="Format" data={[{ value: "markdown", label: "Generic Markdown" }]} value="markdown" readOnly />
              <Text size="xs" c="dimmed">
                CanonicalなInstructionから出力します。OpenAI Skill / CLAUDE.md / Cursor Rules / AGENTS.md
                は Phase 4 で追加予定です。
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <ExportPreview request={request} enabled={enabled} />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
