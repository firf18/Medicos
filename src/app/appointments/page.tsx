'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Plus, Calendar, List } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
          <p className="text-gray-600">Por favor inicia sesión para ver las citas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'doctor' 
                  ? 'Administra las citas de tus pacientes' 
                  : 'Gestiona tus citas médicas'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Toggle de vista */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'calendar' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  Calendario
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 mr-2 inline" />
                  Lista
                </button>
              </div>

              {/* Botón Nueva Cita */}
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <AppointmentForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            {view === 'calendar' && <AppointmentCalendar />}
            {view === 'list' && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center">Vista de lista en desarrollo...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}