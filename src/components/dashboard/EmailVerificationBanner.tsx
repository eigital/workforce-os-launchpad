import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, X, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_verified_at')
        .eq('id', user.id)
        .single();

      if (error) return;

      const isEmailVerified = !!profile?.email_verified_at;
      setIsVerified(isEmailVerified);
      setIsVisible(!isEmailVerified);
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleSendVerification = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email and click the verification link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || isVerified) {
    return null;
  }

  return (
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 mb-6">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Email Verification Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Please verify your email address to secure your account and unlock all features.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendVerification}
            disabled={loading}
            className="bg-background border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            {loading ? 'Sending...' : 'Send Verification'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}