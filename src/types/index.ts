export type UserRole = "SUPER_ADMIN" | "COMPANY_ADMIN" | "MANAGER" | "EMPLOYEE";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "WORK_FROM_HOME";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SubscriptionPlan = "FREE_TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: string;
  maxEmployees?: number;
  planLocked?: boolean;
  unlockCode?: string;
  branches?: Branch[];
  departments?: Department[];
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  latitude: number | string;
  longitude: number | string;
  radiusMeters: number;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  managerId?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Shift {
  id: string;
  organizationId: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  workingDays: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  userId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "TERMINATED";
  branchId?: string;
  departmentId?: string;
  shiftId?: string;
  ctc?: number;
  branch?: Branch;
  department?: Department;
  shift?: Shift;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organization?: Organization;
  employee?: Employee;
  planLocked?: boolean;
  mustChangePassword?: boolean;
}

export interface BreakRecord {
  id?: string;
  start: string;
  end?: string | null;
  durationMinutes?: number;
}

export interface Attendance {
  id: string;
  organizationId: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  isWorkFromHome?: boolean;
  wfhNote?: string;
  totalBreakMinutes?: number;
  breaks?: BreakRecord[];
  checkInLatitude?: number;
  checkInLongitude?: number;
  employee?: Employee;
}

export interface AttendanceTodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isOnBreak: boolean;
  isWorkFromHome: boolean;
  attendance?: Attendance;
  currentBreak?: BreakRecord;
  shift?: Shift;
  totalBreakMinutes?: number;
  workedMinutesToday?: number;
}

export interface AttendanceCorrection {
  id: string;
  attendanceId: string;
  employeeId: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: RequestStatus;
  reviewNote?: string;
  createdAt: string;
  employee?: Employee;
  attendance?: Attendance;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  daysAllowed: number;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  leaveType?: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay?: boolean;
  reason: string;
  status: RequestStatus;
  reviewNote?: string;
  createdAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
}

export interface CompOffBalance {
  id: string;
  employeeId: string;
  balanceDays: number;
  earnedDate?: string;
  expiryDate?: string;
}

export interface CompOffRedemption {
  id: string;
  employeeId: string;
  requestedDate: string;
  days: number;
  reason?: string;
  status: RequestStatus;
  createdAt: string;
  employee?: Employee;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  attendanceId?: string;
  date: string;
  hours: number;
  reason?: string;
  status: RequestStatus;
  reviewNote?: string;
  createdAt: string;
  employee?: Employee;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medicalAllowance: number;
  specialAllowance: number;
  pfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
}

export interface Payslip {
  id: string;
  payrollBatchId?: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  totalDeductions: number;
  lopDeduction: number;
  overtimePay: number;
  netSalary: number;
  status: "DRAFT" | "GENERATED" | "APPROVED" | "PAID";
  paidAt?: string;
  createdAt: string;
  employee?: Employee;
}

export interface PayrollBatch {
  id: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalNetPayout: number;
  status: "DRAFT" | "PROCESSED" | "APPROVED" | "DISBURSED";
  payslips?: Payslip[];
  createdAt: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  category: "TRAVEL" | "FOOD" | "ACCOMMODATION" | "SUPPLIES" | "UTILITIES" | "MISCELLANEOUS";
  amount: number;
  currency: string;
  receiptUrl?: string;
  description: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PAID";
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  employee?: Employee;
}

export interface OnboardingCandidate {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  branchId?: string;
  designation: string;
  offeredSalary: number;
  joiningDate?: string;
  status: "APPLIED" | "INTERVIEWING" | "OFFERED" | "ACCEPTED" | "REJECTED" | "ONBOARDED";
  portalToken: string;
  offerLetterUrl?: string;
  offerExpiresAt?: string;
  documents?: CandidateDocument[];
  department?: Department;
  branch?: Branch;
  createdAt: string;
}

export interface CandidateDocument {
  id: string;
  candidateId: string;
  documentType: "AADHAAR" | "PAN" | "DEGREE_CERTIFICATE" | "RELIEVING_LETTER" | "OTHER";
  fileUrl: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunicationStatus {
  success: boolean;
  email: {
    isConfigured: boolean;
    provider: string;
    status: boolean;
    from: string;
  };
  whatsapp: {
    isConfigured: boolean;
    provider: string;
    senderNumber: string;
    mode: "LIVE" | "SIMULATION";
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}
