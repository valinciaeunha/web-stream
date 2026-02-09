"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/studio/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Welcome back", {
                    description: "Redirecting to studio...",
                });
                router.push("/studio");
            } else {
                toast.error("Access Denied", { description: "Invalid credentials." });
            }
        } catch (err) {
            toast.error("Connection Error", {
                description: "Please check your network.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <Card className="w-full max-w-[380px] z-10 border-border/60 shadow-md bg-card/95 backdrop-blur-md rounded-md">
                <CardHeader className="text-center flex flex-col items-center pb-2 pt-6">
                    <div className="w-full flex justify-center mb-5">
                        <img
                            src="/logo.png"
                            alt="Vionix Studio Logo"
                            className="h-8 w-auto object-contain opacity-90"
                        />
                    </div>
                    <CardTitle className="text-lg font-medium tracking-normal text-foreground">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground/80">
                        Enter your credentials to access the studio
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-6 pb-6">
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="email"
                                className="text-[11px] text-muted-foreground"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-muted/40 border-border/60 focus:bg-background transition-colors h-9 rounded-sm text-xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-[11px] text-muted-foreground"
                                >
                                    Password
                                </Label>
                                <a
                                    href="#"
                                    className="text-[11px] text-primary hover:text-primary/80 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-muted/40 border-border/60 focus:bg-background transition-colors h-9 rounded-sm text-xs"
                            />
                        </div>
                        <Button
                            className="w-full h-9 mt-1 font-medium shadow-none rounded-sm text-sm"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-border/40 p-5 bg-muted/20">
                    <p className="text-[9px] text-center text-muted-foreground w-full opacity-60">
                        Protected by Vionix Secure Gateway &copy; {new Date().getFullYear()}
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
