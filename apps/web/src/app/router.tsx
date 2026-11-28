import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { DocsPage } from "../pages/DocsPage";
import { ExportPage } from "../pages/ExportPage";
import { InstructionDetailPage } from "../pages/InstructionDetailPage";
import { InstructionDiffPage } from "../pages/InstructionDiffPage";
import { InstructionEditPage } from "../pages/InstructionEditPage";
import { InstructionListPage } from "../pages/InstructionListPage";
import { InstructionNewPage } from "../pages/InstructionNewPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ProjectListPage } from "../pages/ProjectListPage";
import { Layout } from "./Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/instructions", element: <InstructionListPage /> },
      { path: "/instructions/new", element: <InstructionNewPage /> },
      { path: "/instructions/:id", element: <InstructionDetailPage /> },
      { path: "/instructions/:id/edit", element: <InstructionEditPage /> },
      { path: "/instructions/:id/diff", element: <InstructionDiffPage /> },
      { path: "/projects", element: <ProjectListPage /> },
      { path: "/projects/:id", element: <ProjectDetailPage /> },
      { path: "/export", element: <ExportPage /> },
      { path: "/docs", element: <Navigate to="/docs/overview" replace /> },
      { path: "/docs/:slug", element: <DocsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
