export type UserRole = 'patient' | 'doctor' | 'lab_assistant' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  address?: string;
  createdAt: string;
}

export interface PatientUser extends User {
  role: 'patient';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface HealthcareWorkerUser extends User {
  role: 'doctor' | 'lab_assistant';
  licenseNumber: string;
  department?: string;
  specialization?: string;
  hospital?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}