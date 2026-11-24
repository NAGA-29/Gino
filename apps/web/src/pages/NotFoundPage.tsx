import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack align="flex-start">
      <Title order={2}>Not Found</Title>
      <Text c="dimmed">ページが見つかりません。</Text>
      <Button component={Link} to="/" variant="light">
        Dashboardへ戻る
      </Button>
    </Stack>
  );
}
