import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackLink?: boolean;
}

export default function AuthLayout({ children, title, subtitle, showBackLink = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {showBackLink && (
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        )}
        
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          <div className="bg-card border rounded-lg p-6 shadow-elegant">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}