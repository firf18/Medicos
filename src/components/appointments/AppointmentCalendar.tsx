'use client';

import { useState, useEffect } from 'react';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone } from 'lucide-react';

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const { appointments, loading } = useAppointments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({ date: currentDay, isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // Obtener citas para una fecha específica
  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointment_date.startsWith(dateString)
    );
  };

  // Manejar selección de fecha
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dayApts = getAppointmentsForDate(date);
    setDayAppointments(dayApts);
  };

  // Navegación de meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'scheduled': return 'Programada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'No Asistió';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header del Calendario */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Calendario */}
        <div className="lg:col-span-2 p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day.date);
              const hasAppointments = dayAppointments.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  className={`
                    p-2 h-16 text-sm border border-gray-200 hover:bg-gray-50 transition-colors relative
                    ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                    ${isToday(day.date) ? 'bg-blue-100 border-blue-300' : ''}
                    ${isSameDate(day.date, selectedDate) ? 'bg-blue-200 border-blue-400' : ''}
                  `}
                >
                  <div className="font-medium">{day.date.getDate()}</div>
                  {hasAppointments && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-1">
                        {dayAppointments.slice(0, 3).map((apt, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`}
                          />
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-600">+{dayAppointments.length - 3}</div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de detalles del día */}
        <div className="lg:col-span-1 border-l border-gray-200 p-4">
          <div className="sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {selectedDate ? (
                selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              ) : (
                'Selecciona una fecha'
              )}
            </h3>

            {selectedDate && (
              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas programadas</p>
                  </div>
                ) : (
                  dayAppointments
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">
                              {new Date(appointment.appointment_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 text-gray-500 mr-2" />
                            <span>
                              {user?.role === 'doctor' 
                                ? appointment.patient?.name 
                                : appointment.doctor?.name}
                            </span>
                          </div>
                          
                          {appointment.specialty && (
                            <div className="text-sm text-gray-600">
                              {appointment.specialty.name}
                            </div>
                          )}
                          
                          {appointment.patient_notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <strong>Motivo:</strong> {appointment.patient_notes}
                            </div>
                          )}
                          
                          {appointment.notes && (
                            <div className="text-sm text-gray-600">
                              <strong>Notas:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}