import { useFlowStore, NodeData } from "../../hooks/useFlowStore";

export default function StatsPanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);

  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const rootCount = nodes.filter((n) => n.type === "root").length;
  const branchCount = nodes.filter((n) => n.type === "branch").length;
  const leafCount = nodes.filter((n) => n.type === "leaf").length;
  const totalWords = nodes.reduce((sum, n) => sum + ((n.data as any).wordCount ?? 0), 0);
  const totalChars = nodes.reduce((sum, n) => sum + ((n.data as any).description?.length ?? 0), 0);

  const maxDepth = (() => {
    let max = 0;
    const dfs = (id: string, depth: number) => { max = Math.max(max, depth); nodes.filter((n) => n.data.parentId === id).forEach((n) => dfs(n.id, depth + 1)); };
    nodes.filter((n) => !n.data.parentId).forEach((n) => dfs(n.id, 1));
    return max;
  })();

  const orphanCount = nodes.filter((n) => n.data.parentId && !nodes.some((p) => p.id === n.data.parentId)).length;

  const statusCounts = { todo: 0, "in-progress": 0, done: 0, blocked: 0 };
  nodes.forEach((n) => { const s = (n.data as any).status; if (s && s !== "none") statusCounts[s as keyof typeof statusCounts]++; });

  const priorityCounts = { P0: 0, P1: 0, P2: 0, P3: 0 };
  nodes.forEach((n) => { const p = (n.data as any).priority; if (p && p !== "none") priorityCounts[p as keyof typeof priorityCounts]++; });

  const allTags = [...new Set(nodes.flatMap((n) => (n.data as any).tags ?? []))];

  const StatRow = ({ label, value, color }: { label: string; value: any; color?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ color: color ?? "#e2e8f0", fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Statistics
      </div>
      <StatRow label="Total Nodes" value={totalNodes} />
      <StatRow label="Roots" value={rootCount} />
      <StatRow label="Branches" value={branchCount} />
      <StatRow label="Leaves" value={leafCount} />
      <StatRow label="Edges" value={totalEdges} />
      <StatRow label="Max Depth" value={maxDepth} />
      <StatRow label="Words" value={totalWords} />
      <StatRow label="Chars in Description" value={totalChars} />
      <StatRow label="Tags" value={allTags.length} />
      {orphanCount > 0 && <StatRow label="Orphan Nodes" value={orphanCount} color="#f97316" />}

      <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />

      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        Status
      </div>
      {Object.entries(statusCounts).map(([k, v]) => v > 0 && <StatRow key={k} label={k} value={v} />)}

      <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />

      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        Priority
      </div>
      {Object.entries(priorityCounts).map(([k, v]) => v > 0 && <StatRow key={k} label={k} value={v} />)}
    </div>
  );
}
