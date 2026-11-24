import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { InstructionListPage } from "../pages/InstructionListPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { Layout } from "./Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/instructions", element: <InstructionListPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
