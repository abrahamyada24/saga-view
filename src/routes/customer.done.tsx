import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/done")({
  component: () => <Navigate to="/customer/finish" />,
});
