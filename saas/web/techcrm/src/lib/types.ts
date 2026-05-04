export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'frontend' | 'backend' | 'qa' | 'devops' | 'data' | 'ia';
  thumbnail?: string;
  duration: number;
  price: number;
  status: 'draft' | 'published' | 'archived';
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  name: string;
  description?: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  videoUrl?: string;
  duration: number;
  order: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  completedAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  method: 'credit_card' | 'boleto' | 'pix';
  description?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'website' | 'referral' | 'social' | 'ads';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  notes?: string;
  value: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Automation {
  id: string;
  name: string;
  type: 'email' | 'notification' | 'webhook';
  trigger: string;
  action: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export type CRMPage = 'dashboard' | 'students' | 'courses' | 'enrollments' | 'financial' | 'pipeline' | 'reports' | 'automations' | 'settings';
