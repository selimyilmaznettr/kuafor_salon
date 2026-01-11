import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { tr } from "date-fns/locale";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Calendar as CalendarIcon,
    Printer,
    TrendingUp,
    Users,
    CreditCard,
    Scissors
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { cn } from "@/lib/utils";

interface ReportStats {
    summary: {
        totalRevenue: number;
        totalAppointments: number;
        averageOrderValue: number;
        newCustomers: number;
    };
    dailyTrend: { date: string; revenue: number; count: number }[];
    servicePerformance: { name: string; revenue: number; count: number }[];
    employeePerformance: { name: string; revenue: number; count: number }[];
}

export default function Reports() {
    const [dateRange, setDateRange] = useState<"7days" | "30days" | "month">("30days");
    const [customFrom, setCustomFrom] = useState<Date>();
    const [customTo, setCustomTo] = useState<Date>();

    const getDates = () => {
        const now = new Date();
        let from = subDays(now, 30);
        let to = now;

        if (dateRange === "7days") {
            from = subDays(now, 7);
        } else if (dateRange === "month") {
            from = startOfMonth(now);
            to = endOfMonth(now);
        } else if (customFrom && customTo) {
            from = customFrom;
            to = customTo;
        }

        return { from, to };
    };

    const { from, to } = getDates();

    const { data: stats, isLoading } = useQuery<ReportStats>({
        queryKey: ["/api/reports", from.toISOString(), to.toISOString()],
        queryFn: async () => {
            const res = await fetch(`/api/reports?from=${from.toISOString()}&to=${to.toISOString()}`);
            if (!res.ok) throw new Error("Failed to fetch reports");
            return res.json();
        }
    });

    const handlePrint = () => {
        window.print();
    };



    if (isLoading) {
        return (
            <div className="space-y-8 p-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8 text-center">Rapor verisi yüklenemedi.</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 print:p-0 print:space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Raporlar & Analiz</h1>
                    <p className="text-muted-foreground">İşletmenizin detaylı performans analizi.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Tarih Aralığı" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7days">Son 7 Gün</SelectItem>
                            <SelectItem value="30days">Son 30 Gün</SelectItem>
                            <SelectItem value="month">Bu Ay</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Yazdır
                    </Button>
                </div>
            </div>

            <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold">Salon Takip Raporu</h1>
                <p className="text-sm text-gray-500">
                    {format(from, "d MMMM yyyy", { locale: tr })} - {format(to, "d MMMM yyyy", { locale: tr })}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Toplam Ciro</p>
                            <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-primary">{stats?.summary.totalRevenue.toLocaleString('tr-TR')} ₺</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Randevu Sayısı</p>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.summary.totalAppointments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Ort. İşlem Tutarı</p>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.summary.averageOrderValue.toLocaleString('tr-TR')} ₺</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Yeni Müşteriler</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{stats?.summary.newCustomers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="col-span-4 print:break-inside-avoid">
                <CardHeader>
                    <CardTitle>Gelir Trendi</CardTitle>
                    <CardDescription>Günlük ciro değişimi.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.dailyTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => format(new Date(val), "d MMM", { locale: tr })}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val} ₺`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(label) => format(new Date(label), "d MMMM yyyy", { locale: tr })}
                                    formatter={(value: number) => [`${value} ₺`, "Ciro"]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2">
                {/* Service Performance */}
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Hizmet Dağılımı</CardTitle>
                        <CardDescription>Gelire göre en popüler hizmetler.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.servicePerformance}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats?.servicePerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value} ₺`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {stats?.servicePerformance.slice(0, 5).map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {service.count} işlem - {service.revenue} ₺
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Performance */}
                <Card className="print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle>Personel Performansı</CardTitle>
                        <CardDescription>Personele göre ciro dağılımı.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.employeePerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value: number) => `${value} ₺`} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="revenue" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                        {stats?.employeePerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {stats?.employeePerformance.map((emp, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm border-b border-border/40 last:border-0 py-2">
                                    <span className="font-medium">{emp.name}</span>
                                    <div className="flex gap-4 text-muted-foreground">
                                        <span>{emp.count} Randevu</span>
                                        <span className="font-bold text-foreground">{emp.revenue} ₺</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
