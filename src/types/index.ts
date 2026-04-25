export type ServiceType =
  | "תסרוקת"
  | "צביעה"
  | "איפור"
  | "איפור כלה"
  | "טיפול שיער"
  | "הארכות"
  | "אחר";

export type LeadStage =
  | "new"
  | "quoted"
  | "booked"
  | "done"
  | "followup";

export type LeadSource =
  | "whatsapp"
  | "instagram"
  | "referral"
  | "returning"
  | "other";

export interface AppointmentRecord {
  id: string;
  date: string;
  service: ServiceType;
  amount: number;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service: ServiceType;
  stage: LeadStage;
  source: LeadSource;
  appointmentDate?: string; // ISO string
  followUpDate?: string;    // ISO string
  reminderAt?: string;      // ISO string — when to fire reminder notification
  notes?: string;
  referredBy?: string;
  amountPaid?: number;
  history: AppointmentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  businessName: string;
  ownerName: string;
  language: "he" | "en";
}

export const STAGE_ORDER: LeadStage[] = [
  "new",
  "quoted",
  "booked",
  "done",
  "followup",
];

export const SERVICE_TYPES: ServiceType[] = [
  "תסרוקת",
  "צביעה",
  "איפור",
  "איפור כלה",
  "טיפול שיער",
  "הארכות",
  "אחר",
];

export const LEAD_SOURCES: LeadSource[] = [
  "whatsapp",
  "instagram",
  "referral",
  "returning",
  "other",
];
