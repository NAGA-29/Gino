import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { InstructionDetailPage } from "../pages/InstructionDetailPage";
import { InstructionEditPage } from "../pages/InstructionEditPage";
import { InstructionListPage } from "../pages/InstructionListPage";
import { InstructionNewPage } from "../pages/InstructionNewPage";
import { NotFoundPage } from "../pages/NotFoundPage";
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
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
