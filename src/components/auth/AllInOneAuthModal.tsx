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
import { Eye, EyeOff, Mail, MessageSquare, Apple } from 'lucide-react';

interface AllInOneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeSwitch: () => void;
}

type AuthProvider = 'email' | 'google' | 'microsoft' | 'apple' | 'sms';
type UserRole = 'business_owner' | 'manager' | 'employee';

const authSchema = z.object({
  // Step 1 - Auth Method
  authMethod: z.enum(['email', 'google', 'microsoft', 'apple', 'sms']),
  
  // Step 2 - Basic Info
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Phone number is required').optional(),
  role: z.enum(['business_owner', 'manager', 'employee']),
  
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
  if (data.role === 'business_owner' && !data.companyName) return false;
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

  const totalSteps = mode === 'signup' ? 
    (watchedAuthMethod === 'email' ? (watchedRole === 'business_owner' ? 4 : 3) : 2) : 1;

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

      // Create/update profile with company info if business owner
      if (userData && data.role === 'business_owner' && data.companyName) {
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
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Choose how you'd like to sign in</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setSelectedAuthMethod('email')}
                >
                  <Mail className="w-5 h-5" />
                  Sign in with Email
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('google')}
                  disabled={loading}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
                  Continue with Google
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('microsoft')}
                  disabled={loading}
                >
                  <div className="w-5 h-5 bg-blue-600 rounded" />
                  Continue with Microsoft
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('apple')}
                  disabled={loading}
                >
                  <Apple className="w-5 h-5" />
                  Continue with Apple
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setSelectedAuthMethod('sms')}
                >
                  <MessageSquare className="w-5 h-5" />
                  Sign in with SMS
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
                  className="space-y-4 mt-6 pt-6 border-t"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email"
                      name="email"
                      type="email" 
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              )}
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button variant="link" className="p-0 h-auto" onClick={onModeSwitch}>
                  Start free trial
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Get started today</h2>
                <p className="text-sm text-muted-foreground">Choose your preferred sign up method</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('email')}
                >
                  <Mail className="w-5 h-5" />
                  Sign up with Email
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('google')}
                  disabled={loading}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
                  Continue with Google
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('microsoft')}
                  disabled={loading}
                >
                  <div className="w-5 h-5 bg-blue-600 rounded" />
                  Continue with Microsoft
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('apple')}
                  disabled={loading}
                >
                  <Apple className="w-5 h-5" />
                  Continue with Apple
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleAuthMethodSelect('sms')}
                >
                  <MessageSquare className="w-5 h-5" />
                  Sign up with SMS
                </Button>
              </div>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button variant="link" className="p-0 h-auto" onClick={onModeSwitch}>
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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter your email"
                />
              </div>
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
            
            <div className="space-y-2">
              <Label htmlFor="role">What best describes your role?</Label>
              <Select onValueChange={(value) => setValue('role', value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
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
        if (watchedRole === 'business_owner') {
          return (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Company Information</h2>
                <p className="text-sm text-muted-foreground">Tell us about your business</p>
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
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          );
        } else {
          // For non-business owners, go directly to password step
          if (selectedAuthMethod === 'email') {
            return renderPasswordStep();
          } else {
            // For SMS, complete the process
            return (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">Almost done!</h2>
                  <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
                </div>
                
                <Button 
                  onClick={() => form.handleSubmit(handleFinalSubmit)()} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            );
          }
        }

      case 4:
        return renderPasswordStep();

      default:
        return null;
    }
  };

  const renderPasswordStep = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Create your password</h2>
        <p className="text-sm text-muted-foreground">Choose a secure password for your account</p>
      </div>
      
      <div className="space-y-4">
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-background/95 backdrop-blur-lg border border-border/30 shadow-elegant animate-scale-in p-6">
        {mode === 'signup' && currentStep > 1 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        )}
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}