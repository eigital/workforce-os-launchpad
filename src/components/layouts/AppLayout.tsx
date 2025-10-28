import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import CommunicationHeader from '@/components/communication/CommunicationHeader';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Navigate after successful sign out
      navigate('/', { replace: true });
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full perspective-3d preserve-3d">
        <AppSidebar />
        
        <main className="flex-1">
          {/* Header */}
          <header 
            className="h-16 border-b backdrop-blur-[12px] bg-white/[0.08] dark:bg-white/[0.08] border-white/[0.16] sticky top-0 z-40"
            style={{ transform: 'translateZ(48px)', transformStyle: 'preserve-3d' }}
          >
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                {title && (
                  <h1 className="text-xl font-semibold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CommunicationHeader />
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  <Settings className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="hidden md:inline-flex"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{signingOut ? "Signing out..." : "Sign Out"}</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}