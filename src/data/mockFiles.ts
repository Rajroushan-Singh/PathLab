export interface FileRecord {
  id: string;
  fileName: string;
  fileType: "PDF" | "Image" | "DICOM" | "Lab Report" | "Prescription";
  uploadDate: string;
  category: "consent" | "non-consent";
  status: "Final" | "Pending" | "Processing";
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    consentStatus: "Granted" | "Awaiting" | "Expired";
    registrationDate: string;
  };
  doctor: string;
  size: string;
}

export const mockFiles: FileRecord[] = [
  {
    id: "GR001",
    fileName: "Complete Blood Count (CBC)",
    fileType: "Lab Report",
    uploadDate: "2024-04-12",
    category: "consent",
    status: "Final",
    user: { id: "U001", name: "Sunita Sharma", email: "sunita.sharma@email.com", phone: "+91-9876543210", consentStatus: "Granted", registrationDate: "2024-01-15" },
    doctor: "Dr. Mehta",
    size: "1.2 MB",
  },
  {
    id: "GR002",
    fileName: "Lipid Profile Report",
    fileType: "Lab Report",
    uploadDate: "2024-04-11",
    category: "consent",
    status: "Final",
    user: { id: "U002", name: "Vikram Malhotra", email: "vikram.m@email.com", phone: "+91-9876543211", consentStatus: "Granted", registrationDate: "2024-02-10" },
    doctor: "Dr. Mehta",
    size: "890 KB",
  },
  {
    id: "GR003",
    fileName: "Chest X-Ray Scan",
    fileType: "Image",
    uploadDate: "2024-04-10",
    category: "non-consent",
    status: "Final",
    user: { id: "U003", name: "Ananya Iyer", email: "ananya.iyer@email.com", phone: "+91-9876543212", consentStatus: "Expired", registrationDate: "2023-12-05" },
    doctor: "Dr. Khanna",
    size: "4.5 MB",
  },
  {
    id: "GR004",
    fileName: "HbA1c Diabetes Screening",
    fileType: "Lab Report",
    uploadDate: "2024-04-08",
    category: "consent",
    status: "Final",
    user: { id: "U004", name: "Rajesh Gupte", email: "rajesh.g@email.com", phone: "+91-9876543213", consentStatus: "Granted", registrationDate: "2024-01-20" },
    doctor: "Dr. Mehta",
    size: "1.1 MB",
  },
  {
    id: "GR005",
    fileName: "Thyroid Profile (T3, T4, TSH)",
    fileType: "Lab Report",
    uploadDate: "2024-04-05",
    category: "non-consent",
    status: "Final",
    user: { id: "U005", name: "Priyanka Das", email: "priyanka.d@email.com", phone: "+91-9876543214", consentStatus: "Awaiting", registrationDate: "2024-03-01" },
    doctor: "Dr. Iyer",
    size: "950 KB",
  },
  {
    id: "GR006",
    fileName: "MRI Lumbar Spine",
    fileType: "DICOM",
    uploadDate: "2024-04-04",
    category: "consent",
    status: "Pending",
    user: { id: "U006", name: "Arjun Malhotra", email: "arjun.m@email.com", phone: "+91-9876543215", consentStatus: "Granted", registrationDate: "2024-02-14" },
    doctor: "Dr. Sharma",
    size: "12.3 MB",
  },
  {
    id: "GR007",
    fileName: "COVID-19 RT-PCR Result",
    fileType: "Lab Report",
    uploadDate: "2024-04-03",
    category: "non-consent",
    status: "Final",
    user: { id: "U007", name: "Meera Nair", email: "meera.n@email.com", phone: "+91-9876543216", consentStatus: "Expired", registrationDate: "2024-01-08" },
    doctor: "Dr. Khanna",
    size: "320 KB",
  },
  {
    id: "GR008",
    fileName: "Liver Function Test Report",
    fileType: "Lab Report",
    uploadDate: "2024-04-02",
    category: "consent",
    status: "Processing",
    user: { id: "U001", name: "Sunita Sharma", email: "sunita.sharma@email.com", phone: "+91-9876543210", consentStatus: "Granted", registrationDate: "2024-01-15" },
    doctor: "Dr. Mehta",
    size: "780 KB",
  },
  {
    id: "GR009",
    fileName: "Echocardiogram Report",
    fileType: "PDF",
    uploadDate: "2024-03-28",
    category: "consent",
    status: "Final",
    user: { id: "U008", name: "Rahul Sharma", email: "rahul.s@email.com", phone: "+91-9876543217", consentStatus: "Granted", registrationDate: "2024-02-20" },
    doctor: "Dr. Iyer",
    size: "2.4 MB",
  },
  {
    id: "GR010",
    fileName: "Prescription - Hypertension",
    fileType: "Prescription",
    uploadDate: "2024-03-25",
    category: "non-consent",
    status: "Final",
    user: { id: "U009", name: "Priya Patel", email: "priya.p@email.com", phone: "+91-9876543218", consentStatus: "Granted", registrationDate: "2024-01-25" },
    doctor: "Dr. Sharma",
    size: "150 KB",
  },
  {
    id: "GR011",
    fileName: "Ultrasound Abdomen",
    fileType: "Image",
    uploadDate: "2024-03-22",
    category: "consent",
    status: "Final",
    user: { id: "U010", name: "Anish Gupta", email: "anish.g@email.com", phone: "+91-9876543219", consentStatus: "Expired", registrationDate: "2024-02-03" },
    doctor: "Dr. Mehta",
    size: "6.8 MB",
  },
  {
    id: "GR012",
    fileName: "Urine Culture Report",
    fileType: "Lab Report",
    uploadDate: "2024-03-20",
    category: "non-consent",
    status: "Final",
    user: { id: "U002", name: "Vikram Malhotra", email: "vikram.m@email.com", phone: "+91-9876543211", consentStatus: "Granted", registrationDate: "2024-02-10" },
    doctor: "Dr. Khanna",
    size: "420 KB",
  },
];
