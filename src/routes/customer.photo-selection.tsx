import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/photo-selection")({
  component: () => <Navigate to="/customer/photos" />,
});
