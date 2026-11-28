import { Alert, Anchor, Box, Card, Code, Grid, Group, List, NavLink, Stack, Table, Text, Title } from "@mantine/core";
import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { docPages, type DocBlock } from "../features/docs/content";

function DocContent({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "paragraph":
      return <Text lh={1.9}>{block.text}</Text>;
    case "list":
      return (
        <List type={block.ordered ? "ordered" : "unordered"} spacing="sm" style={{ lineHeight: 1.9 }}>
          {block.items.map((item) => <List.Item key={item}>{item}</List.Item>)}
        </List>
      );
    case "code":
      return <Code block style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{block.text}</Code>;
    case "table":
      return (
        <Table.ScrollContainer minWidth={480}>
          <Table verticalSpacing="sm" withTableBorder>
            <Table.Thead>
              <Table.Tr>{block.headers.map((header) => <Table.Th key={header} scope="col">{header}</Table.Th>)}</Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {block.rows.map((row, index) => (
                <Table.Tr key={index}>
                  {row.map((cell, cellIndex) => <Table.Td key={cellIndex} style={{ lineHeight: 1.8 }}>{cell}</Table.Td>)}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      );
    case "note":
      return <Alert title={block.title} color="blue"><Text size="sm" lh={1.9}>{block.text}</Text></Alert>;
  }
}

export function DocsPage() {
  const { slug } = useParams();
  const index = docPages.findIndex((page) => page.slug === slug);
  const page = docPages[index];
  const previous = docPages[index - 1];
  const next = docPages[index + 1];
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <Stack maw={1200} mx="auto">
      <Title order={2}>ドキュメント</Title>
      <Grid gutter="xl" align="flex-start">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card component="nav" aria-label="ドキュメントの目次" withBorder p="sm">
            <Text fw={700} px="sm" mb="xs">目次</Text>
            {docPages.map((item) => (
              <NavLink
                key={item.slug}
                component={Link}
                to={`/docs/${item.slug}`}
                label={item.title}
                active={item.slug === slug}
                aria-current={item.slug === slug ? "page" : undefined}
              />
            ))}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }} style={{ minWidth: 0 }}>
          <Card component="article" withBorder p={{ base: "md", sm: "xl" }}>
            <Stack gap="xl">
              <Box>
                <Title order={1} size="h2" ref={heading} tabIndex={-1}>{page?.title ?? "ページが見つかりません"}</Title>
                <Text c="dimmed" mt="sm" lh={1.8}>
                  {page?.description ?? "目次から読みたいページを選んでください。"}
                </Text>
              </Box>
              {page ? (
                <>
                  {page.sections.map((section) => (
                    <Stack component="section" key={section.title} gap="md">
                      <Title order={2} size="h3">{section.title}</Title>
                      {section.blocks.map((block, blockIndex) => <DocContent key={blockIndex} block={block} />)}
                    </Stack>
                  ))}
                  <Group component="nav" aria-label="前後のドキュメント" justify="space-between" mt="md">
                    {previous ? <Anchor component={Link} to={`/docs/${previous.slug}`}>← {previous.title}</Anchor> : <span />}
                    {next && <Anchor component={Link} to={`/docs/${next.slug}`}>{next.title} →</Anchor>}
                  </Group>
                </>
              ) : <Anchor component={Link} to="/docs/overview">概要を開く</Anchor>}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
