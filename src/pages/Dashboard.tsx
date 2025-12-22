import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/shared/PageComponents";
import { Users, Building2, BookOpen, Bus, CreditCard, MessageSquare } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard title="Total Users" value="0" icon={Users} />
          <StatsCard title="Institutes" value="0" icon={Building2} />
          <StatsCard title="Subjects" value="0" icon={BookOpen} />
          <StatsCard title="Transport Routes" value="0" icon={Bus} />
          <StatsCard title="Payments" value="$0" icon={CreditCard} />
          <StatsCard title="SMS Sent" value="0" icon={MessageSquare} />
        </div>
      </div>
    </DashboardLayout>
  );
}
