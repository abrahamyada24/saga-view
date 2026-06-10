import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/frames")({
  component: () => <Navigate to="/customer/frame" />,
});
