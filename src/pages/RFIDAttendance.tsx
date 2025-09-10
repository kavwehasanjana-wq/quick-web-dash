import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Smartphone, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const RFIDAttendance = () => {
  const { selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    // Show QR code for RFID/NFC attendance
    toast({
      title: "RFID/NFC Attendance",
      description: "Use your RFID/NFC card reader to scan student cards",
    });
  }, [toast]);

  const handleBack = () => {
    window.history.back();
  };

  const startNFCScanning = () => {
    setIsScanning(true);
    toast({
      title: "NFC Scanner Active",
      description: "Tap student cards on your NFC reader",
    });
  };

  const stopNFCScanning = () => {
    setIsScanning(false);
    toast({
      title: "NFC Scanner Stopped",
      description: "Scanner has been deactivated",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              RFID/NFC Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Scan RFID cards or NFC tags to mark student attendance
            </p>
          </div>
        </div>

        {/* Current Selection */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100 text-lg">
              <Smartphone className="h-5 w-5" />
              Current Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Institute: </span>
              <span className="text-green-900 dark:text-green-100">{selectedInstitute?.name}</span>
            </div>
          </CardContent>
        </Card>

        {/* RFID/NFC Scanner Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-xl">RFID/NFC Scanner</CardTitle>
                <CardDescription>
                  Use your device's NFC capability or external RFID reader
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scanner Controls */}
            <div className="text-center space-y-4">
              {!isScanning ? (
                <Button 
                  onClick={startNFCScanning}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Start NFC Scanner
                </Button>
              ) : (
                <Button 
                  onClick={stopNFCScanning}
                  variant="destructive"
                  size="lg"
                >
                  Stop Scanner
                </Button>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isScanning 
                  ? "Scanner is active. Tap student cards to mark attendance."
                  : "Click to activate NFC scanner for student card reading."
                }
              </p>
            </div>

            {/* QR Code Display */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                QR Code for RFID/NFC Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Scan this QR code with your RFID/NFC reader device to configure attendance marking
              </p>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  {window.location.origin}/api/attendance/mark-by-card
                </code>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Instructions:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Ensure your RFID/NFC reader is connected and configured</li>
                <li>• Use the QR code above to configure your reader device</li>
                <li>• Students should tap their cards on the reader</li>
                <li>• Attendance will be marked automatically upon successful scan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RFIDAttendance;