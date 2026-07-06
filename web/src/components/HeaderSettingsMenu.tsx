import { LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { logoutBasicAuth } from "@/lib/basic-auth";

export function HeaderSettingsMenu() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<
    "access" | "basic" | "onboarding" | null
  >(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void api
      .getMe()
      .then((response) => {
        if (!cancelled) setAuthMode(response.authMode);
      })
      .catch(() => {
        if (!cancelled) setAuthMode(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    logoutBasicAuth();
  };

  return (
    <>
      <Button
        size="sm"
        title={t("header.settings")}
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>

      {authMode === "basic" && (
        <Button
          size="sm"
          title={t("security.logout")}
          variant="secondary"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      )}

      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
