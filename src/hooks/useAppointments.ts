import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  specialty_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_check';
  notes?: string;
  patient_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    name: string;
    email: string;
    phone?: string;
  };
  doctor?: {
    name: string;
    email: string;
    specialty?: string;
  };
  specialty?: {
    name: string;
    code: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  doctor_id: string;
  specialty_id: string;
  appointment_date: string;
  duration_minutes?: number;
  type?: string;
  notes?: string;
  patient_notes?: string;
}

export function useAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(name, email, phone),
          doctor:users!appointments_doctor_id_fkey(name, email, specialty),
          specialty:medical_specialties(name, code)
        `)
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(name, email, phone),
          doctor:users!appointments_doctor_id_fkey(name, email, specialty),
          specialty:medical_specialties(name, code)
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating appointment');
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(name, email, phone),
          doctor:users!appointments_doctor_id_fkey(name, email, specialty),
          specialty:medical_specialties(name, code)
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => apt.id === id ? data : apt)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating appointment');
      return null;
    }
  };

  const cancelAppointment = async (id: string, reason?: string): Promise<boolean> => {
    setError(null);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id 
            ? { ...apt, status: 'cancelled' as const, updated_at: new Date().toISOString() }
            : apt
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelling appointment');
      return false;
    }
  };

  const getUpcomingAppointments = async (limit = 5): Promise<Appointment[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(name, email, phone),
          doctor:users!appointments_doctor_id_fkey(name, email, specialty),
          specialty:medical_specialties(name, code)
        `)
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
        .gte('appointment_date', new Date().toISOString())
        .in('status', ['scheduled', 'confirmed'])
        .order('appointment_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    refetch: fetchAppointments
  };
}