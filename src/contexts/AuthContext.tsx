'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ user: User | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ user: User | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email || supabaseUser.email || '',
        name: data.name || '',
        role: (data.role as UserRole) || 'patient',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
        specialty: data.specialty || null,
        licenseNumber: data.license_number || null,
        phone: data.phone || null,
        avatar: data.avatar || null
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: userData.role || 'patient'
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return { user: null, error: null };
      }

      return { user: null, error: 'Error desconocido' };
    } catch (error) {
      return { user: null, error: 'Error de conexión' };
    }
  };

  const signIn = async (
    email: string, 
    password: string
  ): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        return { user: userProfile, error: null };
      }

      return { user: null, error: 'Error desconocido' };
    } catch (error) {
      return { user: null, error: 'Error de conexión' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ user: User | null; error: string | null }> => {
    if (!user) {
      return { user: null, error: 'No hay usuario logueado' };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          specialty: updates.specialty,
          license_number: updates.licenseNumber,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const updatedUser: User = {
        ...user,
        name: data.name || user.name,
        phone: data.phone || user.phone,
        specialty: data.specialty || user.specialty,
        licenseNumber: data.license_number || user.licenseNumber,
        avatar: data.avatar || user.avatar,
        updatedAt: data.updated_at || user.updatedAt
      };

      setUser(updatedUser);
      return { user: updatedUser, error: null };
    } catch (error) {
      return { user: null, error: 'Error de conexión' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}