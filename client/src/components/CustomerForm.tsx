import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
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
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: InsertCustomer & { id: number }; // If present, we are editing
}

export function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = !!customer;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      notes: "",
    },
  });

  // Reset form when opening/closing or changing customer
  useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
          email: customer.email || "",
          notes: customer.notes || "",
        });
      } else {
        form.reset({
          fullName: "",
          phoneNumber: "",
          email: "",
          notes: "",
        });
      }
    }
  }, [open, customer, form]);

  const onSubmit = (data: InsertCustomer) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: customer.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {isEditing ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update customer details and preferences." 
              : "Add a new customer to your client list."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 555-0123" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="jane@example.com" 
                        type="email" 
                        className="rounded-xl" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
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
                  <FormLabel>Preferences & Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. Sensitive scalp, likes tea..." 
                      className="rounded-xl min-h-[100px] resize-none" 
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
                  isEditing ? "Save Changes" : "Create Customer"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
