import { Card, Select, SimpleGrid, Textarea, TextInput, Title } from "@mantine/core";
import { SCOPES, STATUSES, type Scope, type Status } from "@air/schema";

export interface MetaValue {
  name: string;
  displayName: string;
  description: string;
  scope: Scope;
  status: Status;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function MetaFields({
  value,
  onChange,
  errors = {},
  autoName = false,
}: {
  value: MetaValue;
  onChange: (next: MetaValue) => void;
  errors?: Partial<Record<keyof MetaValue, string>>;
  /** Display Name から name を自動生成する (新規作成時) */
  autoName?: boolean;
}) {
  return (
    <Card withBorder>
      <Title order={4} mb="sm">
        General
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <TextInput
          label="Display Name"
          required
          placeholder="API Design Review"
          value={value.displayName}
          error={errors.displayName}
          onChange={(e) => {
            const displayName = e.currentTarget.value;
            const autoSlug = autoName && (value.name === "" || value.name === slugify(value.displayName));
            onChange({ ...value, displayName, name: autoSlug ? slugify(displayName) : value.name });
          }}
        />
        <TextInput
          label="Name"
          description="kebab-case の一意な識別子"
          required
          placeholder="api-design-review"
          classNames={{ input: "mono" }}
          value={value.name}
          error={errors.name}
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
        />
        <Select
          label="Scope"
          data={[...SCOPES]}
          value={value.scope}
          allowDeselect={false}
          onChange={(v) => v && onChange({ ...value, scope: v as Scope })}
        />
        <Select
          label="Status"
          data={[...STATUSES]}
          value={value.status}
          allowDeselect={false}
          onChange={(v) => v && onChange({ ...value, status: v as Status })}
        />
      </SimpleGrid>
      <Textarea
        mt="sm"
        label="Description"
        autosize
        minRows={2}
        value={value.description}
        error={errors.description}
        onChange={(e) => onChange({ ...value, description: e.currentTarget.value })}
      />
    </Card>
  );
}
