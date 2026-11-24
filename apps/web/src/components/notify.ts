import { notifications } from "@mantine/notifications";
import { errorMessage } from "./QueryState";

export const notifySuccess = (message: string) => notifications.show({ color: "green", message });
export const notifyError = (err: unknown) => notifications.show({ color: "red", title: "Error", message: errorMessage(err) });
