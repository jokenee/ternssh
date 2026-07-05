import type { TreeNode } from "@/lib/api";

export interface WidgetContext {
  selectedServerId: string | null;
  onSelectServer: (serverId: string) => void;
  onConnectServer: (serverId: string) => void;
}

export interface WidgetProps {
  context: WidgetContext;
}

export interface ServerListWidgetProps extends WidgetProps {
  tree: TreeNode[];
  loading: boolean;
  moving: boolean;
  onDeleteServer: (serverId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onMoveItem: (input: {
    type: "server" | "group";
    id: string;
    parentId: string | null;
    index: number;
  }) => Promise<void>;
}

export interface TerminalWidgetProps extends WidgetProps {
  sessionWsUrl: string | null;
  onStatusChange?: (status: string) => void;
}
