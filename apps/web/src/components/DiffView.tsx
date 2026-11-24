import { Text } from "@mantine/core";

const lineClass = (line: string) => {
  if (line.startsWith("+++") || line.startsWith("---")) return "diff-line diff-file";
  if (line.startsWith("@@")) return "diff-line diff-hunk";
  if (line.startsWith("+")) return "diff-line diff-add";
  if (line.startsWith("-")) return "diff-line diff-del";
  return "diff-line";
};

/** unified diff を行単位で色付け表示する */
export function DiffView({ unified }: { unified: string }) {
  if (!unified.trim()) {
    return (
      <Text c="dimmed" size="sm">
        差分はありません。
      </Text>
    );
  }
  const lines = unified.replace(/\n$/, "").split("\n");
  return (
    <div className="diff">
      {lines.map((line, i) => (
        <div key={i} className={lineClass(line)}>
          {line || " "}
        </div>
      ))}
    </div>
  );
}
