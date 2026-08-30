import { useFlowStore } from "../../hooks/useFlowStore";

export default function TitleBar() {
  const currentFilePath = useFlowStore((s) => s.currentFilePath);
  const hasUnsavedChanges = useFlowStore((s) => s.hasUnsavedChanges);

  const fileName = currentFilePath ? currentFilePath.split("/").pop() : "Untitled";

  return (
    <div style={{
      height: 30, background: "#111827", borderBottom: "1px solid #1e293b",
      display: "flex", alignItems: "center", padding: "0 12px",
      fontSize: 12, color: "#64748b", gap: 8, userSelect: "none",
    }}>
      <span style={{ color: "#6366f1", fontWeight: 700 }}>⬡</span>
      <span>ArchMind</span>
      <span style={{ color: "#334155" }}>|</span>
      <span style={{ color: "#94a3b8" }}>{fileName}{hasUnsavedChanges ? " •" : ""}</span>
      {currentFilePath && (
        <span style={{ color: "#475569", fontSize: 11, marginLeft: "auto" }}>
          {currentFilePath}
        </span>
      )}
    </div>
  );
}
