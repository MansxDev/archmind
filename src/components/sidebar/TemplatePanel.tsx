import { useFlowStore } from "../../hooks/useFlowStore";

export default function TemplatePanel() {
  const templates = useFlowStore((s) => s.templates);
  const applyTemplate = useFlowStore((s) => s.applyTemplate);

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Templates
      </div>
      {templates.map((t) => (
        <div key={t.id} onClick={() => applyTemplate(t.id)}
          style={{
            padding: "8px 12px", cursor: "pointer", margin: "2px 8px", borderRadius: 6,
            border: "1px solid #1e293b", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#334155"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#1e293b"; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{t.description}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{t.nodes.length} nodes</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
