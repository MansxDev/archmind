import { useFlowStore, NodeData } from "../../hooks/useFlowStore";

export default function FileExplorer() {
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const addRootNode = useFlowStore((s) => s.addRootNode);
  const addChildNode = useFlowStore((s) => s.addChildNode);
  const toggleCollapse = useFlowStore((s) => s.toggleCollapse);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);
  const removeNode = useFlowStore((s) => s.removeNode);
  const toggleFavorite = useFlowStore((s) => s.toggleFavorite);

  const roots = nodes.filter((n) => !n.data.parentId);

  const renderNode = (node: any, depth: number) => {
    const nd = node.data as NodeData;
    const children = nodes.filter((n) => n.data.parentId === node.id);
    const hasChildren = children.length > 0;
    const isSelected = node.id === selectedNodeId;

    return (
      <div key={node.id}>
        <div
          onClick={() => setSelectedNode(node.id)}
          onDoubleClick={() => setEditingNode(node.id)}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", paddingLeft: 8 + depth * 16,
            cursor: "pointer", fontSize: 13,
            background: isSelected ? "#1e293b" : "transparent",
            color: isSelected ? "#e2e8f0" : "#94a3b8",
            borderRadius: 4, margin: "1px 4px",
            transition: "all 0.1s",
          }}>
          {hasChildren && (
            <button onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 10, padding: 0, width: 14 }}>
              {nd.collapsed ? "▶" : "▼"}
            </button>
          )}
          {!hasChildren && <span style={{ width: 14 }} />}
          <span style={{ fontSize: 14 }}>{nd.emoji}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nd.label}</span>
          {nd.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
          {nd.status !== "none" && (
            <span style={{ fontSize: 10, color: STATUSES_MAP[nd.status] }}>{STATUS_ICONS[nd.status]}</span>
          )}
        </div>
        {hasChildren && !nd.collapsed && children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Explorer</span>
        <button onClick={addRootNode} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>+</button>
      </div>
      {roots.map((r) => renderNode(r, 0))}
    </div>
  );
}

const STATUSES_MAP: Record<string, string> = { "todo": "#64748b", "in-progress": "#3b82f6", "done": "#22c55e", "blocked": "#ef4444" };
const STATUS_ICONS: Record<string, string> = { "todo": "○", "in-progress": "◐", "done": "●", "blocked": "⊘" };
