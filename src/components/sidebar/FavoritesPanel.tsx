import { useFlowStore, NodeData } from "../../hooks/useFlowStore";

export default function FavoritesPanel() {
  const favorites = useFlowStore((s) => s.favorites);
  const nodes = useFlowStore((s) => s.nodes);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const toggleFavorite = useFlowStore((s) => s.toggleFavorite);

  const favNodes = favorites.map((id) => nodes.find((n) => n.id === id)).filter(Boolean);

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Favorites
      </div>
      {favNodes.length === 0 && (
        <div style={{ padding: "8px 12px", color: "#475569", fontSize: 12 }}>No favorites. Click ⭐ on a node.</div>
      )}
      {favNodes.map((node: any) => {
        const nd = node.data as NodeData;
        return (
          <div key={node.id} onClick={() => setSelectedNode(node.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px", cursor: "pointer", fontSize: 13,
              borderRadius: 4, margin: "1px 8px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <span>{nd.emoji}</span>
            <span style={{ flex: 1, color: "#e2e8f0" }}>{nd.label}</span>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(node.id); }}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
