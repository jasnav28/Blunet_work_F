export type Role = 'EMPLOYEE' | 'MARKETING_HEAD' | 'ADMIN' | 'FOUNDER';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export type LeadStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'CALLING'
  | 'RESPONSE_PENDING'
  | 'COMPLETED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'FOLLOW_UP'
  | 'WRONG_NUMBER'
  | 'NO_ANSWER'
  | 'CLOSED';

export interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  designation: string;
  department?: { id: string; name: string; code: string } | null;
  joiningDate: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignedBy: { id: string; name: string; employeeId: string };
  assignedTo?: { id: string; name: string; employeeId: string; designation?: string };
  comments?: TaskComment[];
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  author: { id: string; name: string; employeeId: string };
  content: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  version: string;
  visibility: string;
  category: { id: string; name: string };
  fileUpload: { originalName: string; size: number; mimeType: string };
  uploadedBy: { name: string };
  createdAt: string;
}

export interface Lead {
  id: string;
  sequenceNumber: number;
  campaignId: string;
  businessName: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: LeadStatus;
  calls?: any[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface MarketingAnalytics {
  target: {
    month: number;
    year: number;
    targetLeads: number;
    targetCalls: number;
    targetDeals: number;
    targetRevenue: number;
  };
  achieved: {
    totalLeads: number;
    completedCalls: number;
    interestedLeads: number;
    followUpLeads: number;
    closedDeals: number;
    revenue: number;
    progressPercentage: number;
  };
  statusBreakdown: { status: string; count: number }[];
}

export interface CompanyReport {
  employees: { total: number; active: number };
  tasks: { total: number; completed: number; overdue: number; completionRate: number };
  marketing: {
    totalLeads: number;
    totalCalls: number;
    interestedLeads: number;
    closedDeals: number;
    revenue: number;
    targetRevenue: number;
    targetAchievement: number;
  };
}
