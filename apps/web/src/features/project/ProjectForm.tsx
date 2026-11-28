import { Button, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

export interface ProjectFormValue {
  name: string;
  description: string;
}

export function ProjectForm({
  initial = { name: "", description: "" },
  submitLabel,
  loading,
  onSubmit,
  onCancel,
}: {
  initial?: ProjectFormValue;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (v: ProjectFormValue) => void;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Stack
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: value.name.trim(), description: value.description.trim() });
      }}
    >
      <TextInput
        label="Name"
        required
        placeholder="Motion Studio"
        value={value.name}
        onChange={(e) => setValue({ ...value, name: e.currentTarget.value })}
      />
      <Textarea
        label="Description"
        autosize
        minRows={2}
        value={value.description}
        onChange={(e) => setValue({ ...value, description: e.currentTarget.value })}
      />
      <Group justify="flex-end">
        {onCancel && (
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={!value.name.trim()}>
          {submitLabel}
        </Button>
      </Group>
    </Stack>
  );
}
