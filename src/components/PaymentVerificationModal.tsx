import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface Payment {
  id: string;
  userId: string;
  paymentAmount: string;
  paymentReference: string;
  status: string;
}

interface PaymentVerificationModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentVerificationModal({
  payment,
  isOpen,
  onClose,
  onSuccess
}: PaymentVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    subscriptionPlan: '',
    paymentValidityDays: 30,
    rejectionReason: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setIsLoading(true);
    try {
      const verificationData = {
        ...(formData.status && { status: formData.status }),
        ...(formData.subscriptionPlan && { subscriptionPlan: formData.subscriptionPlan }),
        ...(formData.paymentValidityDays && { paymentValidityDays: formData.paymentValidityDays }),
        ...(formData.rejectionReason && { rejectionReason: formData.rejectionReason }),
        ...(formData.notes && { notes: formData.notes })
      };

      await ApiService.verifyPayment(payment.id, verificationData);
      
      toast({
        title: "Payment verified successfully",
        description: "The payment status has been updated.",
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        status: '',
        subscriptionPlan: '',
        paymentValidityDays: 30,
        rejectionReason: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Failed to verify payment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Payment ID: #{payment.id} | User: {payment.userId} | Amount: ${parseFloat(payment.paymentAmount).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
            <Select
              value={formData.subscriptionPlan}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionPlan: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subscription plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">FREE</SelectItem>
                <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                <SelectItem value="TELEGRAM">TELEGRAM</SelectItem>
                <SelectItem value="EMAIL">EMAIL</SelectItem>
                <SelectItem value="PRO-WHATSAPP">PRO-WHATSAPP</SelectItem>
                <SelectItem value="PRO-SMS">PRO-SMS</SelectItem>
                <SelectItem value="PRO-TELEGRAM">PRO-TELEGRAM</SelectItem>
                <SelectItem value="PRO-EMAIL">PRO-EMAIL</SelectItem>
                <SelectItem value="DYNAMAD">DYNAMAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentValidityDays">Payment Validity (Days)</Label>
            <Input
              id="paymentValidityDays"
              type="number"
              value={formData.paymentValidityDays}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentValidityDays: parseInt(e.target.value) || 30 }))}
              min="1"
              max="365"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason (optional)</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter rejection reason if applicable..."
              value={formData.rejectionReason}
              onChange={(e) => setFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter verification notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}