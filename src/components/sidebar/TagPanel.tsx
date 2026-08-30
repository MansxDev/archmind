import { useFlowStore } from "../../hooks/useFlowStore";

export default function TagPanel() {
  const allTags = useFlowStore((s) => s.allTags);
  const nodes = useFlowStore((s) => s.nodes);
  const activeTagFilter = useFlowStore((s) => s.activeTagFilter);
  const setTagFilter = useFlowStore((s) => s.setTagFilter);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  const tagCounts = allTags.map((t) => ({
    tag: t,
    count: nodes.filter((n) => (n.data as any).tags?.includes(t)).length,
  }));

  const toggleFilter = (tag: string) => {
    if (activeTagFilter.includes(tag)) {
      setTagFilter(activeTagFilter.filter((t) => t !== tag));
    } else {
      setTagFilter([...activeTagFilter, tag]);
    }
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Tags {activeTagFilter.length > 0 && `(${activeTagFilter.length} active)`}
      </div>
      {activeTagFilter.length > 0 && (
        <div style={{ padding: "4px 12px" }}>
          <button onClick={() => setTagFilter([])} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 11 }}>Clear filters</button>
        </div>
      )}
      {tagCounts.length === 0 && (
        <div style={{ padding: "8px 12px", color: "#475569", fontSize: 12 }}>No tags yet. Add tags in node editor.</div>
      )}
      {tagCounts.map(({ tag, count }) => {
        const isActive = activeTagFilter.includes(tag);
        return (
          <div key={tag} onClick={() => toggleFilter(tag)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 12px", cursor: "pointer", fontSize: 13,
              background: isActive ? "#6366f118" : "transparent",
              color: isActive ? "#6366f1" : "#94a3b8",
              borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
            }}>
            <span>#{tag}</span>
            <span style={{ fontSize: 11, color: "#475569" }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}
