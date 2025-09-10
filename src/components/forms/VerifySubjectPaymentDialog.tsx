import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubjectPaymentSubmission } from '@/api/subjectPayments.api';

interface VerifySubjectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubjectPaymentSubmission | null;
  onVerify: (status: 'VERIFIED' | 'REJECTED', rejectionReason?: string, notes?: string) => Promise<void>;
}

const VerifySubjectPaymentDialog = ({ open, onOpenChange, submission, onVerify }: VerifySubjectPaymentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    if (status === 'REJECTED' && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required when rejecting a submission",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onVerify(status, rejectionReason || undefined, notes || undefined);
      
      // Reset form
      setStatus('VERIFIED');
      setRejectionReason('');
      setNotes('');
    } catch (error) {
      console.error('Failed to verify submission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verify Payment Submission</DialogTitle>
        </DialogHeader>
        
        {/* Submission Details */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Submission Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span><strong>Submitter:</strong> {submission.submitterName || 'Unknown User'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span><strong>Amount:</strong> ₹{submission.paymentAmount ? parseFloat(submission.paymentAmount.toString()).toLocaleString() : '0'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span><strong>Method:</strong> {submission.paymentMethod}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span><strong>Transaction ID:</strong> {submission.transactionReference}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span><strong>Payment Date:</strong> {new Date(submission.paymentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {submission.paymentRemarks && (
            <div className="mt-3 p-2 bg-background rounded border">
              <p className="text-sm"><strong>Payment Remarks:</strong> {submission.paymentRemarks}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Verification Decision *</Label>
            <Select 
              value={status} 
              onValueChange={(value: 'VERIFIED' | 'REJECTED') => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFIED">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Verified</span>
                  </div>
                </SelectItem>
                <SelectItem value="REJECTED">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Rejected</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'REJECTED' && (
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (visible to the submitter)..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant={status === 'VERIFIED' ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : status === 'VERIFIED' ? 'Verify Submission' : 'Reject Submission'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VerifySubjectPaymentDialog;