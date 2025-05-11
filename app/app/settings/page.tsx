"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleClearCache = () => {
    localStorage.clear();
    toast.success("Cache vidé avec succès !");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

      <div className="grid gap-6">
        {/* Section Préférences */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Préférences</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Activez le thème sombre pour un meilleur confort visuel
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Section Avancée */}
        <Card className="border-destructive">
          <CardHeader>
            <h2 className="text-xl font-semibold text-destructive">
              Zone dangereuse
            </h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Vider le cache local</Label>
                <p className="text-sm text-muted-foreground">
                  Supprime toutes les données locales stockées
                </p>
              </div>
              <Button variant="destructive" onClick={handleClearCache}>
                Vider le cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
