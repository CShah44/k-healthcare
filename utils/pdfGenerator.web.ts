import { jsPDF } from 'jspdf';

export interface PrescriptionData {
  doctor: {
    firstName?: string;
    lastName?: string;
    specialty?: string;
    hospital?: string;
    licenseNumber?: string;
    letterheadUrl?: string;
    letterheadBase64?: string;
  };
  patient: {
    name: string;
    age: string;
    uid?: string;
  };
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  date: string;
}

export async function generatePrescriptionPdf(
  data: PrescriptionData,
): Promise<{ uri: string; blob?: Blob }> {
  const doc = new jsPDF();
  const { doctor, patient, diagnosis, medications, notes, date } = data;

  // 1. Header & Logo
  // 1. Header & Logo
  if (doctor?.letterheadBase64) {
    try {
      doc.addImage(doctor.letterheadBase64, 'JPEG', 15, 15, 180, 40);
    } catch (e) {
      console.warn('Could not add letterhead image', e);
    }
  } else if (doctor?.letterheadUrl) {
    try {
      // Checking if letterheadUrl is a base64 string or a valid URL we can fetch
      // For simplicity, we'll skip complex image loading here unless it's already base64
      // doc.addImage(doctor.letterheadUrl, 'JPEG', 15, 15, 180, 40);
    } catch (e) {
      console.warn('Could not add letterhead image', e);
    }
  }

  // Doctor Details (Right aligned)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}`,
    200,
    20,
    { align: 'right' },
  );
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(doctor?.specialty || 'General Physician', 200, 26, {
    align: 'right',
  });
  doc.text(doctor?.hospital || '', 200, 31, { align: 'right' });
  doc.text(`Reg. No: ${doctor?.licenseNumber || 'N/A'}`, 200, 36, {
    align: 'right',
  });

  // Patient Details
  doc.setLineWidth(0.5);
  doc.line(10, 45, 200, 45); // Divider

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 10, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.name, 40, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('Age/Gender:', 10, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.age || 'N/A', 40, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 150, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(date, 170, 55);

  // Diagnosis
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSIS', 10, 80);
  doc.setLineWidth(0.2);
  doc.line(10, 82, 35, 82);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(diagnosis || 'No diagnosis specified', 10, 90);

  // Medications
  let yPos = 110;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Rx / MEDICATIONS', 10, yPos);
  doc.line(10, yPos + 2, 50, yPos + 2);
  yPos += 15;

  if (medications.length > 0) {
    // Table Header
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    doc.text('Medicine', 12, yPos);
    doc.text('Dosage', 80, yPos);
    doc.text('Frequency', 120, yPos);
    doc.text('Duration', 160, yPos);
    yPos += 10;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    medications.forEach((med) => {
      doc.text(med.name, 12, yPos);
      doc.text(med.dosage, 80, yPos);
      doc.text(med.frequency, 120, yPos);
      doc.text(med.duration, 160, yPos);
      yPos += 10;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No medications prescribed.', 10, yPos);
    yPos += 10;
  }

  // Notes
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL NOTES', 10, yPos);
  doc.line(10, yPos + 2, 45, yPos + 2);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitNotes = doc.splitTextToSize(notes || 'No additional notes.', 190);
  doc.text(splitNotes, 10, yPos);

  // Footer / Signature
  doc.text("Doctor's Signature", 160, 270, { align: 'center' });
  doc.line(140, 265, 180, 265);

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Computer generated prescription.', 105, 285, {
    align: 'center',
  });

  const blob = doc.output('blob');
  const uri = URL.createObjectURL(blob); // For download/preview on web

  return { uri, blob };
}
