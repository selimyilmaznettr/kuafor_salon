import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Service, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NotificationSettingsForm from "./NotificationSettingsForm";
import NotificationLogsTable from "@/components/NotificationLogsTable";

export default function Settings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // === Services ===
    const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
        queryKey: ["/api/services"],
    });

    const createService = useMutation({
        mutationFn: async (newService: { name: string; price: number; duration: number }) => {
            await apiRequest("POST", "/api/services", newService);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/services"] });
            toast({ title: "Başarılı", description: "Hizmet eklendi." });
        },
    });

    const deleteService = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/services/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/services"] });
            toast({ title: "Başarılı", description: "Hizmet silindi." });
        },
    });

    // === Employees ===
    const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
        queryKey: ["/api/employees"],
    });

    const createEmployee = useMutation({
        mutationFn: async (newEmployee: { name: string; role: string }) => {
            await apiRequest("POST", "/api/employees", newEmployee);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
            toast({ title: "Başarılı", description: "Çalışan eklendi." });
        },
    });

    const deleteEmployee = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/employees/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
            toast({ title: "Başarılı", description: "Çalışan silindi." });
        },
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight font-display">Ayarlar <span className="text-sm font-normal text-muted-foreground ml-2">(v1.2)</span></h1>
                <p className="text-muted-foreground">Hizmet, personel ve bildirim yönetimi.</p>
            </div>

            <Tabs defaultValue="services" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="services">Hizmetler</TabsTrigger>
                    <TabsTrigger value="employees">Personel</TabsTrigger>
                    <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
                </TabsList>

                <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hizmet Listesi</CardTitle>
                            <CardDescription>Randevularda seçilebilecek hizmetleri yönetin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ServiceForm onCreate={(data) => createService.mutate(data)} />

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hizmet Adı</TableHead>
                                            <TableHead>Süre (dk)</TableHead>
                                            <TableHead>Fiyat</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services?.map((service) => (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-medium">{service.name}</TableCell>
                                                <TableCell>{service.duration} dk</TableCell>
                                                <TableCell>{service.price} ₺</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
                                                                deleteService.mutate(service.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personel Listesi</CardTitle>
                            <CardDescription>Salon çalışanlarını yönetin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <EmployeeForm onCreate={(data) => createEmployee.mutate(data)} />

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ad Soyad</TableHead>
                                            <TableHead>Rol/Pozisyon</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees?.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell className="font-medium">{employee.name}</TableCell>
                                                <TableCell>{employee.role}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm("Bu çalışanı silmek istediğinize emin misiniz?")) {
                                                                deleteEmployee.mutate(employee.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bildirim Ayarları</CardTitle>
                            <CardDescription>SMS ve E-posta bildirim yapılandırması.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <NotificationSettingsForm />
                            <div className="border-t pt-6">
                                <NotificationLogsTable />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ServiceForm({ onCreate }: { onCreate: (data: { name: string; price: number; duration: number }) => void }) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("30");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ name, price: Number(price), duration: Number(duration) });
        setName("");
        setPrice("");
        setDuration("30");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="service-name">Hizmet Adı</Label>
                <Input required id="service-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Saç Kesimi" />
            </div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="service-duration">Süre (dk)</Label>
                <Input required type="number" id="service-duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
            </div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="service-price">Fiyat (₺)</Label>
                <Input required type="number" id="service-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" />
            </div>
            <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Ekle
            </Button>
        </form>
    );
}

function EmployeeForm({ onCreate }: { onCreate: (data: { name: string; role: string }) => void }) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ name, role });
        setName("");
        setRole("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="employee-name">Ad Soyad</Label>
                <Input required id="employee-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" />
            </div>
            <div className="grid w-full gap-1.5">
                <Label htmlFor="employee-role">Rol</Label>
                <Input required id="employee-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Örn: Kuaför" />
            </div>
            <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Ekle
            </Button>
        </form>
    );
}
