import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { companyId, locationName } = await req.json();
    
    console.log('Fetching weather for:', { companyId, locationName });

    // Get weather data from OpenWeatherMap API
    const weatherApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!weatherApiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    // Fetch current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${weatherApiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    
    console.log('Weather data received:', weatherData);

    // Update business_metrics for today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingMetrics, error: fetchError } = await supabaseClient
      .from('business_metrics')
      .select('*')
      .eq('company_id', companyId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing metrics:', fetchError);
      throw fetchError;
    }

    const weatherCondition = weatherData.weather[0].main;
    const weatherTemperature = Math.round(weatherData.main.temp);

    if (existingMetrics) {
      // Update existing record
      const { error: updateError } = await supabaseClient
        .from('business_metrics')
        .update({
          weather_condition: weatherCondition,
          weather_temperature: weatherTemperature,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMetrics.id);

      if (updateError) {
        console.error('Error updating weather data:', updateError);
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabaseClient
        .from('business_metrics')
        .insert({
          company_id: companyId,
          date: today,
          weather_condition: weatherCondition,
          weather_temperature: weatherTemperature,
          created_by: companyId // Fallback to companyId since no user context
        });

      if (insertError) {
        console.error('Error inserting weather data:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather: {
          condition: weatherCondition,
          temperature: weatherTemperature,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in weather-fetch function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);