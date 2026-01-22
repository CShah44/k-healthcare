import { Colors } from '@/constants/Colors';
import { TestTube2, Pill, FileImage, FileText } from 'lucide-react-native';

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 16) return 'Good afternoon';
  return 'Good evening';
}

export function getRecordIcon(type: string, source?: string, colors?: any) {
  if (source === 'lab_uploaded') {
    return { icon: TestTube2, color: Colors.medical.green };
  }
  switch (type) {
    case 'prescriptions':
      return { icon: Pill, color: Colors.medical.orange };
    case 'uploaded':
      return { icon: FileImage, color: Colors.primary };
    case 'lab_reports':
      return { icon: TestTube2, color: Colors.medical.green };
    case 'imaging':
      return { icon: FileText, color: Colors.medical.blue };
    default:
      return { icon: FileText, color: colors?.textSecondary || Colors.primary };
  }
}

export function getStatusColor(status?: string, colors?: any) {
  if (!status) return colors?.textSecondary || Colors.primary;
  switch (status.toLowerCase()) {
    case 'normal':
    case 'reviewed':
      return Colors.medical.green;
    case 'high':
    case 'critical':
      return Colors.medical.red;
    case 'active':
      return Colors.medical.blue;
    case 'archived':
      return colors?.textSecondary || Colors.primary;
    default:
      return colors?.textSecondary || Colors.primary;
  }
}

export function formatDate(uploadedAt: any) {
  if (!uploadedAt) return 'N/A';
  let date: Date;
  if (uploadedAt.toDate) {
    date = uploadedAt.toDate();
  } else if (uploadedAt.seconds) {
    date = new Date(uploadedAt.seconds * 1000);
  } else if (uploadedAt instanceof Date) {
    date = uploadedAt;
  } else {
    return 'N/A';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
} 