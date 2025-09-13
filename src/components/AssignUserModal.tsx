import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface AssignUserModalProps {
  onUserAssigned: () => void;
}

export function AssignUserModal({ onUserAssigned }: AssignUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    instituteId: '',
    userId: '',
    userIdByInstitute: '',
    status: 'ACTIVE'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInstitutes();
      loadUsers();
    }
  }, [isOpen]);

  const loadInstitutes = async () => {
    try {
      const response = await ApiService.getInstitutes();
      setInstitutes(response.data);
    } catch (error) {
      toast({
        title: "Failed to load institutes",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Failed to load users",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instituteId || !formData.userId || !formData.userIdByInstitute) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.assignUserToInstitute(formData);
      toast({
        title: "User assigned successfully",
        description: "User has been assigned to the institute.",
      });
      
      setFormData({
        instituteId: '',
        userId: '',
        userIdByInstitute: '',
        status: 'ACTIVE'
      });
      setIsOpen(false);
      onUserAssigned();
    } catch (error) {
      toast({
        title: "Failed to assign user",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Assign User to Institute</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institute" className="text-foreground">Institute *</Label>
            <Select value={formData.instituteId} onValueChange={(value) => handleInputChange('instituteId', value)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Select an institute" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {institutes.map((institute) => (
                  <SelectItem key={institute.id} value={institute.id}>
                    {institute.name} ({institute.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId" className="text-foreground">User ID *</Label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userIdByInstitute" className="text-foreground">Institute User ID *</Label>
            <Input
              id="userIdByInstitute"
              placeholder="Enter institute-specific user ID"
              value={formData.userIdByInstitute}
              onChange={(e) => handleInputChange('userIdByInstitute', e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Assigning..." : "Assign User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}