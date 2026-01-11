import { useAppointments, useUpdateAppointment } from "@/hooks/use-appointments";
import { useCustomers } from "@/hooks/use-customers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Activity,
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment, Customer, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalCustomers: number;
  todayAppointments: number;
  recentActivity: Appointment[];
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: appointments, isLoading: appsLoading } = useAppointments();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const updateAppointment = useUpdateAppointment();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"]
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const handleQuickComplete = (appointment: Appointment) => {
    updateAppointment.mutate({
      id: appointment.id,
      status: "completed",
    }, {
      onSuccess: () => {
        // Invalidate both stats and appointments to ensure consistency
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
        toast({
          title: "İşlem Tamamlandı",
          description: "Randevu başarıyla tamamlandı olarak işaretlendi.",
        });
      }
    });
  };

  // Compute Stats
  const todayAppointments = appointments?.filter(a => isToday(new Date(a.appointmentTime))) || [];

  // Safe stats access to prevent crashes on network error
  const dailyRevenue = stats?.dailyRevenue ?? 0;
  const weeklyRevenue = stats?.weeklyRevenue ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const yearlyRevenue = stats?.yearlyRevenue ?? 0;

  const statCards = [
    {
      title: "Günlük Ciro",
      value: `${dailyRevenue.toLocaleString('tr-TR')} ₺`,
      subtext: "Bugün kazanılan",
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Haftalık Ciro",
      value: `${weeklyRevenue.toLocaleString('tr-TR')} ₺`,
      subtext: "Bu hafta",
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Aylık Ciro",
      value: `${monthlyRevenue.toLocaleString('tr-TR')} ₺`,
      subtext: "Bu ay",
      icon: CreditCard,
      color: "bg-emerald-500/10 text-emerald-600"
    },
    {
      title: "Yıllık Ciro",
      value: `${yearlyRevenue.toLocaleString('tr-TR')} ₺`,
      subtext: "Bu yıl",
      icon: Activity,
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (appsLoading || customersLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display">Kontrol Paneli</h1>
        <p className="text-muted-foreground">Tekrar hoşgeldiniz. Günlük özetiniz ve finansal durumunuz.</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, idx) => (
          <motion.div key={idx} variants={item}>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" />
                  <span className="text-emerald-500 font-medium mr-1">Güncel</span>
                  {stat.subtext}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Bugünün Programı</h2>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "dd MMMM yyyy, EEEE", { locale: tr })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden min-h-[300px]">
            {todayAppointments.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground h-full">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">Bugün randevu yok</p>
                <p className="text-sm max-w-xs mx-auto mt-1">Boş zamanın tadını çıkarın veya yeni müşteri ekleyin.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {todayAppointments
                  .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
                  .map((app) => {
                    const employee = employees?.find(e => e.id === app.employeeId);

                    return (
                      <div key={app.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-3 group">
                        <div className="flex flex-col items-center justify-center min-w-[80px] p-3 bg-primary/5 rounded-2xl text-primary border border-primary/10">
                          <span className="text-xl font-bold">{format(new Date(app.appointmentTime), "HH:mm")}</span>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {customers?.find(c => c.id === app.customerId)?.fullName || "Misafir Müşteri"}
                          </h4>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <span>{app.serviceType}</span>
                            {employee && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full self-center flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {employee.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                        ${app.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              app.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                app.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'}
                      `}>
                            {app.status === 'scheduled' ? 'Planlandı' :
                              app.status === 'completed' ? 'Tamamlandı' :
                                app.status === 'cancelled' ? 'İptal' : app.status}
                          </div>

                          {app.status === 'scheduled' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleQuickComplete(app)}
                              title="Tamamlandı olarak işaretle"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          )}

                          <div className="font-semibold text-muted-foreground min-w-[60px] text-right">
                            {app.price ? `${app.price} ₺` : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display">Son Aktiviteler</h2>
          <Card className="rounded-3xl border-border/50 shadow-sm h-full max-h-[600px] overflow-hidden">
            <CardContent className="p-0">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {stats.recentActivity.map((activity) => {
                    const customerName = customers?.find(c => c.id === activity.customerId)?.fullName || "Misafir";
                    const isCompleted = activity.status === 'completed';
                    const isCancelled = activity.status === 'cancelled';

                    return (
                      <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold">{customerName}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(activity.appointmentTime), "d MMM", { locale: tr })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {activity.serviceType} ({format(new Date(activity.appointmentTime), "HH:mm")})
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-0.5 rounded-full border ${isCompleted
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : isCancelled
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                            {isCompleted ? 'Tamamlandı' : isCancelled ? 'İptal' : 'İşlemde'}
                          </span>
                          <span className="font-medium text-muted-foreground">
                            {activity.price} ₺
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Henüz aktivite yok.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
