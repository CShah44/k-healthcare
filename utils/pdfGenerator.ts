import { printToFileAsync } from 'expo-print';

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
  const { doctor, patient, diagnosis, medications, notes, date } = data;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .letterhead { width: 100%; max-height: 200px; object-fit: contain; margin-bottom: 20px; }
          .doctor-info { text-align: right; font-size: 12px; color: #666; }
          .patient-info { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #333; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
          th { background-color: #f8f9fa; font-size: 12px; }
          .footer { margin-top: 50px; text-align: right; font-size: 12px; }
          .signature-line { border-top: 1px solid #333; width: 200px; display: inline-block; margin-top: 40px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${
            doctor?.letterheadBase64
              ? `<img src="${doctor.letterheadBase64}" class="letterhead" />`
              : doctor?.letterheadUrl
                ? `<img src="${doctor.letterheadUrl}" class="letterhead" />`
                : ''
          }
          <div class="doctor-info">
            <h2>Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}</h2>
            <p>${doctor?.specialty || 'General Physician'}</p>
            <p>License: ${doctor?.licenseNumber || 'N/A'}</p>
            <p>${doctor?.hospital || ''}</p>
          </div>
        </div>

        <div class="patient-info">
          <p><strong>Patient Name:</strong> ${patient.name}</p>
          <p><strong>Age/Gender:</strong> ${patient.age || 'N/A'}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>

        <div class="section">
          <div class="section-title">Diagnosis</div>
          <p>${diagnosis || 'No specific diagnosis'}</p>
        </div>

        <div class="section">
          <div class="section-title">Medications</div>
          ${
            medications.length > 0
              ? `
            <table>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
              ${medications
                .map(
                  (med) => `
                <tr>
                  <td>${med.name}</td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                </tr>
              `,
                )
                .join('')}
            </table>
          `
              : '<p>No medications prescribed.</p>'
          }
        </div>

        <div class="section">
          <div class="section-title">Notes</div>
          <p>${notes || 'No additional notes'}</p>
        </div>

        <div class="footer">
          <div class="signature-line">
            Doctor's Signature
          </div>
        </div>
      </body>
    </html>
  `;

  const { uri } = await printToFileAsync({
    html,
    base64: false,
  });

  // Native doesn't generate a blob here, uploadHelpers handles uri
  return { uri, blob: undefined };
}
