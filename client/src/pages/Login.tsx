import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (username.length < 3) {
            setError("Kullanıcı adı en az 3 karakter olmalıdır.");
            setIsSubmitting(false);
            return;
        }

        if (password !== "admin123") {
            setError("Hatalı şifre. (Demo: admin123)");
            setIsSubmitting(false);
            return;
        }

        try {
            await login(username);
        } catch (err) {
            setError("Giriş başarısız oldu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Login Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/25">
                            <Scissors className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold font-display tracking-tight">Lumière Hoşgeldiniz</h1>
                        <p className="text-muted-foreground text-center">Salon yönetim panelinize erişmek için giriş yapın.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                placeholder="Örn: admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Giriş Yapılıyor
                                </>
                            ) : (
                                "Giriş Yap"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Demo Giriş Bilgileri:</p>
                        <p className="font-mono mt-1">admin / admin123</p>
                    </div>
                </motion.div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <div className="max-w-lg text-center z-10 p-8">
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"
                            alt="Login Visual"
                            className="rounded-3xl shadow-2xl shadow-primary/20 mb-8 border border-white/20"
                        />
                    </motion.div>
                    <h2 className="text-3xl font-bold font-display mb-4">Profesyonel Yönetim</h2>
                    <p className="text-muted-foreground text-lg">
                        Müşterilerinizi, randevularınızı ve ekibinizi tek bir yerden, en şık şekilde yönetin.
                    </p>
                </div>
            </div>
        </div>
    );
}
