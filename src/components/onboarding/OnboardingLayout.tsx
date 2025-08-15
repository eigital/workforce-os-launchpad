import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export default function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps, 
  title, 
  subtitle 
}: OnboardingLayoutProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const navigate = useNavigate();
  const progressValue = (currentStep / totalSteps) * 100;

  const handleExitConfirm = () => {
    setShowExitDialog(false);
    navigate('/dashboard');
    toast({
      title: 'Onboarding paused',
      description: 'You can complete your setup anytime from your dashboard.',
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40" />
      
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md sm:max-w-[480px] mx-auto">
          {/* Progress bar - positioned above the modal */}
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/70">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs text-white/70">
                {Math.round(progressValue)}% complete
              </span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>

          {/* Modal content */}
          <div className="bg-background/95 backdrop-blur-lg border border-border/30 rounded-lg shadow-elegant animate-scale-in relative">
            {/* Close button */}
            <button
              onClick={() => setShowExitDialog(true)}
              className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="text-center pt-6 pb-4 px-6">
              <h1 className="text-xl font-semibold mb-1">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="sm:max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Exit onboarding?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Your progress will be saved. You can complete the setup anytime from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-sm">Continue setup</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitConfirm} className="text-sm">
              Exit to dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}