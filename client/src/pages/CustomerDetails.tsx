import { useCustomer } from "@/hooks/use-customers";
import { useAppointments } from "@/hooks/use-appointments";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Edit, 
  Plus,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";
import { CustomerForm } from "@/components/CustomerForm";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = Number(params.id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApptOpen, setIsApptOpen] = useState(false);

  const { data: customer, isLoading: custLoading } = useCustomer(id);
  const { data: appointments, isLoading: apptLoading } = useAppointments({ customerId: id });

  if (custLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-48 h-8" />
        </div>
        <Skeleton className="w-full h-64 rounded-3xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button variant="link" onClick={() => setLocation("/customers")}>
          Go back to list
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="pl-0 hover:bg-transparent hover:text-primary transition-colors" 
        onClick={() => setLocation("/customers")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customers
      </Button>

      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <AvatarFallback className="text-3xl font-bold">
              {getInitials(customer.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-display">{customer.fullName}</h1>
                <p className="text-muted-foreground">Customer since {format(new Date(customer.createdAt!), "MMMM yyyy")}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => setIsEditOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="rounded-xl bg-primary text-white hover:bg-primary/90" onClick={() => setIsApptOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">{customer.phoneNumber}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium">{customer.email}</span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl mt-4 max-w-2xl">
                <p className="text-sm text-amber-900 font-medium mb-1">Notes:</p>
                <p className="text-amber-800/80 text-sm leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display">Appointment History</h2>
        
        {apptLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {appointments
              .sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
              .map((apt) => (
                <Card key={apt.id} className="rounded-2xl border-border/50 hover:border-primary/20 hover:shadow-md transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="bg-primary/5 p-4 rounded-2xl text-center min-w-[90px]">
                        <div className="text-2xl font-bold text-primary">
                          {format(new Date(apt.appointmentTime), "dd")}
                        </div>
                        <div className="text-xs font-bold text-primary/60 uppercase">
                          {format(new Date(apt.appointmentTime), "MMM")}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold">{apt.serviceType}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(apt.appointmentTime), "h:mm a")}
                          </div>
                          {apt.price && (
                            <div className="font-medium text-foreground">
                              ${apt.price}
                            </div>
                          )}
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider
                      ${apt.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 
                        apt.status === 'completed' ? 'bg-green-50 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'}
                    `}>
                      {apt.status}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-border/60">
            <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No appointments recorded yet.</p>
            <Button 
              variant="link" 
              className="text-primary mt-2" 
              onClick={() => setIsApptOpen(true)}
            >
              Schedule First Appointment
            </Button>
          </div>
        )}
      </div>

      {/* Forms */}
      {isEditOpen && (
        <CustomerForm 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          customer={customer} 
        />
      )}
      {isApptOpen && (
        <AppointmentForm 
          open={isApptOpen} 
          onOpenChange={setIsApptOpen} 
          preselectedCustomerId={customer.id}
        />
      )}
    </div>
  );
}
