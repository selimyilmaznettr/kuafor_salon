
import { useQuery } from "@tanstack/react-query";
import { NotificationLog } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationLogsTable() {
    const { data: logs, isLoading, refetch } = useQuery<NotificationLog[]>({
        queryKey: ["/api/notifications/logs"],
        refetchInterval: 5000, // Auto refresh every 5s to see new logs
    });

    if (isLoading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Gönderim Geçmişi</h3>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Yenile
                </Button>
            </div>

            <div className="rounded-md border">
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Tip</TableHead>
                                <TableHead>Alıcı</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Detay/Hata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Henüz kayıt yok.
                                    </TableCell>
                                </TableRow>
                            )}
                            {logs?.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {log.sentAt ? format(new Date(log.sentAt), "dd MMM HH:mm", { locale: tr }) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={log.type === 'email' ? 'border-blue-500 text-blue-500' : 'border-purple-500 text-purple-500'}>
                                            {log.type === 'email' ? 'E-Posta' : 'SMS'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.recipient}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                            {log.status === 'success' ? 'Başarılı' : 'Hata'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground" title={log.errorMessage || log.subject || ""}>
                                        {log.status === 'error' ? log.errorMessage : log.subject}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
}
