import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import SignUpModal from "@/components/auth/SignUpModal";

const Index = () => {
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation onOpenSignUp={() => setIsSignUpModalOpen(true)} />
      <Hero onOpenSignUp={() => setIsSignUpModalOpen(true)} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
