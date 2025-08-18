export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          company_id: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          company_id: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcement_recipients: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          company_id: string
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          target_audience: string | null
          target_department_id: string | null
          target_location_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          target_audience?: string | null
          target_department_id?: string | null
          target_location_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          target_audience?: string | null
          target_department_id?: string | null
          target_location_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_days: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          end_date: string
          id: string
          is_recurring: boolean | null
          location_id: string | null
          recurrence_pattern: Json | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_recurring?: boolean | null
          location_id?: string | null
          recurrence_pattern?: Json | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_recurring?: boolean | null
          location_id?: string | null
          recurrence_pattern?: Json | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_setup: {
        Row: {
          business_goals: string[] | null
          business_type: string | null
          company_id: string
          created_at: string
          current_tools: string[] | null
          ein: string | null
          id: string
          job_role: string | null
          payroll_method: string | null
          pos_system: string | null
          scheduling_preferences: Json | null
          setup_completed: boolean | null
          updated_at: string
        }
        Insert: {
          business_goals?: string[] | null
          business_type?: string | null
          company_id: string
          created_at?: string
          current_tools?: string[] | null
          ein?: string | null
          id?: string
          job_role?: string | null
          payroll_method?: string | null
          pos_system?: string | null
          scheduling_preferences?: Json | null
          setup_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          business_goals?: string[] | null
          business_type?: string | null
          company_id?: string
          created_at?: string
          current_tools?: string[] | null
          ein?: string | null
          id?: string
          job_role?: string | null
          payroll_method?: string | null
          pos_system?: string | null
          scheduling_preferences?: Json | null
          setup_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          channel_type: string
          company_id: string
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location_id: string | null
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          channel_type?: string
          company_id: string
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          channel_type?: string
          company_id?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: Json | null
          created_at: string | null
          id: string
          industry: string | null
          location_count: number | null
          name: string
          phone_number: string | null
          settings: Json | null
          size_range: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location_count?: number | null
          name: string
          phone_number?: string | null
          settings?: Json | null
          size_range?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location_count?: number | null
          name?: string
          phone_number?: string | null
          settings?: Json | null
          size_range?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      direct_conversations: {
        Row: {
          created_at: string
          id: string
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_time_off_balances: {
        Row: {
          accrued_hours: number | null
          balance_hours: number | null
          carry_over_hours: number | null
          created_at: string
          employee_id: string
          id: string
          last_accrual_date: string | null
          pending_hours: number | null
          time_off_type_id: string
          updated_at: string
          used_hours: number | null
          year: number
        }
        Insert: {
          accrued_hours?: number | null
          balance_hours?: number | null
          carry_over_hours?: number | null
          created_at?: string
          employee_id: string
          id?: string
          last_accrual_date?: string | null
          pending_hours?: number | null
          time_off_type_id: string
          updated_at?: string
          used_hours?: number | null
          year: number
        }
        Update: {
          accrued_hours?: number | null
          balance_hours?: number | null
          carry_over_hours?: number | null
          created_at?: string
          employee_id?: string
          id?: string
          last_accrual_date?: string | null
          pending_hours?: number | null
          time_off_type_id?: string
          updated_at?: string
          used_hours?: number | null
          year?: number
        }
        Relationships: []
      }
      employees: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          employee_id: string | null
          first_name: string
          hire_date: string | null
          hourly_rate: number | null
          id: string
          last_name: string
          metadata: Json | null
          phone_number: string | null
          positions: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name: string
          metadata?: Json | null
          phone_number?: string | null
          positions?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          employee_id?: string | null
          first_name?: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string
          metadata?: Json | null
          phone_number?: string | null
          positions?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: Json | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          phone_number: string | null
          settings: Json | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone_number?: string | null
          settings?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone_number?: string | null
          settings?: Json | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      log_categories: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          sort_order: number | null
          template_fields: Json | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          sort_order?: number | null
          template_fields?: Json | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          sort_order?: number | null
          template_fields?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      log_entries: {
        Row: {
          attachments: Json | null
          category_id: string
          company_id: string
          content: string
          created_at: string
          created_by: string
          department_id: string | null
          entry_date: string
          id: string
          last_modified_by: string | null
          location_id: string | null
          metadata: Json | null
          priority: string | null
          shift_time: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          category_id: string
          company_id: string
          content: string
          created_at?: string
          created_by: string
          department_id?: string | null
          entry_date?: string
          id?: string
          last_modified_by?: string | null
          location_id?: string | null
          metadata?: Json | null
          priority?: string | null
          shift_time?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          category_id?: string
          company_id?: string
          content?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          entry_date?: string
          id?: string
          last_modified_by?: string | null
          location_id?: string | null
          metadata?: Json | null
          priority?: string | null
          shift_time?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      log_templates: {
        Row: {
          category_id: string
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          field_definitions: Json | null
          id: string
          is_default: boolean | null
          name: string
          template_content: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category_id: string
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          field_definitions?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          template_content: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category_id?: string
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          field_definitions?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_content?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          conversation_id: string | null
          created_at: string
          edited_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          announcement_notifications: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          message_notifications: boolean | null
          push_notifications: boolean | null
          schedule_notifications: boolean | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          schedule_notifications?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          schedule_notifications?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          company_id: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          company_id: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          data: Json | null
          id: string
          step_name: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name: string
          user_id?: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          step_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          bonuses: number | null
          company_id: string
          created_at: string
          double_time_hours: number | null
          double_time_rate: number | null
          employee_id: string
          federal_tax: number | null
          gross_pay: number | null
          id: string
          medicare: number | null
          metadata: Json | null
          net_pay: number | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_rate: number | null
          payroll_period_id: string
          regular_hours: number | null
          regular_rate: number | null
          social_security: number | null
          state_tax: number | null
          status: string
          tips: number | null
          updated_at: string
        }
        Insert: {
          bonuses?: number | null
          company_id: string
          created_at?: string
          double_time_hours?: number | null
          double_time_rate?: number | null
          employee_id: string
          federal_tax?: number | null
          gross_pay?: number | null
          id?: string
          medicare?: number | null
          metadata?: Json | null
          net_pay?: number | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payroll_period_id: string
          regular_hours?: number | null
          regular_rate?: number | null
          social_security?: number | null
          state_tax?: number | null
          status?: string
          tips?: number | null
          updated_at?: string
        }
        Update: {
          bonuses?: number | null
          company_id?: string
          created_at?: string
          double_time_hours?: number | null
          double_time_rate?: number | null
          employee_id?: string
          federal_tax?: number | null
          gross_pay?: number | null
          id?: string
          medicare?: number | null
          metadata?: Json | null
          net_pay?: number | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payroll_period_id?: string
          regular_hours?: number | null
          regular_rate?: number | null
          social_security?: number | null
          state_tax?: number | null
          status?: string
          tips?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payroll_periods: {
        Row: {
          company_id: string
          created_at: string
          id: string
          metadata: Json | null
          pay_date: string
          period_end: string
          period_start: string
          processed_at: string | null
          processed_by: string | null
          status: string
          total_deductions: number | null
          total_gross_pay: number | null
          total_net_pay: number | null
          total_taxes: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pay_date: string
          period_end: string
          period_start: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          total_deductions?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          total_taxes?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pay_date?: string
          period_end?: string
          period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          total_deductions?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          total_taxes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payroll_tax_settings: {
        Row: {
          company_id: string
          created_at: string
          federal_tax_rate: number | null
          id: string
          is_active: boolean | null
          medicare_rate: number | null
          settings: Json | null
          social_security_rate: number | null
          state: string
          state_tax_rate: number | null
          unemployment_rate: number | null
          updated_at: string
          workers_comp_rate: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          federal_tax_rate?: number | null
          id?: string
          is_active?: boolean | null
          medicare_rate?: number | null
          settings?: Json | null
          social_security_rate?: number | null
          state: string
          state_tax_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          workers_comp_rate?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          federal_tax_rate?: number | null
          id?: string
          is_active?: boolean | null
          medicare_rate?: number | null
          settings?: Json | null
          social_security_rate?: number | null
          state?: string
          state_tax_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          workers_comp_rate?: number | null
        }
        Relationships: []
      }
      pending_requests: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          request_type: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          request_type: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          request_type?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          department_id: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          department_id: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          department_id?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_providers: string[] | null
          created_at: string | null
          email: string
          email_verified_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          phone_verified_at: string | null
          role: string
          session_expires_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          verification_required: boolean | null
        }
        Insert: {
          auth_providers?: string[] | null
          created_at?: string | null
          email: string
          email_verified_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified_at?: string | null
          role?: string
          session_expires_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Update: {
          auth_providers?: string[] | null
          created_at?: string | null
          email?: string
          email_verified_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified_at?: string | null
          role?: string
          session_expires_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          company_id: string
          created_at: string
          end_date: string
          id: string
          location_id: string | null
          metadata: Json | null
          name: string
          published_at: string | null
          published_by: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          name: string
          published_at?: string | null
          published_by?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          name?: string
          published_at?: string | null
          published_by?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      setup_progress: {
        Row: {
          company_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          data: Json | null
          id: string
          step_key: string
          step_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          step_key: string
          step_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          step_key?: string
          step_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shift_feedback: {
        Row: {
          achievements: string[] | null
          areas_for_improvement: string[] | null
          communication_rating: number | null
          company_id: string
          created_at: string
          created_by: string
          employee_id: string
          feedback_notes: string | null
          id: string
          log_entry_id: string | null
          overall_rating: number | null
          performance_rating: number | null
          punctuality_rating: number | null
          recognition_points: number | null
          shift_date: string
          teamwork_rating: number | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          areas_for_improvement?: string[] | null
          communication_rating?: number | null
          company_id: string
          created_at?: string
          created_by: string
          employee_id: string
          feedback_notes?: string | null
          id?: string
          log_entry_id?: string | null
          overall_rating?: number | null
          performance_rating?: number | null
          punctuality_rating?: number | null
          recognition_points?: number | null
          shift_date: string
          teamwork_rating?: number | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          areas_for_improvement?: string[] | null
          communication_rating?: number | null
          company_id?: string
          created_at?: string
          created_by?: string
          employee_id?: string
          feedback_notes?: string | null
          id?: string
          log_entry_id?: string | null
          overall_rating?: number | null
          performance_rating?: number | null
          punctuality_rating?: number | null
          recognition_points?: number | null
          shift_date?: string
          teamwork_rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          break_minutes: number | null
          created_at: string
          employee_id: string | null
          end_time: string
          id: string
          location_id: string | null
          notes: string | null
          position_id: string
          schedule_id: string
          shift_date: string
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string
          employee_id?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          notes?: string | null
          position_id: string
          schedule_id: string
          shift_date: string
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          break_minutes?: number | null
          created_at?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          position_id?: string
          schedule_id?: string
          shift_date?: string
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      time_off_policies: {
        Row: {
          accrual_method: string | null
          accrual_rate: number | null
          carry_over_limit: number | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean | null
          max_balance: number | null
          metadata: Json | null
          probation_period_days: number | null
          reset_date: string | null
          time_off_type_id: string
          updated_at: string
        }
        Insert: {
          accrual_method?: string | null
          accrual_rate?: number | null
          carry_over_limit?: number | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_balance?: number | null
          metadata?: Json | null
          probation_period_days?: number | null
          reset_date?: string | null
          time_off_type_id: string
          updated_at?: string
        }
        Update: {
          accrual_method?: string | null
          accrual_rate?: number | null
          carry_over_limit?: number | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_balance?: number | null
          metadata?: Json | null
          probation_period_days?: number | null
          reset_date?: string | null
          time_off_type_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          attachment_url: string | null
          company_id: string
          created_at: string
          employee_id: string
          end_date: string
          end_time: string | null
          id: string
          is_partial_day: boolean | null
          notes: string | null
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          start_time: string | null
          status: string | null
          submitted_at: string | null
          time_off_type_id: string
          total_hours: number
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          end_date: string
          end_time?: string | null
          id?: string
          is_partial_day?: boolean | null
          notes?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          start_time?: string | null
          status?: string | null
          submitted_at?: string | null
          time_off_type_id: string
          total_hours: number
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string
          end_time?: string | null
          id?: string
          is_partial_day?: boolean | null
          notes?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          start_time?: string | null
          status?: string | null
          submitted_at?: string | null
          time_off_type_id?: string
          total_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      time_off_types: {
        Row: {
          advance_notice_days: number | null
          color: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_consecutive_days: number | null
          name: string
          requires_approval: boolean | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          advance_notice_days?: number | null
          color?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_consecutive_days?: number | null
          name: string
          requires_approval?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          advance_notice_days?: number | null
          color?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_consecutive_days?: number | null
          name?: string
          requires_approval?: boolean | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      time_punches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          device_info: Json | null
          edited_at: string | null
          edited_by: string | null
          employee_id: string
          gps_coordinates: Json | null
          id: string
          ip_address: unknown | null
          location_id: string | null
          metadata: Json | null
          notes: string | null
          photo_url: string | null
          punch_method: string | null
          punch_time: string
          punch_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          device_info?: Json | null
          edited_at?: string | null
          edited_by?: string | null
          employee_id: string
          gps_coordinates?: Json | null
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          metadata?: Json | null
          notes?: string | null
          photo_url?: string | null
          punch_method?: string | null
          punch_time?: string
          punch_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          device_info?: Json | null
          edited_at?: string | null
          edited_by?: string | null
          employee_id?: string
          gps_coordinates?: Json | null
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          metadata?: Json | null
          notes?: string | null
          photo_url?: string | null
          punch_method?: string | null
          punch_time?: string
          punch_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_hours: number | null
          company_id: string
          created_at: string
          employee_id: string
          id: string
          location_id: string | null
          metadata: Json | null
          overtime_hours: number | null
          period_end: string
          period_start: string
          regular_hours: number | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_hours?: number | null
          company_id: string
          created_at?: string
          employee_id: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          overtime_hours?: number | null
          period_end: string
          period_start: string
          regular_hours?: number | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_hours?: number | null
          company_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          location_id?: string | null
          metadata?: Json | null
          overtime_hours?: number | null
          period_end?: string
          period_start?: string
          regular_hours?: number | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tip_distributions: {
        Row: {
          calculated_at: string | null
          company_id: string
          created_at: string
          distributed_at: string | null
          distributed_by: string | null
          id: string
          metadata: Json | null
          notes: string | null
          period_end: string
          period_start: string
          status: string | null
          tip_pool_id: string
          total_distributed: number
          total_tips: number
          updated_at: string
        }
        Insert: {
          calculated_at?: string | null
          company_id: string
          created_at?: string
          distributed_at?: string | null
          distributed_by?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          period_end: string
          period_start: string
          status?: string | null
          tip_pool_id: string
          total_distributed?: number
          total_tips?: number
          updated_at?: string
        }
        Update: {
          calculated_at?: string | null
          company_id?: string
          created_at?: string
          distributed_at?: string | null
          distributed_by?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          tip_pool_id?: string
          total_distributed?: number
          total_tips?: number
          updated_at?: string
        }
        Relationships: []
      }
      tip_payouts: {
        Row: {
          amount: number
          calculation_method: string | null
          created_at: string
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          paid_at: string | null
          percentage_share: number | null
          points_earned: number | null
          status: string | null
          tip_distribution_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          calculation_method?: string | null
          created_at?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          percentage_share?: number | null
          points_earned?: number | null
          status?: string | null
          tip_distribution_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          calculation_method?: string | null
          created_at?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          percentage_share?: number | null
          points_earned?: number | null
          status?: string | null
          tip_distribution_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tip_pool_participants: {
        Row: {
          allocation_percentage: number | null
          created_at: string
          employee_id: string
          id: string
          is_active: boolean | null
          participation_type: string
          points_value: number | null
          tip_pool_id: string
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          participation_type: string
          points_value?: number | null
          tip_pool_id: string
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          participation_type?: string
          points_value?: number | null
          tip_pool_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tip_pools: {
        Row: {
          auto_sync_pos: boolean | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          location_id: string | null
          name: string
          period_type: string
          pool_type: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          auto_sync_pos?: boolean | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name: string
          period_type?: string
          pool_type: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          auto_sync_pos?: boolean | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          name?: string
          period_type?: string
          pool_type?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
