'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments, CreateAppointmentData } from '@/hooks/useAppointments';
import { useMedicalSpecialties } from '@/hooks/useMedicalSpecialties';
import { Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  doctorId?: string;
  patientId?: string;
}

export default function AppointmentForm({ 
  onSuccess, 
  onCancel, 
  doctorId, 
  patientId 
}: AppointmentFormProps) {
  const { user } = useAuth();
  const { createAppointment, loading } = useAppointments();
  const { specialties } = useMedicalSpecialties();
  
  const [formData, setFormData] = useState({
    doctor_id: doctorId || (user?.role === 'doctor' ? user.id : ''),
    patient_id: patientId || (user?.role === 'patient' ? user.id : ''),
    specialty_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    type: 'consultation' as const,
    notes: '',
    patient_notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctor_id) newErrors.doctor_id = 'Selecciona un médico';
    if (!formData.patient_id) newErrors.patient_id = 'Selecciona un paciente';
    if (!formData.specialty_id) newErrors.specialty_id = 'Selecciona una especialidad';
    if (!formData.appointment_date) newErrors.appointment_date = 'Selecciona una fecha';
    if (!formData.appointment_time) newErrors.appointment_time = 'Selecciona una hora';

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
    if (selectedDate < new Date()) {
      newErrors.appointment_date = 'La fecha debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const appointmentData: CreateAppointmentData = {
      doctor_id: formData.doctor_id,
      patient_id: formData.patient_id,
      specialty_id: formData.specialty_id,
      appointment_date: `${formData.appointment_date}T${formData.appointment_time}:00.000Z`,
      duration_minutes: formData.duration_minutes,
      type: formData.type,
      notes: formData.notes || undefined,
      patient_notes: formData.patient_notes || undefined
    };

    const result = await createAppointment(appointmentData);
    
    if (result) {
      onSuccess?.();
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generar horarios disponibles (9 AM - 6 PM, cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Calendar className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Nueva Cita Médica</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Especialidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Especialidad
          </label>
          <select
            value={formData.specialty_id}
            onChange={(e) => handleChange('specialty_id', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.specialty_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una especialidad</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.icon} {specialty.name}
              </option>
            ))}
          </select>
          {errors.specialty_id && (
            <p className="text-red-500 text-sm mt-1">{errors.specialty_id}</p>
          )}
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.appointment_date}
              onChange={(e) => handleChange('appointment_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointment_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.appointment_date && (
              <p className="text-red-500 text-sm mt-1">{errors.appointment_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Hora
            </label>
            <select
              value={formData.appointment_time}
              onChange={(e) => handleChange('appointment_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.appointment_time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una hora</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.appointment_time && (
              <p className="text-red-500 text-sm mt-1">{errors.appointment_time}</p>
            )}
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración (minutos)
          </label>
          <select
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>1 hora</option>
            <option value={90}>1.5 horas</option>
          </select>
        </div>

        {/* Tipo de Cita */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cita
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="consultation">Consulta</option>
            <option value="follow_up">Seguimiento</option>
            <option value="routine_check">Control de Rutina</option>
            <option value="emergency">Emergencia</option>
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas del Médico
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales para la cita..."
          />
        </div>

        {user?.role === 'patient' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la Consulta
            </label>
            <textarea
              value={formData.patient_notes}
              onChange={(e) => handleChange('patient_notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe brevemente el motivo de tu consulta..."
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Cita'}
          </button>
        </div>
      </form>
    </div>
  );
}