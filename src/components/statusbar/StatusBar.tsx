import { useFlowStore, THEMES, ThemeName } from "../../hooks/useFlowStore";

export default function StatusBar() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const theme = useFlowStore((s) => s.theme);
  const setTheme = useFlowStore((s) => s.setTheme);
  const focusMode = useFlowStore((s) => s.focusMode);
  const showStatusBar = useFlowStore((s) => s.showStatusBar);

  if (!showStatusBar) return null;

  const selected = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const totalWords = nodes.reduce((sum, n) => sum + ((n.data as any).wordCount ?? 0), 0);
  const rootCount = nodes.filter((n) => n.type === "root").length;
  const maxDepth = (() => {
    let max = 0;
    const dfs = (id: string, depth: number) => {
      max = Math.max(max, depth);
      nodes.filter((n) => n.data.parentId === id).forEach((n) => dfs(n.id, depth + 1));
    };
    nodes.filter((n) => !n.data.parentId).forEach((n) => dfs(n.id, 1));
    return max;
  })();

  return (
    <div style={{
      height: 24, background: "#111827", borderTop: "1px solid #1e293b",
      display: "flex", alignItems: "center", padding: "0 12px",
      fontSize: 11, color: "#64748b", gap: 12, userSelect: "none",
    }}>
      {/* Left section */}
      <span style={{ color: "#22c55e" }}>●</span>
      <span>{nodes.length} nodes</span>
      <span style={{ color: "#334155" }}>|</span>
      <span>{edges.length} edges</span>
      <span style={{ color: "#334155" }}>|</span>
      <span>{rootCount} roots</span>
      <span style={{ color: "#334155" }}>|</span>
      <span>depth {maxDepth}</span>
      <span style={{ color: "#334155" }}>|</span>
      <span>{totalWords} words</span>

      {/* Selected node info */}
      {selected && (
        <>
          <span style={{ color: "#334155" }}>|</span>
          <span style={{ color: "#94a3b8" }}>
            {(selected.data as any).emoji} {(selected.data as any).label}
            {(selected.data as any).status !== "none" && ` [${(selected.data as any).status}]`}
            {(selected.data as any).priority !== "none" && ` ${(selected.data as any).priority}`}
          </span>
        </>
      )}

      {focusMode && (
        <>
          <span style={{ color: "#334155" }}>|</span>
          <span style={{ color: "#f97316" }}>🎯 Focus Mode</span>
        </>
      )}

      {/* Right section */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}
          style={{
            background: "transparent", border: "none", color: "#64748b", fontSize: 11,
            cursor: "pointer", outline: "none", fontFamily: "inherit",
          }}>
          {Object.values(THEMES).map((t) => <option key={t.name} value={t.name}>{t.label}</option>)}
        </select>
      </div>
    </div>
  );
}
