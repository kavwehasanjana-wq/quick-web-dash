
import { useEffect } from "react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

import NotFound from "./pages/NotFound";
import Payments from "./pages/Payments";
import CreatePayment from "./pages/CreatePayment";
import PaymentSubmissions from "./pages/PaymentSubmissions";
import MySubmissions from "./pages/MySubmissions";
import InstitutePayments from "./pages/InstitutePayments";
import SubjectPayments from "./pages/SubjectPayments";
import SubjectSubmissions from "./pages/SubjectSubmissions";
import SubjectPaymentSubmissions from "./pages/SubjectPaymentSubmissions";
import PaymentSubmissionsPage from "./pages/PaymentSubmissionsPage";
import HomeworkSubmissions from "./pages/HomeworkSubmissions";
import HomeworkSubmissionDetails from "./pages/HomeworkSubmissionDetails";
import { AuthProvider } from "@/contexts/AuthContext";
import UpdateHomework from '@/pages/UpdateHomework';
import UpdateLecture from '@/pages/UpdateLecture';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Main Dashboard Route */}
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            
            {/* Institute Routes */}
            <Route path="/institutes" element={<Index />} />
            <Route path="/institutes/users" element={<Index />} />
            <Route path="/institutes/classes" element={<Index />} />
            
            {/* Organization Routes */}
            <Route path="/organizations" element={<Index />} />
            
            {/* User Management Routes */}
            <Route path="/users" element={<Index />} />
            <Route path="/students" element={<Index />} />
            <Route path="/unverified-students" element={<Index />} />
            <Route path="/enroll-class" element={<Index />} />
            <Route path="/enroll-subject" element={<Index />} />
            <Route path="/teachers" element={<Index />} />
            <Route path="/parents" element={<Index />} />
            
            {/* Academic Routes */}
            <Route path="/classes" element={<Index />} />
            <Route path="/subjects" element={<Index />} />
            <Route path="/grades" element={<Index />} />
            <Route path="/grading" element={<Index />} />
            
            {/* Attendance Routes */}
            <Route path="/attendance" element={<Index />} />
            <Route path="/my-attendance" element={<Index />} />
            <Route path="/daily-attendance" element={<Index />} />
            <Route path="/attendance-marking" element={<Index />} />
            <Route path="/attendance-markers" element={<Index />} />
            <Route path="/qr-attendance" element={<Index />} />
            <Route path="/rfid-attendance" element={<Index />} />
            
            {/* Academic Content Routes */}
            <Route path="/lectures" element={<Index />} />
            <Route path="/live-lectures" element={<Index />} />
            <Route path="/homework" element={<Index />} />
              <Route path="/homework/update/:homeworkId" element={<UpdateHomework />} />
              <Route path="/lecture/update/:lectureId" element={<UpdateLecture />} />
            <Route path="/homework-submissions/:homeworkId" element={<HomeworkSubmissions />} />
            <Route path="/homework/:homeworkId/submissions" element={<HomeworkSubmissionDetails />} />
            <Route path="/exams" element={<Index />} />
            <Route path="/results" element={<Index />} />
            
            {/* Selection Routes */}
            <Route path="/select-institute" element={<Index />} />
            <Route path="/select-class" element={<Index />} />
            <Route path="/select-subject" element={<Index />} />
            <Route path="/parent-children" element={<Index />} />
            
            {/* Parent Child Routes */}
            <Route path="/child-attendance" element={<Index />} />
            <Route path="/child-results" element={<Index />} />
            
            {/* Teacher Specific Routes */}
            <Route path="/teacher-students" element={<Index />} />
            <Route path="/teacher-homework" element={<Index />} />
            <Route path="/teacher-exams" element={<Index />} />
            <Route path="/teacher-lectures" element={<Index />} />
            
            {/* Settings and Profile Routes */}
            <Route path="/profile" element={<Index />} />
            <Route path="/settings" element={<Index />} />
            <Route path="/appearance" element={<Index />} />
            <Route path="/institute-details" element={<Index />} />
            <Route path="/gallery" element={<Index />} />
            
            {/* Payment Routes */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/create" element={<CreatePayment />} />
            <Route path="/payment-submissions/:paymentId" element={<PaymentSubmissions />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/institute-payments" element={<InstitutePayments />} />
            <Route path="/subject-payments" element={<SubjectPayments />} />
            <Route path="/subject-submissions" element={<SubjectSubmissions />} />
            <Route path="/subject-pay-submission" element={<SubjectPaymentSubmissions />} />
            <Route path="/payment-submissions" element={<PaymentSubmissionsPage />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
