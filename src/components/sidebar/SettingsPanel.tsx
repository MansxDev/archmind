import { useState } from "react";
import { useFlowStore, THEMES, ThemeName, GridStyle, STATUSES, PRIORITIES, SHAPES, EMOJIS } from "../../hooks/useFlowStore";

export default function SettingsPanel() {
  const theme = useFlowStore((s) => s.theme);
  const setTheme = useFlowStore((s) => s.setTheme);
  const gridStyle = useFlowStore((s) => s.gridStyle);
  const setGridStyle = useFlowStore((s) => s.setGridStyle);
  const showMinimap = useFlowStore((s) => s.showMinimap);
  const setShowMinimap = useFlowStore((s) => s.setShowMinimap);
  const showStatusBar = useFlowStore((s) => s.showStatusBar);
  const setShowStatusBar = useFlowStore((s) => s.setShowStatusBar);
  const shortcuts = useFlowStore((s) => s.shortcuts);
  const setShortcuts = useFlowStore((s) => s.setShortcuts);

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);

  const defaultShortcuts: Record<string, string> = {
    "Undo": "Ctrl+Z",
    "Redo": "Ctrl+Shift+Z",
    "Search": "Ctrl+F",
    "Command Palette": "Ctrl+Shift+P",
    "Auto Layout": "Ctrl+L",
    "Presentation": "F5",
    "Save": "Ctrl+S",
    "Open": "Ctrl+O",
    "New": "Ctrl+N",
    "Add Child": "Tab",
    "Add Sibling": "Enter",
    "Delete": "Delete",
    "Collapse/Expand": "Space",
    "Edit Label": "F2",
    "Copy": "Ctrl+C",
    "Paste": "Ctrl+V",
    "Focus Mode": "Ctrl+Shift+F",
    "Goto Node": "Ctrl+G",
    "Quick Add": "Ctrl+Enter",
  };

  const merged = { ...defaultShortcuts, ...shortcuts };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 6, display: "block",
  };

  const cardStyle: React.CSSProperties = {
    padding: "8px 12px", margin: "2px 8px", borderRadius: 6, border: "1px solid #1e293b",
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Settings
      </div>

      {/* Theme */}
      <div style={cardStyle}>
        <label style={sectionLabel}>Theme</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Object.values(THEMES).map((t) => (
            <button key={t.name} onClick={() => setTheme(t.name)}
              style={{
                padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: theme === t.name ? t.accent + "30" : t.bg,
                border: `1px solid ${theme === t.name ? t.accent : "#334155"}`,
                color: theme === t.name ? t.accent : "#94a3b8",
                display: "flex", alignItems: "center", gap: 4,
              }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: t.accent, display: "inline-block" }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={cardStyle}>
        <label style={sectionLabel}>Grid Style</label>
        <div style={{ display: "flex", gap: 4 }}>
          {(["dots", "lines", "cross", "none"] as GridStyle[]).map((g) => (
            <button key={g} onClick={() => setGridStyle(g)}
              style={{
                padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: gridStyle === g ? "#6366f130" : "#0f172a",
                border: `1px solid ${gridStyle === g ? "#6366f1" : "#334155"}`,
                color: gridStyle === g ? "#6366f1" : "#64748b",
                textTransform: "capitalize",
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={cardStyle}>
        <label style={sectionLabel}>Display</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Toggle label="Minimap" value={showMinimap} onChange={setShowMinimap} />
          <Toggle label="Status Bar" value={showStatusBar} onChange={setShowStatusBar} />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={cardStyle}>
        <label style={sectionLabel}>Keyboard Shortcuts</label>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {Object.entries(merged).map(([action, key]) => (
            <div key={action} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{action}</span>
              {editingShortcut === action ? (
                <input autoFocus onKeyDown={(e) => {
                  e.preventDefault();
                  const combo = [e.ctrlKey && "Ctrl", e.shiftKey && "Shift", e.altKey && "Alt", e.key !== "Control" && e.key !== "Shift" && e.altKey && e.key].filter(Boolean).join("+");
                  setShortcuts({ ...shortcuts, [action]: combo });
                  setEditingShortcut(null);
                }} onBlur={() => setEditingShortcut(null)}
                  style={{ width: 80, background: "#0f172a", border: "1px solid #6366f1", borderRadius: 4, padding: "2px 4px", color: "#e2e8f0", fontSize: 11, textAlign: "right", outline: "none" }} />
              ) : (
                <button onClick={() => setEditingShortcut(action)}
                  style={{ background: "none", border: "1px solid #334155", borderRadius: 4, padding: "2px 6px", color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
                  {key}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      <button onClick={() => onChange(!value)}
        style={{
          width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer",
          background: value ? "#6366f1" : "#334155", position: "relative", transition: "background 0.2s",
        }}>
        <span style={{
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: value ? 16 : 2, transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}
