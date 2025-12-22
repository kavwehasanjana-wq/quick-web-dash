import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { PaymentStatus, SubscriptionPlan } from "@/lib/enums";
import { CheckCircle, XCircle } from "lucide-react";

interface Payment {
  id: string;
  userId: string;
  paymentAmount: string;
  status: string;
  [key: string]: any;
}

interface VerifySystemPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onSuccess: () => void;
}

export function VerifySystemPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: VerifySystemPaymentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>(PaymentStatus.VERIFIED);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(SubscriptionPlan.PRO_WHATSAPP);
  const [paymentValidityDays, setPaymentValidityDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = async (actionStatus: string) => {
    if (!payment) return;

    setIsLoading(true);
    try {
      await api.verifyPayment(payment.id, {
        status: actionStatus,
        subscriptionPlan,
        paymentValidityDays,
        notes: notes || (actionStatus === PaymentStatus.VERIFIED ? "Payment verified successfully" : "Payment rejected"),
      });

      toast({
        title: "Success",
        description: actionStatus === PaymentStatus.VERIFIED 
          ? "Payment verified successfully" 
          : "Payment rejected",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to verify payment:", error);
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
    setStatus(PaymentStatus.VERIFIED);
    setSubscriptionPlan(SubscriptionPlan.PRO_WHATSAPP);
    setPaymentValidityDays(30);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Payment #{payment?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">User ID:</span>
              <p className="font-medium">{payment?.userId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium">Rs. {payment?.paymentAmount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
            <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SubscriptionPlan).map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validityDays">Validity Days</Label>
            <Input
              id="validityDays"
              type="number"
              min={1}
              value={paymentValidityDays}
              onChange={(e) => setPaymentValidityDays(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add verification notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={() => handleSubmit(PaymentStatus.REJECTED)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={() => handleSubmit(PaymentStatus.VERIFIED)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
