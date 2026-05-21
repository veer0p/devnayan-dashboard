const fs = require('fs');
const path = require('path');

const directory = './src';

const filesToUpdate = [
  'pages/Profile.jsx',
  'pages/Billing.jsx',
  'pages/Help.jsx',
  'pages/Appointments.jsx',
  'pages/Dashboard.jsx',
  'pages/PublicPayment.jsx',
  'pages/Inquiries.jsx',
  'data/doctors.js',
  'data/patients.js',
  'components/ui/WhatsAppMessageDialog.jsx',
  'components/billing/InvoiceTemplate.jsx',
  'components/billing/InvoiceDrawer.jsx',
  'components/billing/PaymentDialog.jsx',
  'components/patients/PatientDrawer.jsx',
  'components/patients/PatientTable.jsx',
  'components/appointments/AppointmentPanel.jsx',
  'components/layout/AppLayout.jsx',
  'components/layout/Sidebar.jsx',
  'components/layout/MobileBottomNav.jsx'
];

filesToUpdate.forEach(filePath => {
  const absolutePath = path.join(directory, filePath);
  if (!fs.existsSync(absolutePath)) return;
  
  let content = fs.readFileSync(absolutePath, 'utf8');
  let originalContent = content;

  // Insert context hook if not present (only for components/pages, not data)
  if (filePath.endsWith('.jsx') && filePath !== 'pages/Inquiries.jsx' && !content.includes('useClinic')) {
      const relativeContextPath = filePath.startsWith('pages/') ? '../context/ClinicContext' : '../../context/ClinicContext';
      
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
          const endOfLine = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfLine + 1) + `import { useClinic } from '${relativeContextPath}';\n` + content.slice(endOfLine + 1);
      } else {
          content = `import { useClinic } from '${relativeContextPath}';\n` + content;
      }

      const componentRegex = /(export default function \w+\([^)]*\)\s*{|export default function\s*\([^)]*\)\s*{|const \w+\s*=\s*\([^)]*\)\s*=>\s*{)/g;
      content = content.replace(componentRegex, (match) => {
          if (!content.includes('const { clinic } = useClinic();')) {
              return match + '\n  const { clinic } = useClinic();';
          }
          return match;
      });
  }

  // Common replacements
  content = content.replace(/Devnayan Dental Clinic/g, '${clinic.name}');
  content = content.replace(/'Devnayan Dental Clinic'/g, 'clinic.name');
  content = content.replace(/"Devnayan Dental Clinic"/g, 'clinic.name');
  content = content.replace(/>Devnayan</g, '>{clinic.name.split(" ")[0]}<');
  content = content.replace(/Dr\. Chintan Sayania/g, '${clinic.doctorName}');
  content = content.replace(/'Dr\. Chintan Sayania'/g, 'clinic.doctorName');
  content = content.replace(/>Dr\. Chintan</g, '>{clinic.doctorName.split(" ")[0] + " " + clinic.doctorName.split(" ")[1]}<');
  content = content.replace(/Dr\. Chintan/g, '${clinic.doctorName.split(" ")[0] + " " + clinic.doctorName.split(" ")[1]}');

  if (content !== originalContent) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
