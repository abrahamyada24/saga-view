import { createFileRoute } from "@tanstack/react-router";
import { CustomerShell } from "@/components/customer-shell";
import { Navigate } from "@tanstack/react-router";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/customer")({
  component: CustomerShell,
  notFoundComponent: CustomerNotFound,
});

function CustomerNotFound() {
  const { folderName, status } = useStudio();
  if (!folderName) return <Navigate to="/admin/session" />;
  const map: Record<string, string> = {
    folder_selected: "/customer/welcome",
    frame_selected: "/customer/photos",
    photo_selection: "/customer/photos",
    editing: "/customer/editor",
    awaiting_payment: "/customer/review",
    ready_to_export: "/customer/review",
    exported: "/customer/finish",
  };
  return <Navigate to={map[status] ?? "/customer/welcome"} />;
}
