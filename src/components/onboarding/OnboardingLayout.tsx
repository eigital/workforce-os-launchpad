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
    try {
      navigate('/dashboard', { replace: true });
      toast({
        title: 'Onboarding paused',
        description: 'You can complete your setup anytime from your dashboard.',
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home page if dashboard navigation fails
      navigate('/', { replace: true });
      toast({
        title: 'Redirected to home',
        description: 'Please sign in again to access your dashboard.',
      });
    }
  };

  return (
    <>
      {/* Dashboard background - show behind modal */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Dashboard content placeholder/blur */}
        <div className="min-h-screen">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold text-primary">WorkFlow</h1>
                </div>
                <div className="text-sm text-muted-foreground">Setting up your workspace...</div>
              </div>
            </div>
          </header>
          
          {/* Main content area - blurred */}
          <main className="container mx-auto px-4 py-8 filter blur-sm opacity-30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-2 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Glass effect overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-[95vw] sm:max-w-[520px] lg:max-w-[600px] mx-auto h-fit max-h-[90vh] flex flex-col">
          {/* Progress bar - positioned above the modal */}
          <div className="mb-3 px-1 flex-shrink-0">
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

          {/* Modal content - Glass effect */}
          <div className="bg-background/70 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl shadow-black/25 animate-scale-in relative ring-1 ring-white/10 flex flex-col min-h-0">
            {/* Close button */}
            <button
              onClick={() => setShowExitDialog(true)}
              className="absolute right-3 top-3 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header - Sticky */}
            <div className="text-center pt-4 pb-3 px-4 sm:px-6 flex-shrink-0 bg-background/70 backdrop-blur-xl rounded-t-lg">
              <h1 className="text-lg sm:text-xl font-semibold mb-1">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-xs sm:text-sm">{subtitle}</p>
              )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="sm:max-w-[320px] bg-background/95 backdrop-blur-xl border border-white/20">
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