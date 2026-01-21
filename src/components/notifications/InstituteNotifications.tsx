// src/components/notifications/InstituteNotifications.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, RefreshCw, Building2 } from 'lucide-react';
import { notificationApiService, Notification } from '@/services/notificationApiService';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface InstituteNotificationsProps {
  instituteId: string;
  instituteName?: string;
}

type FilterScope = 'ALL' | 'INSTITUTE' | 'CLASS' | 'SUBJECT';

/**
 * Institute Notifications Component
 * Shows INSTITUTE, CLASS, and SUBJECT scope notifications
 * when user has selected an institute
 */
export const InstituteNotifications: React.FC<InstituteNotificationsProps> = ({
  instituteId,
  instituteName,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterScope>('ALL');

  const loadNotifications = useCallback(async () => {
    if (!instituteId) return;
    
    try {
      setLoading(true);
      const result = await notificationApiService.getInstituteNotifications(
        instituteId,
        {
          page,
          limit: 10,
          scope: filter !== 'ALL' ? filter : undefined
        }
      );
      setNotifications(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [instituteId, page, filter]);

  const loadUnreadCount = useCallback(async () => {
    if (!instituteId) return;
    
    try {
      const result = await notificationApiService.getInstituteUnreadCount(instituteId);
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [instituteId]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApiService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!instituteId) return;
    
    try {
      await notificationApiService.markAllAsRead(instituteId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
    loadUnreadCount();
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterScope);
    setPage(1);
  };

  if (loading && notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Institute Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Institute Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {instituteName && (
          <p className="text-sm text-muted-foreground">{instituteName}</p>
        )}

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={handleFilterChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="INSTITUTE">Institute</TabsTrigger>
            <TabsTrigger value="CLASS">Class</TabsTrigger>
            <TabsTrigger value="SUBJECT">Subject</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {filter === 'ALL' 
                ? 'No notifications for this institute' 
                : `No ${filter.toLowerCase()} notifications`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
