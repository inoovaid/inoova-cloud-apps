import { create } from 'zustand';
import { Student, Course, Enrollment, Payment, Lead, Automation, Notification } from '@/lib/types';
import {
  MOCK_STUDENTS,
  MOCK_COURSES,
  MOCK_ENROLLMENTS,
  MOCK_PAYMENTS,
  MOCK_LEADS,
  MOCK_AUTOMATIONS,
  MOCK_NOTIFICATIONS,
} from '@/lib/mock-data';

const cuid = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

interface DataState {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
  leads: Lead[];
  automations: Automation[];
  notifications: Notification[];

  // Students
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Courses
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'modules'>) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Enrollments
  addEnrollment: (enrollment: Omit<Enrollment, 'id'>) => void;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => void;
  deleteEnrollment: (id: string) => void;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // Automations
  addAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => void;
  updateAutomation: (id: string, data: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useDataStore = create<DataState>((set) => ({
  students: MOCK_STUDENTS,
  courses: MOCK_COURSES,
  enrollments: MOCK_ENROLLMENTS,
  payments: MOCK_PAYMENTS,
  leads: MOCK_LEADS,
  automations: MOCK_AUTOMATIONS,
  notifications: MOCK_NOTIFICATIONS,

  addStudent: (data) => set((s) => ({
    students: [...s.students, { ...data, id: `student-${cuid()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateStudent: (id, data) => set((s) => ({
    students: s.students.map((st) => st.id === id ? { ...st, ...data, updatedAt: new Date().toISOString() } : st),
  })),
  deleteStudent: (id) => set((s) => ({
    students: s.students.filter((st) => st.id !== id),
  })),

  addCourse: (data) => set((s) => ({
    courses: [...s.courses, { ...data, id: `course-${cuid()}`, modules: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateCourse: (id, data) => set((s) => ({
    courses: s.courses.map((c) => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c),
  })),
  deleteCourse: (id) => set((s) => ({
    courses: s.courses.filter((c) => c.id !== id),
  })),

  addEnrollment: (data) => set((s) => ({
    enrollments: [...s.enrollments, { ...data, id: `enrollment-${cuid()}` }],
  })),
  updateEnrollment: (id, data) => set((s) => ({
    enrollments: s.enrollments.map((e) => e.id === id ? { ...e, ...data } : e),
  })),
  deleteEnrollment: (id) => set((s) => ({
    enrollments: s.enrollments.filter((e) => e.id !== id),
  })),

  addPayment: (data) => set((s) => ({
    payments: [...s.payments, { ...data, id: `payment-${cuid()}`, createdAt: new Date().toISOString() }],
  })),
  updatePayment: (id, data) => set((s) => ({
    payments: s.payments.map((p) => p.id === id ? { ...p, ...data } : p),
  })),
  deletePayment: (id) => set((s) => ({
    payments: s.payments.filter((p) => p.id !== id),
  })),

  addLead: (data) => set((s) => ({
    leads: [...s.leads, { ...data, id: `lead-${cuid()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  })),
  updateLead: (id, data) => set((s) => ({
    leads: s.leads.map((l) => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l),
  })),
  deleteLead: (id) => set((s) => ({
    leads: s.leads.filter((l) => l.id !== id),
  })),

  addAutomation: (data) => set((s) => ({
    automations: [...s.automations, { ...data, id: `auto-${cuid()}`, createdAt: new Date().toISOString() }],
  })),
  updateAutomation: (id, data) => set((s) => ({
    automations: s.automations.map((a) => a.id === id ? { ...a, ...data } : a),
  })),
  deleteAutomation: (id) => set((s) => ({
    automations: s.automations.filter((a) => a.id !== id),
  })),

  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),
  addNotification: (data) => set((s) => ({
    notifications: [{ ...data, id: `notif-${cuid()}`, createdAt: new Date().toISOString() }, ...s.notifications],
  })),
}));
