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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your schedule efficiently.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Calendar Strip (Simplified for this demo) */}
        <div className="lg:col-span-12 bg-white rounded-3xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display">{format(selectedDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-200
                    ${isSelected 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 font-bold" 
                      : "bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }
                    ${isTodayDate && !isSelected ? "border-2 border-primary/50 text-primary" : ""}
                  `}
                >
                  <span className="text-xs uppercase mb-1 opacity-70">{format(day, "EEE")}</span>
                  <span className="text-lg md:text-2xl">{format(day, "d")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="lg:col-span-12">
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Schedule for {format(selectedDate, "EEEE, MMMM do")}
          </h3>

          {appsLoading ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
             </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white/50 border border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center">
               <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <p className="text-lg font-medium text-foreground">No appointments scheduled</p>
               <p className="text-muted-foreground mb-6">You have a free day! Relax or add a new booking.</p>
               <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Schedule Now</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments
                .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
                .map((app) => (
                <div 
                  key={app.id}
                  className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative group"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* Actions */}
                     <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingAppt(app)}>
                         <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeletingId(app.id)}>
                         <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                       </Button>
                     </div>
                  </div>

                  <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-border/50 pr-6">
                    <span className="text-3xl font-bold text-primary font-display">
                      {format(new Date(app.appointmentTime), "h:mm")}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground uppercase">
                      {format(new Date(app.appointmentTime), "a")}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-bold">{getCustomerName(app.customerId)}</h4>
                    <p className="text-lg text-primary/80 font-medium mb-2">{app.serviceType}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        app.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                      {app.price && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          ${app.price}
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="mt-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                        Note: {app.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the appointment from the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Cancel Appointment
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
