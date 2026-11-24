import { createBrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { Layout } from "./Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
