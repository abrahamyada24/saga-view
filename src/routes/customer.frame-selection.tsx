import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/frame-selection")({
  component: () => <Navigate to="/customer/frame" />,
});
