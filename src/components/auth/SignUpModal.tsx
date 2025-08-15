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
      <DialogContent className="sm:max-w-[380px] max-h-[80vh] overflow-y-auto bg-background/80 backdrop-blur-lg border border-border/30 shadow-elegant animate-scale-in">
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="text-xl font-bold text-center">Get started today</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Create your account and streamline your business operations
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3">
          <SignUpForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}