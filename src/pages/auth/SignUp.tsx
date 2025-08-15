import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/components/auth/AuthLayout';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Get started today"
      subtitle="Create your account and streamline your business operations"
    >
      <SignUpForm />
    </AuthLayout>
  );
}