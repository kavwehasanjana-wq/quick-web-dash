import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Users, 
  CheckCircle, 
  Calendar,
  Clock,
  UserCheck,
  Camera,
  Edit3
} from 'lucide-react';

interface AttendanceMarkingProps {
  onNavigate?: (page: string) => void;
}

const AttendanceMarking = ({ onNavigate }: AttendanceMarkingProps) => {
  const { selectedInstitute, selectedSubject, user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Check if user has permission to mark attendance - Institute Admin only
  const hasPermission = user?.userType === 'INSTITUTE_ADMIN';

  const attendanceMethods = [
    {
      id: 'qr',
      title: 'QR Code Attendance',
      description: 'Generate QR code for students to scan and mark attendance',
      icon: QrCode,
      color: 'blue',
      availability: hasPermission ? 'Available' : 'Access Denied',
      features: ['Real camera scanning', 'Automatic detection', 'Real-time updates'],
      page: 'qr-attendance',
      disabled: !hasPermission
    },
    {
      id: 'manual',
      title: 'Manual Attendance',
      description: 'Manually mark attendance for each student',
      icon: Edit3,
      color: 'green',
      availability: hasPermission ? 'Available' : 'Access Denied',
      features: ['Individual control', 'Detailed notes', 'Flexible marking'],
      disabled: !hasPermission
    },
    {
      id: 'tick',
      title: 'Tick Mark Attendance',
      description: 'Simple tick-based attendance marking system',
      icon: CheckCircle,
      color: 'purple',
      availability: hasPermission && selectedInstitute ? 'Available' : hasPermission ? 'Select institute first' : 'Access Denied',
      features: ['Simple interface', 'Quick marking', 'Institute-level only'],
      disabled: !hasPermission || !selectedInstitute
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    const method = attendanceMethods.find(m => m.id === methodId);
    
    if (method?.disabled) {
      return;
    }

    setSelectedMethod(methodId);
    
    if (method?.page && onNavigate) {
      onNavigate(method.page);
    } else {
      console.log('Selected attendance method:', methodId);
    }
  };

  const recentSessions = [
    {
      id: '1',
      subject: 'Mathematics',
      institute: selectedInstitute?.name || 'Sample Institute',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      present: 25,
      total: 28,
      status: 'Completed'
    },
    {
      id: '2',
      subject: selectedSubject?.name || 'Physics',
      institute: selectedInstitute?.name || 'Sample Institute',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      present: 20,
      total: 23,
      status: 'In Progress'
    }
  ];

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mark Attendance
          </h1>
          <p className="text-red-600 dark:text-red-400">
            Access Denied: This feature is only available for Institute Admins.
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
              Insufficient Permissions
            </h3>
            <p className="text-red-600 dark:text-red-400">
              You need to be an Institute Admin to access attendance marking features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mark Attendance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your preferred method to mark student attendance
        </p>
      </div>

      {/* Current Session Info */}
      {selectedInstitute && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Calendar className="h-5 w-5" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Institute</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{selectedInstitute.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Marker</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Time</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attendanceMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              method.disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
                : selectedMethod === method.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:border-blue-300'
            }`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                method.disabled ? 'bg-gray-100 dark:bg-gray-700' :
                method.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                method.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                <method.icon className={`h-8 w-8 ${
                  method.disabled ? 'text-gray-400' :
                  method.color === 'blue' ? 'text-blue-600' :
                  method.color === 'green' ? 'text-green-600' :
                  'text-purple-600'
                }`} />
              </div>
              <CardTitle className="text-xl">{method.title}</CardTitle>
              <CardDescription className="text-center">
                {method.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge 
                  variant={method.disabled ? 'secondary' : 'outline'}
                  className={method.disabled ? 'bg-red-100 text-red-700 border-red-200' : `border-${method.color}-200 text-${method.color}-700`}
                >
                  {method.availability}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Features:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        method.disabled ? 'bg-gray-400' : 'bg-blue-600'
                      }`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className={`w-full ${
                  method.disabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : method.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                      method.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={method.disabled}
              >
                {method.disabled ? 'Not Available' : 'Start Marking'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Attendance Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.subject} - {session.institute}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.date} at {session.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.present}/{session.total}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((session.present / session.total) * 100)}% Present
                    </p>
                  </div>
                  <Badge variant={session.status === 'Completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceMarking;
