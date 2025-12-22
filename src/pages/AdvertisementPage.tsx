import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, ActionButton } from "@/components/shared/PageComponents";
import { Megaphone } from "lucide-react";
import { useState } from "react";
import { CreateAdvertisementForm } from "@/components/forms/CreateAdvertisementForm";

export default function AdvertisementPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateAdvertisement = () => {
    setCreateDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Advertisement"
        description="Manage advertisements and campaigns"
        icon={Megaphone}
        actions={
          <ActionButton label="Create Advertisement" onClick={handleCreateAdvertisement} />
        }
      />

      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Click "Create Advertisement" to add a new advertisement</p>
      </div>

      <CreateAdvertisementForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Refresh logic here when needed
        }}
      />
    </DashboardLayout>
  );
}
