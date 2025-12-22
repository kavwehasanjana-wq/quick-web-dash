import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { SMSVerificationAction } from "@/lib/enums";
import { CheckCircle, XCircle } from "lucide-react";

interface SMSPayment {
  id: string;
  instituteId: string;
  requestedCredits: number;
  paymentAmount: string;
  [key: string]: any;
}

interface VerifySMSPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SMSPayment | null;
  onSuccess: () => void;
}

export function VerifySMSPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: VerifySMSPaymentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [creditsToGrant, setCreditsToGrant] = useState<number>(1000);
  const [adminNotes, setAdminNotes] = useState<string>("");

  const handleSubmit = async (action: string) => {
    if (!payment) return;

    setIsLoading(true);
    try {
      await api.verifySMSPayment(payment.id, {
        action,
        creditsToGrant: action === SMSVerificationAction.APPROVE ? creditsToGrant : 0,
        adminNotes: adminNotes || (action === SMSVerificationAction.APPROVE ? "Payment verified successfully" : "Payment rejected"),
      });

      toast({
        title: "Success",
        description: action === SMSVerificationAction.APPROVE 
          ? `Payment approved and ${creditsToGrant} credits granted` 
          : "Payment rejected",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to verify SMS payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCreditsToGrant(1000);
    setAdminNotes("");
  };

  // Update credits when payment changes
  if (payment && creditsToGrant === 1000 && payment.requestedCredits) {
    setCreditsToGrant(payment.requestedCredits);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify SMS Payment #{payment?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Institute ID:</span>
              <p className="font-medium">{payment?.instituteId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium">Rs. {payment?.paymentAmount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Requested Credits:</span>
              <p className="font-medium">{payment?.requestedCredits}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditsToGrant">Credits to Grant</Label>
            <Input
              id="creditsToGrant"
              type="number"
              min={0}
              value={creditsToGrant}
              onChange={(e) => setCreditsToGrant(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add verification notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={() => handleSubmit(SMSVerificationAction.REJECT)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={() => handleSubmit(SMSVerificationAction.APPROVE)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
