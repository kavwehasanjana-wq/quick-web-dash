import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ValidatedInput";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPhoneOTP, verifyPhoneOTP, requestEmailOTP, verifyEmailOTP } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, UserCheck, SkipForward, ArrowRight, CheckCircle2, Mail, Phone, ArrowLeft, Loader2, HeartCrack, Scale, Users, Home, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Session storage key for registered parents
const REGISTERED_PARENTS_KEY = "suraksha_registered_parents";

interface RegisteredParent {
  id: string;
  type: "Father" | "Mother" | "Guardian";
  name: string;
  timestamp: number;
}

// Helper to get registered parents from session storage
const getRegisteredParents = (): RegisteredParent[] => {
  try {
    const stored = sessionStorage.getItem(REGISTERED_PARENTS_KEY);
    if (stored) {
      const parents = JSON.parse(stored);
      // Filter out entries older than 24 hours
      const now = Date.now();
      return parents.filter((p: RegisteredParent) => now - p.timestamp < 24 * 60 * 60 * 1000);
    }
  } catch (e) {
    console.error("Error reading session storage:", e);
  }
  return [];
};

// Helper to save a registered parent to session storage
export const saveRegisteredParent = (parent: RegisteredParent) => {
  try {
    const existing = getRegisteredParents();
    // Remove any existing entry of the same type
    const filtered = existing.filter(p => p.type !== parent.type);
    filtered.push(parent);
    sessionStorage.setItem(REGISTERED_PARENTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error saving to session storage:", e);
  }
};

interface ParentExistsFormProps {
  parentType: "Father" | "Mother" | "Guardian";
  onExistingParent: (id: string, phoneNumber: string) => void;
  onNewParent: (phoneNumber: string, email: string) => void;
  onSkip?: () => void;
  canSkip?: boolean;
  isStudentForm?: boolean;
  // For guardian - to check if father/mother were added
  hasFather?: boolean;
  hasMother?: boolean;
}

type Step = "choose" | "existing" | "new-verify" | "new-email" | "skip-reason";

// Skip reasons for each parent type
const getSkipReasons = (parentType: "Father" | "Mother" | "Guardian", hasFather?: boolean, hasMother?: boolean) => {
  if (parentType === "Father") {
    return [
      { id: "deceased", icon: HeartCrack, label: "Father is no longer with us", description: "My father has passed away" },
      { id: "absent", icon: Home, label: "Father is not present", description: "Father is not part of family life" },
      { id: "divorced", icon: Scale, label: "Parents are legally separated", description: "Father has no custody or involvement" },
      { id: "unknown", icon: Users, label: "Father information unknown", description: "I don't have father's information" },
    ];
  }
  
  if (parentType === "Mother") {
    return [
      { id: "deceased", icon: HeartCrack, label: "Mother is no longer with us", description: "My mother has passed away" },
      { id: "absent", icon: Home, label: "Mother is not present", description: "Mother is not part of family life" },
      { id: "divorced", icon: Scale, label: "Parents are legally separated", description: "Mother has no custody or involvement" },
      { id: "unknown", icon: Users, label: "Mother information unknown", description: "I don't have mother's information" },
    ];
  }
  
  // Guardian
  const reasons = [
    { id: "parents_added", icon: Users, label: "Already added parents", description: "Father and/or mother are the primary caregivers" },
    { id: "living_with_parents", icon: Home, label: "Living with parents", description: "No separate guardian needed" },
    { id: "parent_is_guardian", icon: Shield, label: "Parent is my guardian", description: "Father or mother is also my legal guardian" },
  ];
  
  return reasons;
};

export const ParentExistsForm = ({
  parentType,
  onExistingParent,
  onNewParent,
  onSkip,
  canSkip = true,
  isStudentForm = false,
  hasFather = false,
  hasMother = false,
}: ParentExistsFormProps) => {
  const [step, setStep] = useState<Step>("choose");
  const [parentId, setParentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSkipReason, setSelectedSkipReason] = useState("");
  const [showSkipReasons, setShowSkipReasons] = useState(false);
  
  // Recently registered parent from current session
  const [recentParent, setRecentParent] = useState<RegisteredParent | null>(null);
  
  // OTP states
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [phoneOTPCode, setPhoneOTPCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhoneOTP, setSendingPhoneOTP] = useState(false);
  const [verifyingPhoneOTP, setVerifyingPhoneOTP] = useState(false);
  
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTPCode, setEmailOTPCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
  const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);
  
  // Error dialog states
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorUserId, setErrorUserId] = useState("");

  // Check for recently registered parent of same type on mount
  useEffect(() => {
    const registeredParents = getRegisteredParents();
    const matchingParent = registeredParents.find(p => p.type === parentType);
    if (matchingParent) {
      setRecentParent(matchingParent);
    }
  }, [parentType]);

  const handleSendPhoneOTP = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    setSendingPhoneOTP(true);
    try {
      const response = await requestPhoneOTP(phoneNumber);
      toast.success(response.message);
      setPhoneOTPSent(true);
    } catch (error: any) {
      const message = error?.message || "Failed to send OTP";
      
      if (error?.statusCode === 409) {
        setErrorMessage(message);
        setErrorUserId(error?.userId || '');
        setShowErrorDialog(true);
      } else {
        toast.error(message);
      }
    } finally {
      setSendingPhoneOTP(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (phoneOTPCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    setVerifyingPhoneOTP(true);
    try {
      const response = await verifyPhoneOTP(phoneNumber, phoneOTPCode);
      toast.success(response.message);
      setPhoneVerified(true);
      // Auto-advance to email step
      setTimeout(() => setStep("new-email"), 500);
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setVerifyingPhoneOTP(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }
    
    setSendingEmailOTP(true);
    try {
      const response = await requestEmailOTP(email);
      toast.success(response.message);
      setEmailOTPSent(true);
    } catch (error: any) {
      const message = error?.message || "Failed to send verification code";
      
      if (error?.statusCode === 409) {
        setErrorMessage(message);
        setErrorUserId(error?.userId || '');
        setShowErrorDialog(true);
      } else {
        toast.error(message);
      }
    } finally {
      setSendingEmailOTP(false);
    }
  };
  
  const handleUseExistingUser = () => {
    setStep("existing");
    setParentId(errorUserId);
    setPhoneNumber("");
    setEmail("");
    setPhoneOTPSent(false);
    setPhoneOTPCode("");
    setPhoneVerified(false);
    setEmailOTPSent(false);
    setEmailOTPCode("");
    setEmailVerified(false);
    setShowErrorDialog(false);
    setErrorMessage("");
    setErrorUserId("");
  };

  const handleVerifyEmailOTP = async () => {
    if (emailOTPCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    setVerifyingEmailOTP(true);
    try {
      const response = await verifyEmailOTP(email, emailOTPCode);
      toast.success(response.message);
      setEmailVerified(true);
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  const handleContinue = () => {
    onNewParent(phoneNumber, email);
    // Reset form
    setPhoneNumber("");
    setEmail("");
    setStep("choose");
    setPhoneOTPSent(false);
    setPhoneOTPCode("");
    setPhoneVerified(false);
    setEmailOTPSent(false);
    setEmailOTPCode("");
    setEmailVerified(false);
  };

  const handleExistingContinue = () => {
    onExistingParent(parentId, "");
    setParentId("");
    setStep("choose");
  };

  const handleUseRecentParent = () => {
    if (recentParent) {
      onExistingParent(recentParent.id, "");
      setStep("choose");
    }
  };

  const handleBack = () => {
    if (step === "new-email") {
      setStep("new-verify");
    } else if (step === "skip-reason") {
      setStep("choose");
      setSelectedSkipReason("");
    } else {
      setStep("choose");
    }
  };

  const handleSkipWithReason = () => {
    if (onSkip) {
      onSkip();
    }
    setSelectedSkipReason("");
    setStep("choose");
  };

  const handleSkipPhone = () => {
    if (isStudentForm) {
      setStep("new-email");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const skipReasons = getSkipReasons(parentType, hasFather, hasMother);

  return (
    <>
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Registered</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>{errorMessage}</div>
                {errorUserId && errorUserId !== '' && (
                  <div className="font-semibold text-foreground">Reference: {errorUserId}</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {errorUserId && errorUserId !== '' && (
              <AlertDialogAction onClick={handleUseExistingUser}>
                Use This Account
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Option */}
          {step === "choose" && (
            <motion.div
              key="choose"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                  Let's add {parentType.toLowerCase()} information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose the option that applies to you
                </p>
              </div>

              <div className="grid gap-3">
                {/* Option: Recently Registered (from current session) */}
                {recentParent && (
                  <Card 
                    className="cursor-pointer border-2 border-green-500/50 bg-green-50/50 dark:bg-green-950/20 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all"
                    onClick={handleUseRecentParent}
                  >
                    <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base sm:text-lg text-green-700 dark:text-green-400">
                          Use recently registered {parentType.toLowerCase()}
                        </h4>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">
                          {recentParent.name} • ID: {recentParent.id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered in this session - no need to re-enter details
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-green-600 shrink-0" />
                    </CardContent>
                  </Card>
                )}

                {/* Option: Already Registered */}
                <Card 
                  className="cursor-pointer border-2 hover:border-primary/50 hover:bg-accent/50 transition-all"
                  onClick={() => setStep("existing")}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg">Already have an account</h4>
                      <p className="text-sm text-muted-foreground">
                        {parentType} was registered before (I have the account number)
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>

                {/* Option: Create New */}
                <Card 
                  className="cursor-pointer border-2 hover:border-primary/50 hover:bg-accent/50 transition-all"
                  onClick={() => setStep("new-verify")}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg">Register new {parentType.toLowerCase()}</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a new profile for {parentType.toLowerCase()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>

                {/* Option: Skip with Reasons */}
                {onSkip && canSkip && (
                  <div className="space-y-2">
                    <Card 
                      className="cursor-pointer border-2 border-dashed hover:border-muted-foreground/50 hover:bg-accent/30 transition-all"
                      onClick={() => setShowSkipReasons(!showSkipReasons)}
                    >
                      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <SkipForward className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base sm:text-lg text-muted-foreground">
                            Skip {parentType.toLowerCase()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            I cannot add {parentType.toLowerCase()} information
                          </p>
                        </div>
                        {showSkipReasons ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                      </CardContent>
                    </Card>

                    {/* Skip Reasons Expanded */}
                    <AnimatePresence>
                      {showSkipReasons && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 border-l-2 border-muted ml-6 space-y-2">
                            <p className="text-sm text-muted-foreground py-2">
                              Please select a reason:
                            </p>
                            {skipReasons.map((reason) => {
                              const Icon = reason.icon;
                              return (
                                <Card
                                  key={reason.id}
                                  className={`cursor-pointer border transition-all ${
                                    selectedSkipReason === reason.id
                                      ? "border-primary bg-primary/5"
                                      : "hover:border-muted-foreground/30 hover:bg-accent/20"
                                  }`}
                                  onClick={() => setSelectedSkipReason(reason.id)}
                                >
                                  <CardContent className="flex items-center gap-3 p-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                      selectedSkipReason === reason.id
                                        ? "bg-primary/20"
                                        : "bg-muted"
                                    }`}>
                                      <Icon className={`w-4 h-4 ${
                                        selectedSkipReason === reason.id
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${
                                        selectedSkipReason === reason.id
                                          ? "text-primary"
                                          : ""
                                      }`}>
                                        {reason.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {reason.description}
                                      </p>
                                    </div>
                                    {selectedSkipReason === reason.id && (
                                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                            
                            <Button
                              onClick={handleSkipWithReason}
                              disabled={!selectedSkipReason}
                              variant="outline"
                              className="w-full mt-3"
                            >
                              Continue without {parentType.toLowerCase()}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2a: Existing Parent */}
          {step === "existing" && (
            <motion.div
              key="existing"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>

              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Enter {parentType}'s Account Number</CardTitle>
                  <CardDescription>
                    Enter the registration number provided during previous registration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-id">Account Number</Label>
                    <ValidatedInput
                      id="parent-id"
                      type="number"
                      placeholder="Enter number (e.g., 12345)"
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="text-center text-lg"
                      onKeyDown={(e) => {
                        if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleExistingContinue} 
                    disabled={!parentId}
                    className="w-full"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2b: Phone Verification */}
          {step === "new-verify" && (
            <motion.div
              key="new-verify"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>

              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle>
                    {isStudentForm ? "Phone Number (Optional)" : "Verify Phone Number"}
                  </CardTitle>
                  <CardDescription>
                    {isStudentForm 
                      ? "Add a phone number if you have one, or skip to continue"
                      : "We'll send a verification code to this number"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!phoneVerified ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2">
                          <PhoneInput
                            id="phone"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            disabled={phoneOTPSent}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {!phoneOTPSent ? (
                        <div className="space-y-3">
                          <Button 
                            onClick={handleSendPhoneOTP}
                            disabled={!phoneNumber || phoneNumber === '+94' || phoneNumber.replace(/\D/g, '').length < 11 || sendingPhoneOTP}
                            className="w-full"
                            size="lg"
                          >
                            {sendingPhoneOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Verification Code
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                          {isStudentForm && (
                            <Button 
                              variant="ghost" 
                              onClick={handleSkipPhone}
                              className="w-full text-muted-foreground"
                            >
                              Skip phone, continue with email only
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Code sent to {phoneNumber}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Enter the 6-digit code</Label>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={phoneOTPCode}
                                onChange={setPhoneOTPCode}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </div>
                          <Button
                            onClick={handleVerifyPhoneOTP}
                            disabled={phoneOTPCode.length !== 6 || verifyingPhoneOTP}
                            className="w-full"
                            size="lg"
                          >
                            {verifyingPhoneOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify & Continue"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="font-medium text-green-600 dark:text-green-400">Phone Verified!</p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">{phoneNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Email Verification */}
          {step === "new-email" && (
            <motion.div
              key="new-email"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${phoneVerified ? 'bg-green-500' : 'bg-muted'}`} />
                <div className="w-8 h-0.5 bg-muted" />
                <div className={`w-3 h-3 rounded-full ${emailVerified ? 'bg-green-500' : 'bg-primary'}`} />
              </div>

              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle>Verify Email Address</CardTitle>
                  <CardDescription>
                    We'll send a verification code to your email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!emailVerified ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <ValidatedInput
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={emailOTPSent}
                        />
                      </div>

                      {!emailOTPSent ? (
                        <Button 
                          onClick={handleSendEmailOTP}
                          disabled={!email || sendingEmailOTP}
                          className="w-full"
                          size="lg"
                        >
                          {sendingEmailOTP ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Verification Code
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Code sent to {email}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Enter the 6-digit code</Label>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={emailOTPCode}
                                onChange={setEmailOTPCode}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </div>
                          <Button
                            onClick={handleVerifyEmailOTP}
                            disabled={emailOTPCode.length !== 6 || verifyingEmailOTP}
                            className="w-full"
                            size="lg"
                          >
                            {verifyingEmailOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify Email"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-medium text-green-600 dark:text-green-400">Email Verified!</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">{email}</p>
                      </div>
                      <Button 
                        onClick={handleContinue}
                        className="w-full"
                        size="lg"
                      >
                        Continue to Fill Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};