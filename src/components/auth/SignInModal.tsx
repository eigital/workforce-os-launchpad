import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SignInForm from '@/components/auth/SignInForm';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[280px] bg-background/95 backdrop-blur-lg border border-border/30 shadow-elegant animate-scale-in p-3">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-lg font-semibold text-center">Welcome back</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-xs">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <SignInForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}