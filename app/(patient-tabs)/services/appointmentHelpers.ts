import React from 'react';
import { Colors } from '@/constants/Colors';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react-native';

// Appointment status helpers
export function getStatusIcon(status: string, colors: any) {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return React.createElement(CheckCircle, {
        size: 16,
        color: Colors.medical.green,
        strokeWidth: 2,
      });
    case 'pending':
      return React.createElement(AlertCircle, {
        size: 16,
        color: Colors.medical.orange,
        strokeWidth: 2,
      });
    default:
      return React.createElement(Clock, {
        size: 16,
        color: colors.textSecondary,
        strokeWidth: 2,
      });
  }
}

export function getStatusColor(status: string, colors: any) {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return Colors.medical.green;
    case 'pending':
      return Colors.medical.orange;
    default:
      return colors.textSecondary;
  }
}

// Appointment filtering
export function filterAppointments(
  appointments: any[],
  selectedTab: 'upcoming' | 'past'
) {
  const now = new Date();
  
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
    
    if (selectedTab === 'upcoming') {
      return appointmentDate > now;
    } else {
      return appointmentDate <= now;
    }
  });
}

// Appointment sorting
export function sortAppointments(appointments: any[]) {
  return appointments.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA.getTime() - dateB.getTime();
  });
}

// Format appointment time
export function formatAppointmentTime(time: string) {
  return time; // Already formatted as "10:30 AM"
}

// Format appointment date
export function formatAppointmentDate(date: string) {
  const appointmentDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (appointmentDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
} 