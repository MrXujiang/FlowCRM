export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'sales';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  company?: string;
  source?: string;
  tags?: string[];
  remarks?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  leadName: string;
  contactInfo: string;
  stage: 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid';
  intentionLevel?: 'low' | 'medium' | 'high';
  relatedCustomerId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'other';
  date: string;
  notes: string;
  customerId?: string;
  leadId?: string;
  remindDate?: string;
  ownerId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'completed';
  relatedCustomerId?: string;
  relatedLeadId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
