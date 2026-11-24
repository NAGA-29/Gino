import { Group, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { SCOPES, STATUSES, type InstructionListQuery } from "@air/schema";
import { useProjects } from "../../hooks/queries";

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export function InstructionFilters({
  value,
  onChange,
}: {
  value: InstructionListQuery;
  onChange: (next: InstructionListQuery) => void;
}) {
  const projects = useProjects();
  const set = (patch: Partial<InstructionListQuery>) => onChange({ ...value, ...patch });

  return (
    <Group grow align="flex-end">
      <TextInput
        label="Name"
        placeholder="名前・説明で検索"
        leftSection={<IconSearch size={16} />}
        value={value.q ?? ""}
        onChange={(e) => set({ q: e.currentTarget.value || undefined })}
      />
      <TextInput
        label="Tag"
        placeholder="api"
        value={value.tag ?? ""}
        onChange={(e) => set({ tag: e.currentTarget.value || undefined })}
      />
      <Select
        label="Scope"
        clearable
        data={toOptions(SCOPES)}
        value={value.scope ?? null}
        onChange={(v) => set({ scope: (v as InstructionListQuery["scope"]) ?? undefined })}
      />
      <Select
        label="Project"
        clearable
        searchable
        data={(projects.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
        value={value.projectId ?? null}
        onChange={(v) => set({ projectId: v ?? undefined })}
      />
      <Select
        label="Status"
        clearable
        data={toOptions(STATUSES)}
        value={value.status ?? null}
        onChange={(v) => set({ status: (v as InstructionListQuery["status"]) ?? undefined })}
      />
    </Group>
  );
}
