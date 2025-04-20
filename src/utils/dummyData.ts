
// Define types for our data models
export type StatusType = 'waiting' | 'in-progress' | 'completed';

export interface CaseStatus {
  id: string;
  title: string;
  status: StatusType;
  currentStep: string;
  nextSteps: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  needsSignature: boolean;
  signed: boolean;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

// Empty mock data arrays - we're replacing usage with real database data
export const caseStatuses: CaseStatus[] = [];
export const documents: Document[] = [];
export const messages: Message[] = [];
export const payments: Payment[] = [];
export const tasks: Task[] = [];
