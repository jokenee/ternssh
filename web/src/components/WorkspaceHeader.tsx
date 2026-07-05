import type { ReactNode } from "react";
import { HeaderSettingsMenu } from "@/components/HeaderSettingsMenu";
import { useSiteName } from "@/lib/site-name-context";

interface WorkspaceHeaderProps {
  actions?: ReactNode;
}

export function WorkspaceHeader({ actions }: WorkspaceHeaderProps) {
  const { siteName } = useSiteName();

  return (
    <header className="workspace-header">
      <div className="app-brand">{siteName}</div>
      <div className="app-header-actions">
        {actions}
        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
