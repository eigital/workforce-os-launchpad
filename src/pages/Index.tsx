import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import AllInOneAuthModal from "@/components/auth/AllInOneAuthModal";


const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleOpenSignUp = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleModeSwitch = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 perspective-3d preserve-3d">
      <Navigation
        user={user}
        onOpenSignUp={handleOpenSignUp}
        onOpenSignIn={handleOpenSignIn}
      />
      <Hero onOpenSignUp={handleOpenSignUp} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
      
      <AllInOneAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};

export default Index;
