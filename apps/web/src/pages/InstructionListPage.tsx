import { Button, Card, Group, Stack, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { InstructionListQuerySchema, type InstructionListQuery } from "@air/schema";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QueryState } from "../components/QueryState";
import { InstructionFilters } from "../features/instruction/InstructionFilters";
import { InstructionTable } from "../features/instruction/InstructionTable";
import { useInstructions } from "../hooks/queries";

export function InstructionListPage() {
  const [params, setParams] = useSearchParams();

  // フィルタ条件は URL に保持する (Dashboard からのリンクや共有のため)
  const filters = useMemo<InstructionListQuery>(() => {
    const parsed = InstructionListQuerySchema.safeParse(Object.fromEntries(params));
    return parsed.success ? parsed.data : {};
  }, [params]);

  const [debounced] = useDebouncedValue(filters, 250);
  const query = useInstructions(debounced);

  const onChange = (next: InstructionListQuery) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, String(v));
    setParams(sp, { replace: true });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Instructions</Title>
        <Button component={Link} to="/instructions/new" leftSection={<IconPlus size={16} />}>
          New Instruction
        </Button>
      </Group>
      <Card withBorder>
        <InstructionFilters value={filters} onChange={onChange} />
      </Card>
      <QueryState query={query}>{(items) => <InstructionTable items={items} />}</QueryState>
    </Stack>
  );
}
