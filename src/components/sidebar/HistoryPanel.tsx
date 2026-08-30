import { useFlowStore } from "../../hooks/useFlowStore";

export default function HistoryPanel() {
  const past = useFlowStore((s) => s.past);
  const future = useFlowStore((s) => s.future);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);

  const allEntries = [
    ...past.map((e, i) => ({ ...e, type: "past" as const, index: i })),
    ...future.map((e, i) => ({ ...e, type: "future" as const, index: i })).reverse(),
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", justifyContent: "space-between" }}>
        <span>History ({past.length})</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={undo} disabled={past.length === 0} style={{ background: "none", border: "none", color: past.length > 0 ? "#94a3b8" : "#334155", cursor: "pointer", fontSize: 12 }}>↶</button>
          <button onClick={redo} disabled={future.length === 0} style={{ background: "none", border: "none", color: future.length > 0 ? "#94a3b8" : "#334155", cursor: "pointer", fontSize: 12 }}>↷</button>
        </div>
      </div>
      {allEntries.length === 0 && (
        <div style={{ padding: "8px 12px", color: "#475569", fontSize: 12 }}>No history yet.</div>
      )}
      {allEntries.slice(-20).reverse().map((e, i) => (
        <div key={`${e.type}-${e.index}-${i}`}
          style={{
            padding: "4px 12px", fontSize: 12, color: e.type === "past" ? "#94a3b8" : "#475569",
            display: "flex", alignItems: "center", gap: 8,
            background: i === 0 && e.type === "past" ? "#6366f118" : "transparent",
            borderLeft: i === 0 && e.type === "past" ? "2px solid #6366f1" : "2px solid transparent",
          }}>
          <span style={{ fontSize: 10, color: "#475569", minWidth: 40 }}>{e.type === "past" ? "◀" : "▶"}</span>
          <span style={{ flex: 1 }}>{e.label}</span>
          <span style={{ fontSize: 10, color: "#334155" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
}
