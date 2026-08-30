import { useFlowStore } from "../hooks/useFlowStore";
import FileExplorer from "./sidebar/FileExplorer";
import NodeEditor from "./sidebar/NodeEditor";
import TagPanel from "./sidebar/TagPanel";
import StatsPanel from "./sidebar/StatsPanel";
import TemplatePanel from "./sidebar/TemplatePanel";
import FavoritesPanel from "./sidebar/FavoritesPanel";
import HistoryPanel from "./sidebar/HistoryPanel";
import OutlinePanel from "./sidebar/OutlinePanel";
import SettingsPanel from "./sidebar/SettingsPanel";

const panelComponents: Record<string, React.FC> = {
  explorer: FileExplorer,
  tags: TagPanel,
  stats: StatsPanel,
  templates: TemplatePanel,
  favorites: FavoritesPanel,
  history: HistoryPanel,
  outline: OutlinePanel,
  settings: SettingsPanel,
};

export default function Sidebar() {
  const sidebarOpen = useFlowStore((s) => s.sidebarOpen);
  const sidebarPanel = useFlowStore((s) => s.sidebarPanel);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

  if (!sidebarOpen) return null;

  const Panel = panelComponents[sidebarPanel] ?? FileExplorer;

  return (
    <div style={{
      width: 260, height: "100%", background: "#1e293b",
      borderRight: "1px solid #0f172a", display: "flex", flexDirection: "column",
      overflow: "hidden", flexShrink: 0,
    }}>
      <Panel />
      {/* Node editor at bottom when node selected */}
      {selectedNodeId && sidebarPanel !== "explorer" && (
        <div style={{ borderTop: "1px solid #0f172a", maxHeight: "40%", overflowY: "auto" }}>
          <NodeEditor />
        </div>
      )}
    </div>
  );
}
