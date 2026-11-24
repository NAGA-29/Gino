import { Alert, Button, Group, Stack, Text, Title } from "@mantine/core";
import { bumpVersion, suggestBump } from "@air/domain";
import {
  InstructionMetaInputSchema,
  VersionStringSchema,
  emptyContent,
  type InstructionContent,
  type InstructionDetail,
} from "@air/schema";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { endpoints } from "../api/endpoints";
import { QueryState } from "../components/QueryState";
import { notifyError, notifySuccess } from "../components/notify";
import { ContentEditor, cleanContent } from "../features/instruction/ContentEditor";
import { MetaFields, type MetaValue } from "../features/instruction/MetaFields";
import { VersionFields } from "../features/instruction/VersionFields";
import { useInstruction, useInvalidatingMutation } from "../hooks/queries";

export function InstructionEditPage() {
  const { id = "" } = useParams();
  const query = useInstruction(id);
  return <QueryState query={query}>{(instruction) => <EditForm key={instruction.id} instruction={instruction} />}</QueryState>;
}

const sameMeta = (a: MetaValue, b: MetaValue) =>
  a.name === b.name &&
  a.displayName === b.displayName &&
  a.description === b.description &&
  a.scope === b.scope &&
  a.status === b.status;

/**
 * メタデータは上書き更新 (PUT)、本文 (Activation / Instructions / Tags) は新Versionとして保存する。
 */
function EditForm({ instruction }: { instruction: InstructionDetail }) {
  const navigate = useNavigate();
  const initialMeta: MetaValue = {
    name: instruction.name,
    displayName: instruction.displayName,
    description: instruction.description,
    scope: instruction.scope,
    status: instruction.status,
  };
  const initialContent = instruction.currentVersion?.content ?? emptyContent();
  const currentVersion = instruction.currentVersion?.version;

  const [meta, setMeta] = useState(initialMeta);
  const [content, setContent] = useState<InstructionContent>(initialContent);
  const [ver, setVer] = useState({ version: "", changeSummary: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cleaned = useMemo(() => cleanContent(content), [content]);
  const suggested = useMemo(() => suggestBump(initialContent, cleaned), [initialContent, cleaned]);
  const contentChanged = suggested !== null;
  const metaChanged = !sameMeta(meta, initialMeta);
  const effectiveVersion = ver.version || (currentVersion && suggested ? bumpVersion(currentVersion, suggested) : "1.0.0");

  const updateMeta = useInvalidatingMutation((input: MetaValue) => endpoints.updateInstruction(instruction.id, input));
  const createVersion = useInvalidatingMutation((input: { version: string; changeSummary: string; content: InstructionContent }) =>
    endpoints.createVersion(instruction.id, input),
  );

  const save = async () => {
    const errs: Record<string, string> = {};
    const m = InstructionMetaInputSchema.safeParse(meta);
    if (!m.success) {
      for (const [k, v] of Object.entries(m.error.flatten().fieldErrors)) errs[k] = v?.[0] ?? "";
    }
    if (contentChanged && !VersionStringSchema.safeParse(effectiveVersion).success) {
      errs.version = "SemVer形式 (例: 1.2.0) で入力してください";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (metaChanged) await updateMeta.mutateAsync(meta);
      if (contentChanged) {
        await createVersion.mutateAsync({ version: effectiveVersion, changeSummary: ver.changeSummary, content: cleaned });
      }
      notifySuccess(contentChanged ? `v${effectiveVersion.replace(/^v/, "")} を作成しました` : "保存しました");
      navigate(`/instructions/${instruction.id}`);
    } catch (err) {
      notifyError(err);
    }
  };

  const saving = updateMeta.isPending || createVersion.isPending;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Edit: {instruction.displayName}</Title>
        <Group>
          <Button variant="default" onClick={() => navigate(`/instructions/${instruction.id}`)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!metaChanged && !contentChanged}>
            {contentChanged ? "Save as new version" : "Save"}
          </Button>
        </Group>
      </Group>
      <MetaFields value={meta} onChange={setMeta} errors={errors} />
      <ContentEditor value={content} onChange={setContent} />
      {contentChanged ? (
        <VersionFields
          version={ver.version || effectiveVersion}
          changeSummary={ver.changeSummary}
          onChange={setVer}
          currentVersion={currentVersion}
          suggested={suggested}
          error={errors.version}
        />
      ) : (
        <Alert color="gray" variant="light">
          <Text size="sm">本文 (Activation / Instructions / Body / Tags) を変更すると新しいVersionとして保存されます。</Text>
        </Alert>
      )}
    </Stack>
  );
}
