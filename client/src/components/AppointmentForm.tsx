import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema, type InsertAppointment, type Customer, type Service, type Employee } from "@shared/schema";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/use-appointments";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const createCustomerMutation = useCreateCustomer();

  const { data: customers = [] } = useCustomers();

  // Quick Add Customer State
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"]
  });

  const isEditing = !!appointment;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerId: preselectedCustomerId || 0,
      serviceId: null,
      employeeId: null,
      serviceType: "",
      appointmentTime: new Date(),
      status: "scheduled",
      price: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      setIsCreatingCustomer(false);
      if (appointment) {
        form.reset({
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          employeeId: appointment.employeeId,
          serviceType: appointment.serviceType,
          appointmentTime: new Date(appointment.appointmentTime),
          status: appointment.status,
          price: appointment.price || 0,
          notes: appointment.notes || "",
        });
      } else {
        form.reset({
          customerId: preselectedCustomerId || undefined,
          serviceId: null,
          employeeId: null,
          serviceType: "",
          appointmentTime: new Date(),
          status: "scheduled",
          price: 0,
          notes: "",
        });
      }
    }
  }, [open, appointment, preselectedCustomerId, form]);

  const handleCreateCustomer = async () => {
    if (!newCustomerName || !newCustomerPhone) return;

    createCustomerMutation.mutate({
      fullName: newCustomerName,
      phoneNumber: newCustomerPhone,
      email: "",
      notes: "",
    }, {
      onSuccess: (newCustomer) => {
        form.setValue("customerId", newCustomer.id);
        setIsCreatingCustomer(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
      }
    });
  };

  const onSubmit = (data: InsertAppointment) => {
    // Ensure data types
    const formattedData = {
      ...data,
      appointmentTime: new Date(data.appointmentTime),
      price: Number(data.price),
      customerId: Number(data.customerId),
      serviceId: data.serviceId ? Number(data.serviceId) : null,
      employeeId: data.employeeId ? Number(data.employeeId) : null,
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

  const handleServiceChange = (serviceId: string) => {
    const id = Number(serviceId);
    const service = services.find(s => s.id === id);
    if (service) {
      form.setValue("serviceId", id);
      form.setValue("serviceType", service.name);
      form.setValue("price", service.price);
    }
  };

  // Convert "datetime-local" input string to Date and back
  const formatDateTimeLocal = (date: Date | string) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {isEditing ? "Randevu Düzenle" : "Yeni Randevu"}
          </DialogTitle>
          <DialogDescription>
            Müşteri için hizmet planlaması yapın.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  {isCreatingCustomer ? (
                    <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-primary/20 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-primary">Hızlı Müşteri Ekle</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsCreatingCustomer(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Ad Soyad"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Telefon"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="bg-white"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        onClick={handleCreateCustomer}
                        disabled={createCustomerMutation.isPending || !newCustomerName || !newCustomerPhone}
                      >
                        {createCustomerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle ve Seç"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                          disabled={!!preselectedCustomerId && !isEditing}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Müşteri seçin" />
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
                      </div>
                      {!preselectedCustomerId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-xl shrink-0"
                          onClick={() => setIsCreatingCustomer(true)}
                          title="Yeni Müşteri Ekle"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hizmet Seçimi</FormLabel>
                    <Select
                      onValueChange={handleServiceChange}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Hizmet seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s: Service) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} ({s.duration} dk - {s.price} ₺)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personel</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Personel seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((e: Employee) => (
                          <SelectItem key={e.id} value={e.id.toString()}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hizmet Detayı/Türü</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Saç Kesimi, Boya" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ücret (₺)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        className="rounded-xl"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
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
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Durum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Planlandı</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="cancelled">İptal Edildi</SelectItem>
                        <SelectItem value="no-show">Gelmedi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarih ve Saat</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Özel notlar..."
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
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white min-w-[100px]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isEditing ? "Kaydet" : "Planla"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
