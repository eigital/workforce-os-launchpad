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
      <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-md border border-border/50 shadow-elegant animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">Get started today</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create your account and streamline your business operations
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SignUpForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}