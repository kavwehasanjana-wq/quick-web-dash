import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import adminAttendanceApi from '@/api/adminAttendance.api';
import calendarApi from '@/api/calendar.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw, TrendingUp, BarChart3, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

const CHART_COLORS = {
  present: 'hsl(var(--chart-1))',
  absent: 'hsl(var(--chart-2))',
  late: 'hsl(var(--chart-3))',
  left: 'hsl(var(--chart-4))',
};

const AdminDashboardCharts: React.FC = () => {
  const { currentInstituteId } = useAuth();
  const [todayStats, setTodayStats] = useState<{ present: number; absent: number; late: number; left: number; total: number } | null>(null);
  const [dayOfWeekData, setDayOfWeekData] = useState<{ day: string; avgRate: number; totalRecords: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCharts = useCallback(async () => {
    if (!currentInstituteId) return;
    setLoading(true);
    try {
      // Load today's data
      const today = new Date().toISOString().split('T')[0];
      const todayRes = await adminAttendanceApi.getInstituteAttendance(
        currentInstituteId,
        { startDate: today, endDate: today, limit: 500 },
        { ttl: 60 }
      );
      const todayRecords = todayRes?.data || [];
      setTodayStats({
        present: todayRecords.filter(r => r.status === 'present').length,
        absent: todayRecords.filter(r => r.status === 'absent').length,
        late: todayRecords.filter(r => r.status === 'late').length,
        left: todayRecords.filter(r => ['left', 'left_early', 'left_lately'].includes(r.status)).length,
        total: todayRecords.length,
      });

      // Load last 4 weeks for day-of-week analysis
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 28);
      const records = await adminAttendanceApi.getInstituteAttendanceRange(
        currentInstituteId,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
        { ttl: 300 }
      );

      // Day of week analysis
      const dayMap = new Map<number, { present: number; total: number }>();
      for (const r of records) {
        const d = new Date(r.date || r.markedAt?.split('T')[0] || '');
        const day = d.getDay();
        if (!dayMap.has(day)) dayMap.set(day, { present: 0, total: 0 });
        const s = dayMap.get(day)!;
        s.total++;
        if (r.status === 'present') s.present++;
      }
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dowData = [1, 2, 3, 4, 5].map(d => ({
        day: dayNames[d],
        avgRate: dayMap.has(d) && dayMap.get(d)!.total > 0
          ? Math.round((dayMap.get(d)!.present / dayMap.get(d)!.total) * 1000) / 10
          : 0,
        totalRecords: dayMap.get(d)?.total || 0,
      }));
      setDayOfWeekData(dowData);

    } catch (e: any) {
      toast.error(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [currentInstituteId]);

  useEffect(() => { loadCharts(); }, [loadCharts]);

  const todayRate = todayStats && todayStats.total > 0
    ? Math.round((todayStats.present / todayStats.total) * 1000) / 10
    : 0;

  const pieData = todayStats ? [
    { name: 'Present', value: todayStats.present, color: CHART_COLORS.present },
    { name: 'Absent', value: todayStats.absent, color: CHART_COLORS.absent },
    { name: 'Late', value: todayStats.late, color: CHART_COLORS.late },
    { name: 'Left', value: todayStats.left, color: CHART_COLORS.left },
  ].filter(d => d.value > 0) : [];

  const getHeatColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    if (rate >= 85) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    if (rate >= 80) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  return (
    <div className="space-y-4">
      {/* Today's Live Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Today's Live Attendance
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadCharts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : todayStats ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Pie Chart */}
              <div className="w-48 h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      labelLine={false}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-[115px]">
                  <div className="text-2xl font-bold text-foreground">{todayRate}%</div>
                  <div className="text-xs text-muted-foreground">Attendance</div>
                </div>
                <div className="h-[75px]" /> {/* spacer */}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                  <div className="text-xl font-bold text-emerald-600">{todayStats.present}</div>
                  <div className="text-xs text-muted-foreground">🟢 Present</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                  <div className="text-xl font-bold text-red-500">{todayStats.absent}</div>
                  <div className="text-xs text-muted-foreground">🔴 Absent</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                  <div className="text-xl font-bold text-amber-600">{todayStats.late}</div>
                  <div className="text-xs text-muted-foreground">🟡 Late</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xl font-bold text-foreground">{todayStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Records</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No attendance data for today</p>
          )}
        </CardContent>
      </Card>

      {/* Day of Week Analysis */}
      {dayOfWeekData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Day-of-Week Analysis (Last 4 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Heatmap Bars */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {dayOfWeekData.map(d => (
                <div key={d.day} className={`p-3 rounded-lg text-center ${getHeatColor(d.avgRate)}`}>
                  <div className="text-xs font-semibold">{d.day}</div>
                  <div className="text-lg font-bold">{d.avgRate}%</div>
                  <div className="text-xs opacity-75">{d.totalRecords} records</div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="avgRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {dayOfWeekData.map((entry, i) => (
                    <Cell key={i} fill={entry.avgRate >= 85 ? 'hsl(var(--chart-1))' : entry.avgRate >= 75 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-2))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardCharts;
