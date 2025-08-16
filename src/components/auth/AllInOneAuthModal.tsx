import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  
  // Step 3 - Company Info (if business owner)
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  
  // Step 4 - Password (if email signup)
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.authMethod === 'email' && !data.email) return false;
  if (data.authMethod === 'sms' && !data.phone) return false;
  if (data.authMethod === 'email' && data.password !== data.confirmPassword) return false;
  if (!data.companyName) return false;
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

  const totalSteps = mode === 'signup' ? 3 : 1;

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
          // User will continue in the modal flow
          setCurrentStep(2);
        }
      }, 500);
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
      let userData = null;

      if (data.authMethod === 'email') {
        const signUpData = {
          email: data.email!,
          password: data.password!,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              role: data.role,
            },
          },
        };

        const { data: authData, error } = await supabase.auth.signUp(signUpData);
        if (error) throw error;
        userData = authData.user;
      }

      // Create/update profile with company info
      if (userData && data.companyName) {
        // Create company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: data.companyName,
            industry: data.industry,
            size_range: data.companySize,
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // Link user to company
        const { error: linkError } = await supabase
          .from('user_companies')
          .insert({
            user_id: userData.id,
            company_id: company.id,
            role: 'owner',
          });

        if (linkError) throw linkError;
      }

      // Mark onboarding as completed
      if (userData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            session_expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
          })
          .eq('id', userData.id);

        if (profileError) throw profileError;
      }

      toast({
        title: 'Account Created!',
        description: 'Welcome to your new workspace.',
      });
      
      onClose();
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

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
              
              <div className="flex justify-center gap-2">
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
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => handleAuthMethodSelect('apple')}
                  disabled={loading}
                  title="Continue with Apple"
                >
                  <Apple className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => setSelectedAuthMethod('email')}
                  title="Sign in with Email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => setSelectedAuthMethod('sms')}
                  title="Sign in with SMS"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
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
              
              <div className="flex justify-center gap-2">
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
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => handleAuthMethodSelect('apple')}
                  disabled={loading}
                  title="Continue with Apple"
                >
                  <Apple className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => handleAuthMethodSelect('email')}
                  title="Sign up with Email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={() => handleAuthMethodSelect('sms')}
                  title="Sign up with SMS"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
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
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Tell us about yourself</h2>
              <p className="text-sm text-muted-foreground">We'll use this to personalize your experience</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {selectedAuthMethod === 'email' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...form.register('password')}
                      placeholder="Choose a password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                </div>
              </>
            )}

            {selectedAuthMethod === 'sms' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register('phone')}
                  placeholder="Enter your phone number"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <Label>What best describes your role?</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={watchedRole === 'business_owner' ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setValue('role', 'business_owner')}
                >
                  <Crown className="w-6 h-6" />
                  <span className="text-sm font-medium">Business Owner</span>
                </Button>
                
                <Button
                  type="button"
                  variant={watchedRole === 'employee' ? 'default' : 'outline'}
                  className="h-20 flex-col gap-2"
                  onClick={() => setValue('role', 'employee')}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">Employee</span>
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Company Information</h2>
              <p className="text-sm text-muted-foreground">Tell us about your {watchedRole === 'business_owner' ? 'business' : 'company'}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...form.register('companyName')}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select onValueChange={(value) => setValue('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
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
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={form.handleSubmit(handleFinalSubmit)} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
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
      <DialogContent className="sm:max-w-xs bg-background border border-border shadow-lg p-4">
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