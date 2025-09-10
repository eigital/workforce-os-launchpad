import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  role: 'owner' | 'admin' | 'manager' | 'employee' | null;
  loading: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<'owner' | 'admin' | 'manager' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_companies')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('employee'); // Default to employee if error
        } else {
          setRole(data?.role as 'owner' | 'admin' | 'manager' | 'employee' || 'employee');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('employee'); // Default to employee if error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading };
};

export const isManager = (role: string | null): boolean => {
  return ['owner', 'admin', 'manager'].includes(role || '');
};