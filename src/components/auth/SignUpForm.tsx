import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Check, X, Building2, User, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(1, 'Please enter a phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['business_owner', 'employee']).optional(),
  // Business information for business owners
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  businessGoals: z.array(z.string()).optional(),
  currentTools: z.array(z.string()).optional(),
  posSystem: z.string().optional(),
  payrollMethod: z.string().optional(),
  ein: z.string().optional(),
});

type SignUpForm = z.infer<typeof signUpSchema>;

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number', valid: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          {check.valid ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={check.valid ? 'text-green-500' : 'text-muted-foreground'}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'business_owner' | 'employee' | ''>('');
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: selectedRole || undefined,
    },
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: SignUpForm) => {
    console.log('Form submitted with data:', data);
    console.log('Selected role:', selectedRole);
    
    if (!selectedRole) {
      console.log('No role selected');
      toast({
        title: 'Role required',
        description: 'Please select your role to continue.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Starting signup process...');
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      console.log('Calling supabase.auth.signUp with:', {
        email: data.email,
        redirectUrl,
        metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          role: selectedRole,
        }
      });
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            role: selectedRole,
            ...(selectedRole === 'business_owner' && {
              company_name: data.companyName,
              industry: data.industry,
              company_size: data.companySize,
              business_goals: selectedGoals,
              current_tools: selectedTools,
              pos_system: data.posSystem,
              payroll_method: data.payrollMethod,
              ein: data.ein,
            }),
          },
        },
      });

      console.log('Supabase signup response:', { error });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log('Signup successful, showing confirmation');
      // Show success state instead of redirecting
      setUserEmail(data.email);
      setEmailSent(true);
      
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: 'An error occurred',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      console.log('Signup process completed, setting loading to false');
      setLoading(false);
    }
  };

  // Show email confirmation screen after successful signup
  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
        <p className="text-muted-foreground">
          We've sent a confirmation link to:
        </p>
        <p className="font-medium text-foreground">{userEmail}</p>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account, then you can sign in.
        </p>
        <div className="pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/auth/signin">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={(e) => {
        console.log('Form onSubmit triggered');
        handleSubmit(onSubmit)(e);
      }} 
      className="space-y-3"
    >
      <div className="space-y-1">
        <Label className="text-xs font-medium">I am a</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('business_owner');
              setValue('role', 'business_owner');
              setShowBusinessForm(true);
            }}
            className={`p-2 rounded-md border transition-all hover:border-primary/50 ${
              selectedRole === 'business_owner'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-border/80'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium">Business</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSelectedRole('employee');
              setValue('role', 'employee');
              setShowBusinessForm(false);
            }}
            className={`p-2 rounded-md border transition-all hover:border-primary/50 ${
              selectedRole === 'employee'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-border/80'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <User className="h-4 w-4" />
              <span className="text-xs font-medium">Employee</span>
            </div>
          </button>
        </div>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            {...register('firstName')}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            {...register('lastName')}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phoneNumber" className="text-xs font-medium">Phone Number</Label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              placeholder="Enter phone number"
              value={field.value}
              onChange={field.onChange}
              className={errors.phoneNumber ? 'border-destructive' : ''}
            />
          )}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs font-medium">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            {...register('password')}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrengthIndicator password={watchedPassword} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Business Information Form - Only for Business Owners */}
      {showBusinessForm && selectedRole === 'business_owner' && (
        <div className="space-y-3 pt-2 border-t border-border/50">
          <h3 className="text-sm font-medium text-foreground">Business Information</h3>
          
          {/* Company Name */}
          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-xs font-medium">Business Name</Label>
            <Input
              id="companyName"
              placeholder="Your Business Name"
              {...register('companyName')}
            />
          </div>

          {/* What brings you to WorkforceOS? */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">What brings you to WorkforceOS? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Scheduling',
                'Budgeting', 
                'Tip Management',
                'Communication',
                'Time Clocking',
                'Payroll'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={selectedGoals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGoals([...selectedGoals, goal]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g !== goal));
                      }
                    }}
                  />
                  <Label htmlFor={goal} className="text-xs">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Industry</Label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Company Size */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Number of Employees</Label>
            <Controller
              name="companySize"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 employees</SelectItem>
                    <SelectItem value="6-15">6-15 employees</SelectItem>
                    <SelectItem value="16-50">16-50 employees</SelectItem>
                    <SelectItem value="51-100">51-100 employees</SelectItem>
                    <SelectItem value="100+">100+ employees</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Current Tools */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">What tools do you currently use? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Excel/Google Sheets',
                'Deputy',
                'When I Work',
                'Homebase',
                'Humanity',
                'Paper schedules'
              ].map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={selectedTools.includes(tool)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTools([...selectedTools, tool]);
                      } else {
                        setSelectedTools(selectedTools.filter(t => t !== tool));
                      }
                    }}
                  />
                  <Label htmlFor={tool} className="text-xs">{tool}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* POS System */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">POS System (Optional)</Label>
            <Controller
              name="posSystem"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select POS system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="toast">Toast</SelectItem>
                    <SelectItem value="clover">Clover</SelectItem>
                    <SelectItem value="shopify">Shopify POS</SelectItem>
                    <SelectItem value="revel">Revel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Payroll Method */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">How do you currently handle payroll?</Label>
            <Controller
              name="payrollMethod"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payroll method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual calculation</SelectItem>
                    <SelectItem value="quickbooks">QuickBooks</SelectItem>
                    <SelectItem value="adp">ADP</SelectItem>
                    <SelectItem value="gusto">Gusto</SelectItem>
                    <SelectItem value="paychex">Paychex</SelectItem>
                    <SelectItem value="other">Other service</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* EIN */}
          <div className="space-y-1">
            <Label htmlFor="ein" className="text-xs font-medium">EIN (Optional)</Label>
            <Input
              id="ein"
              placeholder="12-3456789"
              {...register('ein')}
            />
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-9 text-sm" 
        disabled={loading}
        onClick={(e) => {
          console.log('Create Account button clicked');
          console.log('Form errors:', errors);
          console.log('Selected role:', selectedRole);
          console.log('Loading state:', loading);
        }}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/auth/signin" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
}