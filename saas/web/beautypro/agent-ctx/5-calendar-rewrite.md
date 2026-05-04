# Task ID: 5 - Calendar/Agenda Component Rewrite

## Agent: Calendar Rewrite Agent

## Task
Rewrite `/src/components/beauty-pro/calendar/calendar-view.tsx` to support full CRUD operations (Add, Edit, Delete appointments), drag-to-reschedule, and responsive design.

## Work Log

### 1. Analyzed Existing Codebase
- Read existing `calendar-view.tsx` — had basic weekly view with drag-and-drop reschedule and a simple detail dialog
- Read `store.ts` — confirmed `appointmentDialogOpen`, `setAppointmentDialogOpen`, `editingAppointmentId`, `setEditingAppointmentId` fields already added
- Read `hooks.ts` — confirmed `useCalendarData`, `useProfessionals`, `useClients`, `useServices` hooks available
- Read appointments API route — confirmed GET, POST, PUT, DELETE endpoints working
- Read existing form dialog patterns (client-form-dialog, automation-form-dialog) for consistency

### 2. Rewrote calendar-view.tsx with Three Sub-components

#### AppointmentFormDialog
- Internal component for creating/editing appointments
- Uses `react-hook-form` + `zod` for form validation
- Fields: Client (Select dropdown), Professional (Select dropdown with color indicator), Services (Checkbox groups by category), Date (Popover + Calendar picker), Start Time (Select with 30-min slots), End Time (auto-calculated from service durations), Notes (Textarea)
- Auto-calculates end time when services or start time change
- Pre-populates form when editing an existing appointment
- Uses `useAppStore` for dialog state (`appointmentDialogOpen`, `editingAppointmentId`)
- After save, invalidates `['calendar']` and `['dashboard']` query keys

#### AppointmentDetailDialog
- Shows all appointment info: client, date, time/duration, professional, services, status, notes
- Has "Editar" button that opens the form dialog in edit mode
- Has "Excluir" button that opens the delete confirmation
- Keeps the "Arraste no calendário para remarcar" hint

#### Main CalendarView
- Added "Novo Agendamento" button next to professional filter tabs
- Kept existing weekly time grid with drag-and-drop
- Kept reschedule confirmation dialog
- Added AlertDialog for delete confirmation with loading state
- Wired up appointment click → detail dialog → edit/delete flows
- Uses `useAppStore` for appointment dialog state management

### 3. Key Features Implemented
- ✅ **Add new appointment** — "Novo Agendamento" button opens form dialog
- ✅ **Edit appointment** — Detail dialog "Editar" button opens form in edit mode
- ✅ **Delete appointment** — Detail dialog "Excluir" button → AlertDialog confirmation
- ✅ **Drag-to-reschedule** — Kept existing DnD functionality
- ✅ **Responsive design** — ScrollArea, min-widths, flex-wrap for filters
- ✅ **Form validation** — Zod schema + react-hook-form
- ✅ **Auto-calculated end time** — Based on selected service durations
- ✅ **Service selection** — Checkboxes grouped by category with duration display
- ✅ **Date picker** — Calendar popover with Portuguese locale
- ✅ **Query invalidation** — Both `['calendar']` and `['dashboard']` after mutations

### 4. Lint Check
All lint checks pass. Server stable on port 3000.
