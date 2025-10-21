import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transportApi, type TransportEnrollment } from '@/api/transport.api';

const ChildTransportPage = () => {
  const navigate = useNavigate();
  const { selectedChild, setSelectedTransport } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<TransportEnrollment[]>([]);

  const loadEnrollments = async () => {
    if (!selectedChild?.id) {
      toast({
        title: "No Child Selected",
        description: "Please select a child to view transport",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await transportApi.getStudentEnrollments(selectedChild.id, {
        page: 1,
        limit: 10
      });
      
      setEnrollments(response.data.enrollments);
      toast({
        title: "Success",
        description: `Loaded ${response.data.enrollments.length} enrollments`,
      });
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load transport enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleSelectTransport = (enrollment: TransportEnrollment) => {
    setSelectedTransport({
      id: enrollment.id,
      vehicleNumber: enrollment.vehicleNumber,
      bookhireId: enrollment.bookhireId
    });
    navigate('/transport-attendance');
  };

  return (
    <div className="min-h-screen space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Bus className="h-6 w-6" />
              Transport Information
            </CardTitle>
            <Button onClick={loadEnrollments} disabled={loading} size="sm">
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Load Enrollments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="relative flex flex-col rounded-xl bg-card shadow-lg">
                  <div className="relative mx-4 -mt-6 h-48 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                    {enrollment.imageUrl ? (
                      <img
                        src={enrollment.imageUrl}
                        alt={enrollment.bookhireTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bus className="h-8 w-8 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h5 className="mb-2 text-xl font-bold text-foreground line-clamp-2">
                        {enrollment.bookhireTitle}
                      </h5>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="text-sm bg-primary/10 text-primary border-primary/20 px-3 py-1">
                          {enrollment.vehicleNumber}
                        </Badge>
                        <Badge className={`text-sm px-3 py-1 ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4 flex-1 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="line-clamp-3">
                          <span className="font-semibold">Pickup: </span>
                          <span className="text-muted-foreground">{enrollment.pickupLocation || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-semibold">Monthly Fee:</span>
                        <span className="font-bold text-primary text-lg">
                          Rs. {enrollment.monthlyFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full text-base h-12 font-semibold" 
                      onClick={() => handleSelectTransport(enrollment)}
                    >
                      Select Transport
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Click "Load Enrollments" to view transport information
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildTransportPage;
