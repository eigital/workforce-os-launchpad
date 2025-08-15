import * as React from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from "@/lib/utils";

interface PhoneInputComponentProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  className?: string;
  defaultCountry?: string;
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, PhoneInputComponentProps>(
  ({ className, defaultCountry, ...props }, ref) => {
    // Detect user's country from browser locale
    const detectCountry = React.useMemo(() => {
      if (defaultCountry) return defaultCountry;
      
      try {
        // Try to get country from browser locale
        const locale = navigator.language || navigator.languages?.[0];
        if (locale) {
          const region = new Intl.Locale(locale).region;
          if (region) return region;
        }
        
        // Try timezone-based detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const countryMap: Record<string, string> = {
          'America/New_York': 'US',
          'America/Los_Angeles': 'US',
          'America/Chicago': 'US',
          'America/Denver': 'US',
          'America/Toronto': 'CA',
          'Europe/London': 'GB',
          'Europe/Paris': 'FR',
          'Europe/Berlin': 'DE',
          'Europe/Rome': 'IT',
          'Europe/Madrid': 'ES',
          'Asia/Tokyo': 'JP',
          'Asia/Shanghai': 'CN',
          'Asia/Kolkata': 'IN',
          'Australia/Sydney': 'AU',
        };
        
        return countryMap[timezone] || 'US';
      } catch {
        return 'US';
      }
    }, [defaultCountry]);

    return (
      <PhoneInput
        {...props}
        defaultCountry={detectCountry as any}
        className={cn(
          "phone-input",
          className
        )}
        onChange={props.onChange || (() => {})}
        numberInputProps={{
          className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        }}
        countrySelectProps={{
          className: "phone-input__country"
        }}
      />
    );
  }
);

PhoneInputComponent.displayName = "PhoneInput";

export { PhoneInputComponent as PhoneInput };