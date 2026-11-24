import { ActionIcon, AppShell, Burger, Group, NavLink, Text, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconFileExport,
  IconFolders,
  IconListDetails,
  IconMoon,
  IconPlus,
  IconSun,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Dashboard", icon: IconDashboard, exact: true },
  { to: "/instructions", label: "Instructions", icon: IconListDetails },
  { to: "/instructions/new", label: "New Instruction", icon: IconPlus, exact: true },
  { to: "/projects", label: "Projects", icon: IconFolders },
  { to: "/export", label: "Export", icon: IconFileExport },
];

export function Layout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || (pathname.startsWith(`${to}/`) && pathname !== "/instructions/new");

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} component={Link} to="/">
              AI Instruction Registry
            </Text>
          </Group>
          <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="Toggle color scheme">
            {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            component={Link}
            to={n.to}
            label={n.label}
            leftSection={<n.icon size={18} />}
            active={isActive(n.to, n.exact)}
            onClick={close}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
