import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ApiService from '@/services/api';

interface AssignRfidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignRfidModal({ isOpen, onClose, onSuccess }: AssignRfidModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    userRfid: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.userRfid) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiService.assignRfid(formData);
      toast.success('RFID assigned successfully');
      setFormData({ userId: '', userRfid: '' });
      onSuccess();
    } catch (error) {
      console.error('Error assigning RFID:', error);
      toast.error('Failed to assign RFID');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ userId: '', userRfid: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign RFID</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="Enter user ID"
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRfid">RFID Tag</Label>
            <Input
              id="userRfid"
              type="text"
              placeholder="Enter RFID tag (e.g., RFID123456789)"
              value={formData.userRfid}
              onChange={(e) => setFormData(prev => ({ ...prev, userRfid: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Assigning...' : 'Assign RFID'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}