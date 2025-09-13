import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserStats } from '@/types/admin';

interface StatsCardsProps {
  stats: UserStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-admin',
      bgColor: 'bg-admin-accent'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'text-status-active',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers.toLocaleString(),
      icon: UserX,
      color: 'text-status-inactive',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Recent Registrations',
      value: stats.recentRegistrations.toLocaleString(),
      icon: Clock,
      color: 'text-status-pending',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-dashboard-border bg-dashboard-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dashboard-muted">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-dashboard-muted mt-1">
                {card.title === 'Recent Registrations' ? 'Last 30 days' : 'System wide'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}