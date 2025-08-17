import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MapPin, Phone, Clock } from 'lucide-react';

interface LocationSetupStepProps {
  onNext: () => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

interface LocationForm {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone_number: string;
  timezone: string;
}

export default function LocationSetupStep({ onNext }: LocationSetupStepProps) {
  const [location, setLocation] = useState<LocationForm>({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    phone_number: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleAddressChange = (field: keyof LocationForm['address'], value: string) => {
    setLocation(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const isFormValid = () => {
    return location.name.trim() && 
           location.address.street.trim() && 
           location.address.city.trim() && 
           location.address.state.trim();
  };

  const handleContinue = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Complete required fields',
        description: 'Please fill in all required location information.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user's company
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();

      if (!userCompanies) {
        toast({
          title: 'Error',
          description: 'No company found. Please complete previous steps.',
          variant: 'destructive',
        });
        return;
      }

      // Create location
      const { data: createdLocation, error: locationError } = await supabase
        .from('locations')
        .insert([{
          company_id: userCompanies.company_id,
          name: location.name,
          address: location.address,
          phone_number: location.phone_number || null,
          timezone: location.timezone,
          is_active: true
        }])
        .select()
        .single();

      if (locationError) {
        console.error('Error creating location:', locationError);
        toast({
          title: 'Error',
          description: 'Failed to create location.',
          variant: 'destructive',
        });
        return;
      }

      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'location_setup',
          completed: true,
          data: { location_id: createdLocation.id, ...location }
        }]);

      if (progressError) {
        console.error('Error saving progress:', progressError);
      }

      toast({
        title: 'Success',
        description: 'Location created successfully!',
      });

      onNext();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Location Setup</h2>
        <p className="text-muted-foreground">
          Add your business location to help manage scheduling and operations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Location Name *</Label>
            <Input
              id="location-name"
              value={location.name}
              onChange={(e) => setLocation(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Main Street Store, Downtown Location"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Address *</Label>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={location.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={location.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={location.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={location.address.zip}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                placeholder="10001"
                className="w-32"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={location.phone_number}
              onChange={(e) => setLocation(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </Label>
            <Select 
              value={location.timezone} 
              onValueChange={(value) => setLocation(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onNext}
          className="flex-1"
        >
          Skip for now
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading || !isFormValid()}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}