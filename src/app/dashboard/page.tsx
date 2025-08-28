'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, FileText, Plus, Bell } from 'lucide-react';

interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  totalPatients: number;
  pendingRecords: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { appointments, loading, getUpcomingAppointments } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    pendingRecords: 0
  });

  useEffect(() => {
    const loadUpcoming = async () => {
      const upcoming = await getUpcomingAppointments(5);
      setUpcomingAppointments(upcoming);
      
      // Calculate stats
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const todayCount = upcoming.filter(apt => 
        apt.appointment_date.startsWith(todayStr)
      ).length;
      
      const weekCount = upcoming.filter(apt => 
        new Date(apt.appointment_date) <= weekFromNow
      ).length;

      setStats({
        todayAppointments: todayCount,
        weekAppointments: weekCount,
        totalPatients: new Set(upcoming.map(apt => apt.patient_id)).size,
        pendingRecords: upcoming.filter(apt => apt.status === 'completed').length
      });
    };

    if (user) {
      loadUpcoming();
    }
  }, [user, getUpcomingAppointments]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
          <p className="text-gray-600">Por favor inicia sesión para acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  const isDoctor = user.role === 'doctor';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {user.name || user.email}
              </h1>
              <p className="text-gray-600 mt-1">
                {isDoctor ? 'Panel de Control Médico' : 'Mi Panel de Paciente'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weekAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isDoctor ? 'Pacientes' : 'Médicos'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Próximas Citas
                  </h2>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cita
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando citas...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas programadas</p>
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                      Programar Primera Cita
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {isDoctor ? appointment.patient?.name : appointment.doctor?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.specialty?.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(appointment.appointment_date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status === 'confirmed' ? 'Confirmada' : 
                               appointment.status === 'scheduled' ? 'Programada' : appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="p-6 space-y-4">
                {isDoctor ? (
                  <>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Plus className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Nueva Cita</span>
                    </button>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <FileText className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Nuevo Historial</span>
                    </button>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Users className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Ver Pacientes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Agendar Cita</span>
                    </button>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <FileText className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Mi Historial</span>
                    </button>
                    <button className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                      <Users className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Mis Médicos</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mi Perfil</h2>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name || 'Sin nombre'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.specialty && (
                    <p className="text-sm text-blue-600 mt-1">{user.specialty}</p>
                  )}
                  <button className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}