import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SessionManager() {
  const { user } = useAuth();
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      // Check session expiry every minute
      const interval = setInterval(async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('session_expires_at, verification_required')
            .eq('id', user.id)
            .single();

          if (error) return;

          if (profile?.session_expires_at) {
            const expiryTime = new Date(profile.session_expires_at).getTime();
            const currentTime = Date.now();

            // If session has expired
            if (currentTime >= expiryTime) {
              // Update verification requirement
              await supabase
                .from('profiles')
                .update({ 
                  verification_required: true,
                  session_expires_at: null 
                })
                .eq('id', user.id);

              // Sign out user
              await supabase.auth.signOut();
              
              setShowSessionExpiredDialog(true);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Session check error:', error);
        }
      }, 60000); // Check every minute

      setSessionCheckInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        setSessionCheckInterval(null);
      }
    }
  }, [user]);

  const handleSessionExpiredClose = () => {
    setShowSessionExpiredDialog(false);
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <AlertDialog open={showSessionExpiredDialog} onOpenChange={setShowSessionExpiredDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired for security reasons. Please verify your email or phone number to continue using the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleSessionExpiredClose}>
            Return to Home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}