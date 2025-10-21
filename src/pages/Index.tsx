import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import ApiService from '@/services/api';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-foreground">
            Welcome to LAAS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learning as a Service - Your comprehensive educational platform for modern learning experiences.
          </p>
          <Button 
            size="lg" 
            className="bg-admin hover:bg-admin/90 text-admin-foreground px-8 py-3 text-lg"
            onClick={() => navigate('/login')}
          >
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;