/*
  # MVP Schema for Medical Platform

  1. New Tables
    - `medical_specialties` - Catálogo de especialidades médicas
    - `appointments` - Citas médicas básicas
    - `medical_records` - Historiales médicos simples
    - `clinic_settings` - Configuración básica del consultorio

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles

  3. Seed Data
    - Insert basic medical specialties for MVP
*/

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del consultorio
CREATE TABLE IF NOT EXISTS clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  clinic_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
  appointment_duration INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas médicas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  specialty_id UUID REFERENCES medical_specialties(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  type VARCHAR(50) DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow_up', 'emergency', 'routine_check')),
  notes TEXT,
  patient_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historiales médicos básicos
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Policies for medical_specialties (public read)
CREATE POLICY "Anyone can read medical specialties"
  ON medical_specialties
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for clinic_settings
CREATE POLICY "Doctors can manage their clinic settings"
  ON clinic_settings
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- Policies for appointments
CREATE POLICY "Users can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctors can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Policies for medical_records
CREATE POLICY "Users can view their own medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctors can manage medical records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (doctor_id = auth.uid());

-- Insert basic medical specialties for MVP
INSERT INTO medical_specialties (name, code, description, icon) VALUES
('Medicina General', 'GENERAL', 'Atención médica integral y preventiva', '🩺'),
('Odontología', 'DENTISTRY', 'Cuidado dental y oral', '🦷'),
('Dermatología', 'DERMATOLOGY', 'Cuidado de la piel', '🧴'),
('Pediatría', 'PEDIATRICS', 'Atención médica para niños', '👶'),
('Ginecología', 'GYNECOLOGY', 'Salud femenina y reproductiva', '👩‍⚕️'),
('Cardiología', 'CARDIOLOGY', 'Cuidado del corazón', '❤️'),
('Oftalmología', 'OPHTHALMOLOGY', 'Cuidado de los ojos', '👁️'),
('Psicología', 'PSYCHOLOGY', 'Salud mental y bienestar', '🧠')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON medical_records(doctor_id);