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

  // fix >${var}< to >{var}<
  content = content.replace(/>\$\{([^}]+)\}</g, '>{$1}<');
  
  if (content !== originalContent) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Fixed JSX braces: ${filePath}`);
  }
});
