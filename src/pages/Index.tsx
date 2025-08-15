import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import SignUpModal from "@/components/auth/SignUpModal";
import SignInModal from "@/components/auth/SignInModal";

const Index = () => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Listen for custom event to switch from sign in to sign up
  useEffect(() => {
    const handleOpenSignUp = () => {
      setIsSignInModalOpen(false);
      setIsSignUpModalOpen(true);
    };

    window.addEventListener('openSignUp', handleOpenSignUp);
    return () => window.removeEventListener('openSignUp', handleOpenSignUp);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation 
        onOpenSignUp={() => setIsSignUpModalOpen(true)}
        onOpenSignIn={() => setIsSignInModalOpen(true)}
      />
      <Hero onOpenSignUp={() => setIsSignUpModalOpen(true)} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
      />
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
