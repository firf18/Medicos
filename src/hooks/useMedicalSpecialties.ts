import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MedicalSpecialty {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export function useMedicalSpecialties() {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      setSpecialties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching specialties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  return {
    specialties,
    loading,
    error,
    refetch: fetchSpecialties
  };
}