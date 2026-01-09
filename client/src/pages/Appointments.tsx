import { useAppointments } from "@/hooks/use-appointments";
import { useCustomers } from "@/hooks/use-customers";
import { useState } from "react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  Edit
} from "lucide-react";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAppointment } from "@/hooks/use-appointments";
import { type Appointment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarView } from "@/components/CalendarView";

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // We fetch all appointments for now (in a real app, filtering by month/week is better)
  const { data: appointments, isLoading: appsLoading } = useAppointments();
  const { data: customers } = useCustomers();
  const deleteMutation = useDeleteAppointment();

  // Simple Week Calendar View Logic
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  const filteredAppointments = appointments?.filter(app =>
    isSameDay(new Date(app.appointmentTime), selectedDate)
  ) || [];

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const getCustomerName = (id: number) => {
    return customers?.find(c => c.id === id)?.fullName || "Unknown";
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-foreground">Randevular</h1>
          <p className="text-muted-foreground mt-1">Randevu takviminizi yönetin.</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Randevu
        </Button>
      </div>

      <div className="flex-1 overflow-hidden h-full">
        <CalendarView
          appointments={appointments || []}
          onSelectEvent={(app) => setEditingAppt(app)}
          onSelectSlot={() => setIsCreateOpen(true)}
          isLoading={appsLoading}
        />
      </div>

      {/* Modals */}
      <AppointmentForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      // If clicking create on a specific day, could pre-fill date here
      />

      {editingAppt && (
        <AppointmentForm
          open={!!editingAppt}
          onOpenChange={(open) => !open && setEditingAppt(undefined)}
          appointment={editingAppt}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu İptal Et?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem randevuyu takvimden kaldıracaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Randevuyu İptal Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}
