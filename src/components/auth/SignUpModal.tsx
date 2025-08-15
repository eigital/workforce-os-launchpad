import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SignUpForm from '@/components/auth/SignUpForm';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[320px] bg-background/95 backdrop-blur-lg border border-border/30 shadow-elegant animate-scale-in p-4">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-lg font-semibold text-center">Get started today</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-xs">
            Create your account and streamline your business operations
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <SignUpForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}