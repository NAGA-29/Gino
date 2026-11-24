import { Button, Group, Stack, Title } from "@mantine/core";
import { CreateInstructionInputSchema, emptyContent, type InstructionContent } from "@air/schema";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { notifyError, notifySuccess } from "../components/notify";
import { ContentEditor, cleanContent } from "../features/instruction/ContentEditor";
import { MetaFields, type MetaValue } from "../features/instruction/MetaFields";
import { VersionFields } from "../features/instruction/VersionFields";
import { useInvalidatingMutation } from "../hooks/queries";

type FieldErrors = Record<string, string>;

export function InstructionNewPage() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<MetaValue>({
    name: "",
    displayName: "",
    description: "",
    scope: "general",
    status: "draft",
  });
  const [content, setContent] = useState<InstructionContent>(emptyContent);
  const [ver, setVer] = useState({ version: "1.0.0", changeSummary: "Initial version" });
  const [errors, setErrors] = useState<FieldErrors>({});

  const create = useInvalidatingMutation(endpoints.createInstruction);

  const submit = () => {
    const parsed = CreateInstructionInputSchema.safeParse({ ...meta, ...ver, content: cleanContent(content) });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }
    setErrors({});
    create.mutate(parsed.data, {
      onSuccess: (created) => {
        notifySuccess(`${created.displayName} を作成しました`);
        navigate(`/instructions/${created.id}`);
      },
      onError: notifyError,
    });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>New Instruction</Title>
        <Group>
          <Button variant="default" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Create
          </Button>
        </Group>
      </Group>
      <MetaFields value={meta} onChange={setMeta} errors={errors} autoName />
      <ContentEditor value={content} onChange={setContent} />
      <VersionFields {...ver} onChange={setVer} error={errors.version} />
    </Stack>
  );
}
