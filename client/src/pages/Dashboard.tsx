import { useAppointments } from "@/hooks/use-appointments";
import { useCustomers } from "@/hooks/use-customers";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { data: appointments, isLoading: appsLoading } = useAppointments();
  const { data: customers, isLoading: customersLoading } = useCustomers();

  // Compute Stats
  const todayAppointments = appointments?.filter(a => isToday(new Date(a.appointmentTime))) || [];
  const activeCustomers = customers?.length || 0;
  const completedApps = appointments?.filter(a => a.status === 'completed').length || 0;
  
  // Calculate total revenue (simple sum of all completed appointments)
  const totalRevenue = appointments
    ?.filter(a => a.status === 'completed')
    .reduce((sum, app) => sum + (app.price || 0), 0) || 0;

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length.toString(),
      subtext: "Scheduled for today",
      icon: Calendar,
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Total Customers",
      value: activeCustomers.toString(),
      subtext: "Active client base",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtext: "Lifetime earnings",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-600"
    },
    {
      title: "Completed Services",
      value: completedApps.toString(),
      subtext: "Satisfied visits",
      icon: Clock,
      color: "bg-rose-500/10 text-rose-600"
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

  if (appsLoading || customersLoading) {
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here is your daily overview.</p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
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
                  <span className="text-emerald-500 font-medium mr-1">Updated</span>
                  {stat.subtext}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Today's Schedule</h2>
            <div className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</div>
          </div>

          <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            {todayAppointments.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">No appointments today</p>
                <p className="text-sm max-w-xs mx-auto mt-1">Enjoy your free time or schedule a new customer.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {todayAppointments
                  .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
                  .map((app) => (
                  <div key={app.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group">
                    <div className="flex flex-col items-center justify-center min-w-[80px] p-3 bg-primary/5 rounded-2xl text-primary border border-primary/10">
                      <span className="text-xl font-bold">{format(new Date(app.appointmentTime), "HH:mm")}</span>
                      <span className="text-xs font-medium uppercase tracking-wider">{format(new Date(app.appointmentTime), "a")}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{customers?.find(c => c.id === app.customerId)?.fullName || "Unknown Customer"}</h4>
                      <p className="text-muted-foreground">{app.serviceType}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border
                        ${app.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          app.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'}
                      `}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                      <div className="font-semibold text-muted-foreground">
                        {app.price ? `$${app.price}` : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Mini Calendar could go here */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display">Recent Activity</h2>
          <div className="bg-white p-6 rounded-3xl border border-border/50 shadow-sm h-full max-h-[500px] flex flex-col items-center justify-center text-center">
            <div className="w-full space-y-4">
              {/* Placeholder for activity feed */}
              <p className="text-muted-foreground text-sm">Activity feed coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
