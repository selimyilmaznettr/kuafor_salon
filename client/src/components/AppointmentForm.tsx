import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema, type InsertAppointment, type Customer } from "@shared/schema";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/use-appointments";
import { useCustomers } from "@/hooks/use-customers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { format } from "date-fns";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: InsertAppointment & { id: number }; 
  preselectedCustomerId?: number;
}

export function AppointmentForm({ 
  open, 
  onOpenChange, 
  appointment, 
  preselectedCustomerId 
}: AppointmentFormProps) {
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  
  // Need customers list for the dropdown
  const { data: customers = [] } = useCustomers();

  const isEditing = !!appointment;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerId: preselectedCustomerId || 0,
      serviceType: "",
      appointmentTime: new Date(),
      status: "scheduled",
      price: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (appointment) {
        form.reset({
          customerId: appointment.customerId,
          serviceType: appointment.serviceType,
          appointmentTime: new Date(appointment.appointmentTime),
          status: appointment.status,
          price: appointment.price || 0,
          notes: appointment.notes || "",
        });
      } else {
        form.reset({
          customerId: preselectedCustomerId || undefined,
          serviceType: "",
          appointmentTime: new Date(),
          status: "scheduled",
          price: 0,
          notes: "",
        });
      }
    }
  }, [open, appointment, preselectedCustomerId, form]);

  const onSubmit = (data: InsertAppointment) => {
    // Ensure date object
    const formattedData = {
      ...data,
      appointmentTime: new Date(data.appointmentTime),
      price: Number(data.price),
      customerId: Number(data.customerId)
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: appointment.id, ...formattedData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(formattedData, { onSuccess: () => onOpenChange(false) });
    }
  };

  // Convert "datetime-local" input string to Date and back
  const formatDateTimeLocal = (date: Date | string) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {isEditing ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
          <DialogDescription>
            Schedule a service for a customer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                    disabled={!!preselectedCustomerId && !isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c: Customer) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.fullName} ({c.phoneNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Haircut, Color" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0.00" 
                        className="rounded-xl" 
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        className="rounded-xl"
                        value={formatDateTimeLocal(field.value)}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Special instructions..." 
                      className="rounded-xl min-h-[80px] resize-none" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white min-w-[100px]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isEditing ? "Save Changes" : "Schedule"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
