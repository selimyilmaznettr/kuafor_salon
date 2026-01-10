import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AppointmentInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

type AppointmentFilters = {
  customerId?: number;
  from?: Date;
  to?: Date;
};

export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: [api.appointments.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.customerId) params.append("customerId", filters.customerId.toString());
      if (filters?.from) params.append("from", filters.from.toISOString());
      if (filters?.to) params.append("to", filters.to.toISOString());

      const url = `${api.appointments.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      return api.appointments.list.responses[200].parse(data);
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AppointmentInput) => {
      // Ensure date is properly formatted or object depending on schema needs
      // Schema expects timestamp (date object or ISO string)
      const res = await fetch(api.appointments.create.path, {
        method: api.appointments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMessage = error.details
          ? `${error.message}: ${error.details}`
          : (error.message || "Failed to create appointment");
        throw new Error(errorMessage);
      }
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      toast({ title: "Success", description: "Appointment scheduled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<AppointmentInput>) => {
      const url = buildUrl(api.appointments.update.path, { id });
      const res = await fetch(url, {
        method: api.appointments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMessage = error.details
          ? `${error.message}: ${error.details}`
          : (error.message || "Failed to update appointment");
        throw new Error(errorMessage);
      }
      return api.appointments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      toast({ title: "Success", description: "Appointment updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.appointments.delete.path, { id });
      const res = await fetch(url, {
        method: api.appointments.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete appointment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      toast({ title: "Success", description: "Appointment cancelled" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
