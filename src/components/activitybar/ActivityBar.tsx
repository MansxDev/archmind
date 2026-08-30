import { useFlowStore, SidebarPanel } from "../../hooks/useFlowStore";

const panels: { id: SidebarPanel; icon: string; label: string }[] = [
  { id: "explorer", icon: "📁", label: "Explorer" },
  { id: "tags", icon: "🏷️", label: "Tags" },
  { id: "stats", icon: "📊", label: "Statistics" },
  { id: "templates", icon: "📋", label: "Templates" },
  { id: "favorites", icon: "⭐", label: "Favorites" },
  { id: "history", icon: "🕐", label: "History" },
  { id: "outline", icon: "📑", label: "Outline" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function ActivityBar() {
  const sidebarPanel = useFlowStore((s) => s.sidebarPanel);
  const sidebarOpen = useFlowStore((s) => s.sidebarOpen);
  const setSidebarPanel = useFlowStore((s) => s.setSidebarPanel);
  const setSidebarOpen = useFlowStore((s) => s.setSidebarOpen);

  return (
    <div style={{
      width: 48, height: "100%", background: "#111827",
      display: "flex", flexDirection: "column", alignItems: "center",
      borderRight: "1px solid #1e293b", justifyContent: "space-between",
      paddingBottom: 8,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
        {panels.map((p) => (
          <button key={p.id} title={p.label} onClick={() => { if (sidebarPanel === p.id && sidebarOpen) setSidebarOpen(false); else setSidebarPanel(p.id); }}
            style={{
              width: 40, height: 40, border: "none", borderRadius: 6,
              background: sidebarPanel === p.id && sidebarOpen ? "#1e293b" : "transparent",
              color: sidebarPanel === p.id && sidebarOpen ? "#e2e8f0" : "#64748b",
              fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              borderLeft: sidebarPanel === p.id && sidebarOpen ? "2px solid #6366f1" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
            {p.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
