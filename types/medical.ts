export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  labAssistantId?: string;
  date: string;
  type: 'consultation' | 'lab_result' | 'prescription' | 'imaging' | 'surgery';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  labResults?: LabResult[];
  attachments?: Attachment[];
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit?: string;
  normalRange?: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}
