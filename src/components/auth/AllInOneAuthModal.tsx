import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, MessageSquare, Apple, Crown, Users } from 'lucide-react';

interface AllInOneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeSwitch: () => void;
}

type AuthProvider = 'email' | 'google' | 'microsoft' | 'apple' | 'sms';
type UserRole = 'business_owner' | 'employee';

const authSchema = z.object({
  // Step 1 - Auth Method
  authMethod: z.enum(['email', 'google', 'microsoft', 'apple', 'sms']),
  
  // Step 2 - Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Phone number is required').optional(),
  role: z.enum(['business_owner', 'employee']),
  
  // Step 3 - Company Info (required for business owners)
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  
  // Step 4 - Password (if email signup)
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.authMethod === 'email' && !data.email) return false;
  if (data.authMethod === 'sms' && !data.phone) return false;
  if (data.authMethod === 'email' && data.password !== data.confirmPassword) return false;
  if (data.role === 'business_owner' && (!data.companyName || !data.industry || !data.companySize)) return false;
  return true;
}, {
  message: "Please complete all required fields"
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AllInOneAuthModal({ isOpen, onClose, mode, onModeSwitch }: AllInOneAuthModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthProvider>('email');

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      authMethod: 'email',
      role: 'business_owner',
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedRole = watch('role');
  const watchedAuthMethod = watch('authMethod');

  const totalSteps = mode === 'signup' ? (watchedRole === 'business_owner' ? 3 : 2) : 1;

  const handleAuthMethodSelect = async (method: AuthProvider) => {
    setSelectedAuthMethod(method);
    setValue('authMethod', method);

    if (method !== 'email' && method !== 'sms') {
      setLoading(true);
      try {
        let provider: 'google' | 'azure' | 'apple';
        
        switch (method) {
          case 'google':
            provider = 'google';
            break;
          case 'microsoft':
            provider = 'azure';
            break;
          case 'apple':
            provider = 'apple';
            break;
          default:
            throw new Error('Invalid provider');
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (error) throw error;
        
        // OAuth will handle the redirect, so we can close the modal
        onClose();
      } catch (error: any) {
        toast({
          title: 'Authentication Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      setCurrentStep(2);
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if session has expired and verification is required
      const { data: profile } = await supabase
        .from('profiles')
        .select('session_expires_at, verification_required, onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (profile?.verification_required) {
        toast({
          title: 'Verification Required',
          description: 'Please verify your email or phone number to continue.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });
      
      onClose();
      
      // Redirect based on onboarding status
      setTimeout(() => {
        if (profile?.onboarding_completed) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/onboarding';
        }
      }, 100);
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (data.authMethod === 'email') {
        // Auto-detect timezone for later use
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const signUpData = {
          email: data.email!,
          password: data.password!,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              role: data.role,
              timezone: userTimezone,
              // Store company info for later processing
              ...(data.role === 'business_owner' && data.companyName ? {
                company_name: data.companyName,
                company_industry: data.industry,
                company_size: data.companySize,
              } : {})
            },
          },
        };

        const { data: authData, error } = await supabase.auth.signUp(signUpData);
        if (error) throw error;

        // Check if user needs email verification
        if (authData.user && !authData.session) {
          toast({
            title: 'Check your email',
            description: 'We sent you a confirmation link. Please check your email and click the link to complete your registration.',
          });
          onClose();
          return;
        }

        // If session is established immediately, the user is logged in
        if (authData.session) {
          toast({
            title: 'Account Created!',
            description: 'Welcome to your new workspace.',
          });
          
          onClose();
          
          // Redirect to onboarding where company creation will be handled
          setTimeout(() => {
            if (data.role === 'business_owner') {
              window.location.href = '/onboarding';
            } else {
              window.location.href = '/dashboard';
            }
          }, 500);
        }
      }
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        if (mode === 'signin') {
          return (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Welcome back</h2>
                <p className="text-xs text-muted-foreground">Sign in to your account</p>
              </div>
              
              <div className="flex justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('google')}
                    disabled={loading}
                    title="Continue with Google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Google</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('microsoft')}
                    disabled={loading}
                    title="Continue with Microsoft"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Microsoft</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('apple')}
                    disabled={loading}
                    title="Continue with Apple"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Apple</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => setSelectedAuthMethod('email')}
                    title="Sign in with Email"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Email</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => setSelectedAuthMethod('sms')}
                    title="Sign in with SMS"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">SMS</span>
                </div>
              </div>

              {selectedAuthMethod === 'email' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;
                    handleEmailSignIn(email, password);
                  }}
                  className="space-y-2 mt-3 pt-3 border-t"
                >
                  <div className="space-y-1">
                    <Input 
                      id="signin-email"
                      name="email"
                      type="email" 
                      placeholder="Email"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="h-8 text-sm pr-8"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-8 text-sm bg-primary text-primary-foreground" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              )}
              
              <div className="text-center text-xs">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={onModeSwitch}>
                  Start free trial
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold">Start Free Trial</h2>
                <p className="text-xs text-muted-foreground">Create your account</p>
              </div>
              
              <div className="flex justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('google')}
                    disabled={loading}
                    title="Continue with Google"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Google</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('microsoft')}
                    disabled={loading}
                    title="Continue with Microsoft"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Microsoft</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('apple')}
                    disabled={loading}
                    title="Continue with Apple"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </Button>
                  <span className="text-xs text-muted-foreground">Apple</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('email')}
                    title="Sign up with Email"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Email</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => handleAuthMethodSelect('sms')}
                    title="Sign up with SMS"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">SMS</span>
                </div>
              </div>
              
              <div className="text-center text-xs">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={onModeSwitch}>
                  Sign in
                </Button>
              </div>
            </div>
          );
        }

      case 2:
        return (
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold">Tell us about yourself</h2>
              <p className="text-xs text-muted-foreground">Personal details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                {...form.register('firstName')}
                placeholder="First name"
                className="h-8 text-sm"
              />
              <Input
                {...form.register('lastName')}
                placeholder="Last name"
                className="h-8 text-sm"
              />
            </div>

            {selectedAuthMethod === 'email' && (
              <>
                <Input
                  type="email"
                  {...form.register('email')}
                  placeholder="Email"
                  className="h-8 text-sm"
                />
                
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('password')}
                    placeholder="Password"
                    className="h-8 text-sm pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                
                <Input
                  type="password"
                  {...form.register('confirmPassword')}
                  placeholder="Confirm password"
                  className="h-8 text-sm"
                />
              </>
            )}

            {selectedAuthMethod === 'sms' && (
              <Input
                type="tel"
                {...form.register('phone')}
                placeholder="Phone number"
                className="h-8 text-sm"
              />
            )}
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Role</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={watchedRole === 'business_owner' ? 'default' : 'outline'}
                  className="h-12 flex-col gap-1 text-xs"
                  onClick={() => setValue('role', 'business_owner')}
                >
                  <Crown className="w-4 h-4" />
                  <span>Business Owner</span>
                </Button>
                
                <Button
                  type="button"
                  variant={watchedRole === 'employee' ? 'default' : 'outline'}
                  className="h-12 flex-col gap-1 text-xs"
                  onClick={() => setValue('role', 'employee')}
                >
                  <Users className="w-4 h-4" />
                  <span>Employee</span>
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1 h-8 text-sm">
                Back
              </Button>
              <Button onClick={handleNextStep} className="flex-1 h-8 text-sm">
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold">Company Information</h2>
              <p className="text-xs text-muted-foreground">Tell us about your {watchedRole === 'business_owner' ? 'business' : 'company'}</p>
            </div>
            
            <div className="space-y-2">
              <Input
                {...form.register('companyName')}
                placeholder="Company name"
                className="h-8 text-sm"
              />
              
              <Select onValueChange={(value) => setValue('industry', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setValue('companySize', value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1 h-8 text-sm">
                Back
              </Button>
              <Button 
                onClick={form.handleSubmit(handleFinalSubmit)} 
                className="flex-1 h-8 text-sm"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[280px] bg-background/95 backdrop-blur-lg border border-border/30 shadow-elegant animate-scale-in p-3">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' ? 'Sign in to your existing account' : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>
        
        {mode === 'signup' && currentStep > 1 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="text-xs text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
          </div>
        )}
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}