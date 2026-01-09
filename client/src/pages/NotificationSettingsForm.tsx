import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NotificationSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettingsForm() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery<NotificationSettings>({
        queryKey: ["/api/settings/notifications"],
    });

    const updateSettings = useMutation({
        mutationFn: async (newSettings: Partial<NotificationSettings>) => {
            await apiRequest("POST", "/api/settings/notifications", newSettings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings/notifications"] });
            toast({ title: "Başarılı", description: "Ayarlar güncellendi." });
        },
    });

    if (isLoading) return <div>Yükleniyor...</div>;

    const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
        updateSettings.mutate({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Netgsm SMS Entegrasyonu</h3>
                        <p className="text-sm text-muted-foreground">Netgsm API bilgilerinizi giriniz.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="sms-enabled">Aktif</Label>
                        <Switch
                            id="sms-enabled"
                            checked={settings?.smsEnabled || false}
                            onCheckedChange={(checked) => handleToggle("smsEnabled", checked)}
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Kullanıcı Adı (Netgsm)</Label>
                    <Input
                        defaultValue={settings?.netgsmUser || ""}
                        onBlur={(e) => updateSettings.mutate({ netgsmUser: e.target.value })}
                        placeholder="850xxxxxxx"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Şifre</Label>
                    <Input
                        type="password"
                        defaultValue={settings?.netgsmPassword || ""}
                        onBlur={(e) => updateSettings.mutate({ netgsmPassword: e.target.value })}
                        placeholder="Netgsm şifreniz"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Başlık (MsgHeader)</Label>
                    <Input
                        defaultValue={settings?.netgsmHeader || ""}
                        onBlur={(e) => updateSettings.mutate({ netgsmHeader: e.target.value })}
                        placeholder="Örn: FIRMA ADI"
                    />
                </div>
            </div>

            <div className="grid gap-4 border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">E-posta (SMTP) Entegrasyonu</h3>
                        <p className="text-sm text-muted-foreground">Mail sunucu bilgilerinizi giriniz.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="email-enabled">Aktif</Label>
                        <Switch
                            id="email-enabled"
                            checked={settings?.emailEnabled || false}
                            onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>SMTP Host</Label>
                        <Input
                            defaultValue={settings?.smtpHost || ""}
                            onBlur={(e) => updateSettings.mutate({ smtpHost: e.target.value })}
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>SMTP Port</Label>
                        <Input
                            type="number"
                            defaultValue={settings?.smtpPort || 587}
                            onBlur={(e) => updateSettings.mutate({ smtpPort: Number(e.target.value) })}
                            placeholder="587"
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Kullanıcı Adı (Email)</Label>
                    <Input
                        defaultValue={settings?.smtpUser || ""}
                        onBlur={(e) => updateSettings.mutate({ smtpUser: e.target.value })}
                        placeholder="info@example.com"
                    />
                </div>
                <div className="grid gap-2">
                    <Label>SMTP Şifre</Label>
                    <Input
                        type="password"
                        defaultValue={settings?.smtpPass || ""}
                        onBlur={(e) => updateSettings.mutate({ smtpPass: e.target.value })}
                        placeholder="Mail şifreniz"
                    />
                </div>
            </div>

        </div>
    );
}
