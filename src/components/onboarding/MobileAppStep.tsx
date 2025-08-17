import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Smartphone, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Bell, 
  Download,
  QrCode,
  Apple,
  PlayCircle
} from 'lucide-react';

interface MobileAppStepProps {
  onNext: () => void;
}

const MOBILE_FEATURES = [
  {
    icon: Clock,
    title: 'Time Clocking',
    description: 'Clock in/out with GPS tracking and photo verification'
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'View and complete assigned tasks on the go'
  },
  {
    icon: MessageSquare,
    title: 'Team Communication',
    description: 'Chat with team members and receive announcements'
  },
  {
    icon: Bell,
    title: 'Schedule Notifications',
    description: 'Get notified about schedule changes and shifts'
  }
];

export default function MobileAppStep({ onNext }: MobileAppStepProps) {
  const [selectedOption, setSelectedOption] = useState<'download' | 'qr' | 'skip' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'mobile_app',
          completed: true,
          data: { selected_option: selectedOption || 'skip' }
        }]);

      if (progressError) {
        console.error('Error saving progress:', progressError);
      }

      if (selectedOption === 'download') {
        toast({
          title: 'Download links sent!',
          description: 'Check your email for mobile app download instructions.',
        });
      }

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

  const handleDownloadOption = (option: 'download' | 'qr') => {
    setSelectedOption(option);
    
    if (option === 'download') {
      // Simulate sending download links
      toast({
        title: 'Download links sent!',
        description: 'We\'ll send download links to your email shortly.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Get the Mobile App</h2>
        <p className="text-muted-foreground">
          Empower your team with our mobile app for time tracking, communication, and more.
        </p>
      </div>

      {/* Mobile Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile App Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOBILE_FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Download Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${
            selectedOption === 'download' ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
          }`}
          onClick={() => handleDownloadOption('download')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-fit mx-auto">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Send Download Links</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We'll email you direct links to download the app from the App Store and Google Play.
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Apple className="h-3 w-3 mr-1" />
                  iOS
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Android
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            selectedOption === 'qr' ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
          }`}
          onClick={() => setSelectedOption('qr')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full w-fit mx-auto">
              <QrCode className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Show QR Code</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Display QR codes for your team to quickly download the mobile app.
              </p>
              <Badge variant="outline" className="text-xs">
                Quick Setup
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOption === 'qr' && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="font-semibold">QR Codes for Download</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">iOS App Store</Badge>
                  <p className="text-xs text-muted-foreground">Scan with Camera app</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Google Play</Badge>
                  <p className="text-xs text-muted-foreground">Scan with any QR reader</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedOption('skip');
            onNext();
          }}
          className="flex-1"
        >
          Set up later
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading || !selectedOption}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}