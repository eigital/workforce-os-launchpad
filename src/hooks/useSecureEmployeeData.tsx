import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, isManager } from '@/hooks/useUserRole';

export interface SecureEmployee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
  status: string;
  hire_date?: string;
  positions?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  // PII fields - only available to managers
  email?: string;
  phone_number?: string;
  hourly_rate?: number;
}

export const useSecureEmployeeData = () => {
  const [employees, setEmployees] = useState<SecureEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const { role: userRole } = useUserRole();
  const isManagerRole = isManager(userRole);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      let data;
      let error;

      if (isManagerRole) {
        // Managers can see all employee data including PII
        const result = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      } else {
        // Employees can only see basic directory info (no PII)
        const result = await supabase
          .from('employees')
          .select('id, first_name, last_name, employee_id, status, hire_date, positions, metadata, created_at, updated_at')
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      setEmployees((data as SecureEmployee[]) || []);
    } catch (error) {
      console.error('Error loading employee data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== null) {
      loadEmployees();
    }
  }, [userRole, isManagerRole]);

  return {
    employees,
    loading,
    isManagerRole,
    refetch: loadEmployees
  };
};