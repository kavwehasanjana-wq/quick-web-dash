import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { transportApi, TransportEnrollment } from '@/api/transport.api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import PageContainer from '@/components/layout/PageContainer';
import EnrollTransportDialog from '@/components/forms/EnrollTransportDialog';

const Transport: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEnrollments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await transportApi.getStudentEnrollments(user.id.toString());
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Failed to load transport enrollments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load transport enrollments';
      
      if (errorMessage.includes('404') || errorMessage.includes('Cannot GET')) {
        toast.error('Transport endpoint not available. Please ensure the attendance backend is running and the endpoint exists.');
      } else {
        toast.error('Failed to load transport enrollments. Please check your attendance backend configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSuccess = () => {
    loadEnrollments();
  };

  const handleSelectTransport = (enrollment: TransportEnrollment) => {
    // Navigate to transport attendance page with state
    navigate(`/transport-attendance`, {
      state: { 
        transport: {
          id: enrollment.id,
          vehicleNumber: enrollment.cardId || `Bookhire-${enrollment.bookhireId}`,
          bookhireId: enrollment.bookhireId
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (enrollments.length === 0 && !loading) {
    return (
      <AppLayout currentPage="transport">
        <PageContainer>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Transport</h1>
                <p className="text-muted-foreground">
                  View and manage your transport enrollments
                </p>
              </div>
              <EnrollTransportDialog 
                studentId={user?.id?.toString() || ''} 
                onEnrollmentSuccess={handleEnrollmentSuccess}
              />
            </div>
            
            <Button onClick={loadEnrollments} disabled={loading}>
              {loading ? 'Loading...' : 'Load Transport Enrollments'}
            </Button>

            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="max-w-md">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Transport Enrollments</h3>
                  <p className="text-muted-foreground">
                    Click the button above to load your transport enrollments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout currentPage="transport">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transport enrollments...</p>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="transport">
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Transport</h1>
              <p className="text-muted-foreground">
                View and manage your transport enrollments
              </p>
            </div>
            <EnrollTransportDialog 
              studentId={user?.id?.toString() || ''} 
              onEnrollmentSuccess={handleEnrollmentSuccess}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Truck className="h-8 w-8 text-primary" />
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  {enrollment.imageUrl && (
                    <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-muted">
                      <img 
                        src={enrollment.imageUrl} 
                        alt={enrollment.bookhireTitle || 'Transport vehicle'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardTitle className="text-xl">
                    {enrollment.bookhireTitle || 'Transport Service'}
                  </CardTitle>
                  <CardDescription>
                    {enrollment.vehicleNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrollment.pickupLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Pickup</p>
                        <p className="text-muted-foreground">{enrollment.pickupLocation}</p>
                      </div>
                    </div>
                  )}

                  {enrollment.dropoffLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">Drop-off</p>
                        <p className="text-muted-foreground">{enrollment.dropoffLocation}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <span className="font-medium">Start Date: </span>
                      <span className="text-muted-foreground">
                        {new Date(enrollment.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {enrollment.monthlyFee > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Monthly Fee:</span>
                      <span className="text-lg font-bold text-primary">
                        LKR {enrollment.monthlyFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectTransport(enrollment)}
                  >
                    Select Transport
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default Transport;
