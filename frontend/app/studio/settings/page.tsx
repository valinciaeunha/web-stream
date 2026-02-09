"use client";

import {
  Shield,
  Mail,
  Key,
  Save,
  Bell,
  Globe,
  Smartphone,
  Database,
  Cloud,
  ExternalLink,
  Cpu,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.info("Read-only Configuration", {
      description: "System parameters are defined via environmental variables.",
    });
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage administrative credentials and infrastructure
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="h-9 px-4 rounded-sm font-medium shadow-none"
        >
          <Save className="w-3.5 h-3.5 mr-2" /> Save Changes
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden">
            <CardHeader className="bg-accent/20 p-5 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-base font-heading font-semibold">
                <Shield className="w-4 h-4 text-primary" />
                Access Control
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Administrative credentials for the studio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </Label>
                  <div className="relative group/field">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                    <Input
                      readOnly
                      value="admin@vionix.xyz"
                      className="bg-accent/30 border-border/50 rounded-sm pl-8 h-9 text-muted-foreground/80 cursor-not-allowed text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative group/field">
                    <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                    <Input
                      type="password"
                      readOnly
                      value="••••••••••••••••"
                      className="bg-accent/30 border-border/50 rounded-sm pl-8 h-9 text-muted-foreground/80 cursor-not-allowed text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-3 rounded-sm flex items-start gap-3">
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-primary font-medium mr-2">Tip:</span>
                  Update{" "}
                  <code className="text-foreground font-mono bg-accent/50 px-1 py-0.5 rounded-sm border border-border/50">
                    ADMIN_EMAIL
                  </code>{" "}
                  and{" "}
                  <code className="text-foreground font-mono bg-accent/50 px-1 py-0.5 rounded-sm border border-border/50">
                    ADMIN_PASSWORD
                  </code>{" "}
                  environment variables to rotate credentials.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden p-5">
            <CardTitle className="text-base font-heading font-semibold mb-5 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              Protocols
            </CardTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-sm border border-border/50 transition-colors hover:border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Infrastructure Monitoring
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Real-time health alerts from network nodes
                  </p>
                </div>
                <Switch disabled className="data-[state=checked]:bg-primary" />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-sm border border-border/50 transition-colors hover:border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Public Asset Discovery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable indexing for external distribution
                  </p>
                </div>
                <Switch disabled />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 rounded-sm shadow-none overflow-hidden">
            <CardHeader className="p-4 border-b border-border/50 bg-accent/20">
              <CardTitle className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  name: "DB Instance",
                  icon: Database,
                  color: "text-emerald-500",
                },
                { name: "Object Storage", icon: Cloud, color: "text-blue-500" },
                { name: "CDN Gateway", icon: Globe, color: "text-indigo-500" },
                { name: "Worker Cluster", icon: Zap, color: "text-amber-500" },
              ].map((sys) => (
                <div
                  key={sys.name}
                  className="flex items-center justify-between p-3 bg-accent/30 rounded-sm border border-border/50 group hover:border-border transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <sys.icon className={`w-3.5 h-3.5 ${sys.color}`} />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {sys.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="p-4 border-t border-border/50 bg-accent/20">
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-foreground hover:bg-accent/50 font-medium text-[10px] h-9 rounded-sm"
                asChild
              >
                <a href="/health" target="_blank">
                  Diagnostics <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </a>
              </Button>
            </CardFooter>
          </Card>

          <div className="p-5 rounded-sm bg-primary/10 border border-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-foreground font-heading font-semibold text-base mb-2">
                Documentation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                Learn how to scale your distribution network
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-[10px] h-9 rounded-sm">
                View Docs
              </Button>
            </div>
            <Cpu className="absolute -bottom-4 -right-4 w-20 h-20 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-center py-6 opacity-40 mt-8">
        <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
          <Shield size={10} className="text-primary/60" />
          Vionix Studio v2.1
        </div>
      </footer>
    </div>
  );
}
