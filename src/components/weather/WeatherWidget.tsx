import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, CloudSnow, Thermometer, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  icon: string;
}

interface WeatherWidgetProps {
  companyId: string;
  locationName?: string;
  showRefresh?: boolean;
}

export function WeatherWidget({ companyId, locationName = "New York", showRefresh = true }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load weather data from business_metrics first
    loadStoredWeatherData();
  }, [companyId]);

  const loadStoredWeatherData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: metrics, error } = await supabase
        .from('business_metrics')
        .select('weather_condition, weather_temperature')
        .eq('company_id', companyId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading stored weather:', error);
        return;
      }

      if (metrics && metrics.weather_condition && metrics.weather_temperature) {
        setWeatherData({
          condition: metrics.weather_condition,
          temperature: metrics.weather_temperature,
          description: metrics.weather_condition.toLowerCase(),
          icon: metrics.weather_condition.toLowerCase()
        });
      }
    } catch (error) {
      console.error('Error loading stored weather data:', error);
    }
  };

  const fetchWeatherData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('weather-fetch', {
        body: {
          companyId,
          locationName
        }
      });

      if (error) throw error;

      if (data.success && data.weather) {
        setWeatherData({
          condition: data.weather.condition,
          temperature: data.weather.temperature,
          description: data.weather.description,
          icon: data.weather.icon
        });
        toast.success("Weather updated successfully!");
      }
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      toast.error("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIconElement = (condition: string) => {
    const normalizedCondition = condition.toLowerCase();
    
    if (normalizedCondition.includes('clear') || normalizedCondition.includes('sun')) {
      return <Sun className="h-4 w-4" />;
    } else if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
      return <CloudRain className="h-4 w-4" />;
    } else if (normalizedCondition.includes('snow')) {
      return <CloudSnow className="h-4 w-4" />;
    } else {
      return <Cloud className="h-4 w-4" />;
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 80) return "text-red-600";
    if (temp >= 65) return "text-yellow-600";
    if (temp >= 45) return "text-green-600";
    return "text-blue-600";
  };

  if (!weatherData) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Cloud className="h-4 w-4" />
        <span className="text-sm">No weather data</span>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeatherData}
            disabled={loading}
            className="h-auto p-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {getWeatherIconElement(weatherData.condition)}
      <div className="flex items-center gap-1">
        <Thermometer className="h-3 w-3" />
        <span className={`text-sm font-medium ${getTemperatureColor(weatherData.temperature)}`}>
          {weatherData.temperature}°F
        </span>
      </div>
      <span className="text-sm text-muted-foreground capitalize">
        {weatherData.description}
      </span>
      {showRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWeatherData}
          disabled={loading}
          className="h-auto p-1"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}