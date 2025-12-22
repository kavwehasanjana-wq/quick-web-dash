import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, EmptyState } from "@/components/shared/PageComponents";
import { Bus } from "lucide-react";

export default function TransportPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Transport"
        description="Manage transport routes and vehicles"
        icon={Bus}
      />
      
      <EmptyState
        title="No transport routes yet"
        description="Configure transport routes, vehicles, and schedules for your institutions."
        icon={Bus}
      />
    </DashboardLayout>
  );
}
