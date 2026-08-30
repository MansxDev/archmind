import { useFlowStore, NodeData } from "../../hooks/useFlowStore";

export default function OutlinePanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const roots = nodes.filter((n) => !n.data.parentId);

  const renderOutline = (node: any, depth: number) => {
    const nd = node.data as NodeData;
    const children = nodes.filter((n) => n.data.parentId === node.id);
    const isSelected = node.id === selectedNodeId;

    return (
      <div key={node.id}>
        <div onClick={() => setSelectedNode(node.id)}
          style={{
            padding: `3px 8px`, paddingLeft: 8 + depth * 16,
            cursor: "pointer", fontSize: 13,
            color: isSelected ? "#e2e8f0" : "#94a3b8",
            background: isSelected ? "#1e293b" : "transparent",
            borderRadius: 4, margin: "1px 4px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <span style={{ color: nd.color, fontSize: 8 }}>●</span>
          <span>{nd.emoji}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nd.label}</span>
          {children.length > 0 && <span style={{ fontSize: 10, color: "#475569" }}>{children.length}</span>}
        </div>
        {children.map((c) => renderOutline(c, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Outline
      </div>
      {roots.map((r) => renderOutline(r, 0))}
    </div>
  );
}
