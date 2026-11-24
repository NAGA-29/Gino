import { Card, SimpleGrid, Stack, TagsInput, Text, Textarea, Title } from "@mantine/core";
import type { InstructionContent } from "@air/schema";

/** 1行1項目のテキストエリアと string[] を相互変換する */
const toLines = (list: string[]) => list.join("\n");
const fromLines = (text: string) => text.split("\n");

function LinesInput({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  description?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Textarea
      label={label}
      description={description}
      placeholder={placeholder}
      autosize
      minRows={3}
      value={toLines(value)}
      onChange={(e) => onChange(fromLines(e.currentTarget.value))}
    />
  );
}

/** 空行を除去・trimする (保存直前に呼ぶ) */
export const cleanContent = (c: InstructionContent): InstructionContent => {
  const clean = (l: string[]) => [...new Set(l.map((s) => s.trim()).filter(Boolean))];
  return {
    activation: {
      when: clean(c.activation.when),
      whenNot: clean(c.activation.whenNot),
      requiredContext: clean(c.activation.requiredContext),
      preferredContext: clean(c.activation.preferredContext),
    },
    instructions: clean(c.instructions),
    body: c.body.replace(/\s+$/, ""),
    tags: clean(c.tags.map((t) => t.toLowerCase())),
  };
};

export function ContentEditor({
  value,
  onChange,
}: {
  value: InstructionContent;
  onChange: (next: InstructionContent) => void;
}) {
  const setActivation = (patch: Partial<InstructionContent["activation"]>) =>
    onChange({ ...value, activation: { ...value.activation, ...patch } });

  return (
    <Stack>
      <Card withBorder>
        <Title order={4}>Activation</Title>
        <Text size="sm" c="dimmed" mb="sm">
          いつ使うべきか / 使うべきでないか。1行に1条件。
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <LinesInput
            label="When"
            placeholder={"新規APIを設計する\nREST APIレビューを行う"}
            value={value.activation.when}
            onChange={(when) => setActivation({ when })}
          />
          <LinesInput
            label="When Not"
            placeholder="UIのみの変更"
            value={value.activation.whenNot}
            onChange={(whenNot) => setActivation({ whenNot })}
          />
          <TagsInput
            label="Required Context"
            description="Enterで追加"
            placeholder="backend"
            value={value.activation.requiredContext}
            onChange={(requiredContext) => setActivation({ requiredContext })}
          />
          <TagsInput
            label="Preferred Context"
            description="Enterで追加"
            placeholder="typescript"
            value={value.activation.preferredContext}
            onChange={(preferredContext) => setActivation({ preferredContext })}
          />
        </SimpleGrid>
      </Card>

      <Card withBorder>
        <Title order={4} mb="sm">
          Instructions
        </Title>
        <Stack>
          <LinesInput
            label="Rules"
            description="1行に1ルール (箇条書きとしてExportされます)"
            placeholder={"REST semanticsを確認する\nHTTP status codeを確認する"}
            value={value.instructions}
            onChange={(instructions) => onChange({ ...value, instructions })}
          />
          <Textarea
            label="Body (Markdown)"
            description="補足説明・例など。そのままMarkdownとして出力されます"
            autosize
            minRows={6}
            classNames={{ input: "mono" }}
            value={value.body}
            onChange={(e) => onChange({ ...value, body: e.currentTarget.value })}
          />
        </Stack>
      </Card>

      <Card withBorder>
        <Title order={4} mb="sm">
          Tags
        </Title>
        <TagsInput
          placeholder="api, backend ..."
          value={value.tags}
          onChange={(tags) => onChange({ ...value, tags })}
          splitChars={[",", " "]}
        />
      </Card>
    </Stack>
  );
}
