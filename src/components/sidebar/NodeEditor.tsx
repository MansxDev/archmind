import { useState } from "react";
import { useFlowStore, STATUSES, PRIORITIES, SHAPES, EMOJIS, NodeStatus, NodePriority, NodeShape, NodeData } from "../../hooks/useFlowStore";

export default function NodeEditor() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const setNodeStatus = useFlowStore((s) => s.setNodeStatus);
  const setNodePriority = useFlowStore((s) => s.setNodePriority);
  const setNodeEmoji = useFlowStore((s) => s.setNodeEmoji);
  const setNodeShape = useFlowStore((s) => s.setNodeShape);
  const addTagToNode = useFlowStore((s) => s.addTagToNode);
  const removeTagFromNode = useFlowStore((s) => s.removeTagFromNode);
  const toggleFavorite = useFlowStore((s) => s.toggleFavorite);
  const removeNode = useFlowStore((s) => s.removeNode);
  const toggleCollapse = useFlowStore((s) => s.toggleCollapse);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);
  const duplicateSubtree = useFlowStore((s) => s.duplicateSubtree);
  const copyNode = useFlowStore((s) => s.copyNode);

  const [newTag, setNewTag] = useState("");

  const node = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  if (!node) return <div style={{ padding: 16, color: "#475569", fontSize: 13 }}>Select a node to edit</div>;
  const nd = node.data as NodeData;

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 6,
    padding: "6px 10px", color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1e293b",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 6, display: "block",
  };

  return (
    <div style={{ padding: "12px 8px" }}>
      {/* Header */}
      <div style={{ ...sectionStyle, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{nd.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{nd.label}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{node.type} · {nd.parentId ? "child" : "root"}</div>
        </div>
        <button onClick={() => toggleFavorite(node.id)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }}>
          {nd.isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Emoji Picker */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Emoji</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setNodeEmoji(node.id, e)}
              style={{ width: 28, height: 28, border: nd.emoji === e ? "2px solid #6366f1" : "1px solid #334155", borderRadius: 4, background: nd.emoji === e ? "#6366f118" : "transparent", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Status</label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button key={s.value} onClick={() => setNodeStatus(node.id, s.value)}
              style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: nd.status === s.value ? s.color + "30" : "#0f172a",
                border: `1px solid ${nd.status === s.value ? s.color : "#334155"}`,
                color: nd.status === s.value ? s.color : "#64748b",
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Priority</label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {PRIORITIES.map((p) => (
            <button key={p.value} onClick={() => setNodePriority(node.id, p.value)}
              style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: nd.priority === p.value ? p.color + "30" : "#0f172a",
                border: `1px solid ${nd.priority === p.value ? p.color : "#334155"}`,
                color: nd.priority === p.value ? p.color : "#64748b",
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shape */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Shape</label>
        <div style={{ display: "flex", gap: 4 }}>
          {SHAPES.map((s) => (
            <button key={s.value} onClick={() => setNodeShape(node.id, s.value)}
              style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: nd.shape === s.value ? "#6366f130" : "#0f172a",
                border: `1px solid ${nd.shape === s.value ? "#6366f1" : "#334155"}`,
                color: nd.shape === s.value ? "#6366f1" : "#64748b",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Tags</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
          {nd.tags.map((t) => (
            <span key={t} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "#6366f120", color: "#6366f1", border: "1px solid #6366f140", display: "flex", alignItems: "center", gap: 4 }}>
              {t}
              <button onClick={() => removeTagFromNode(node.id, t)} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 10, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..."
            onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) { addTagToNode(node.id, newTag.trim()); setNewTag(""); } }}
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => { if (newTag.trim()) { addTagToNode(node.id, newTag.trim()); setNewTag(""); } }}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>+</button>
        </div>
      </div>

      {/* Description */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Description</label>
        <textarea value={nd.description} onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          placeholder="Markdown notes..." rows={4}
          style={{ ...inputStyle, resize: "vertical", minHeight: 80, fontFamily: "monospace", fontSize: 12 }} />
        <div style={{ fontSize: 10, color: "#475569", textAlign: "right", marginTop: 2 }}>
          {nd.description.length} chars · {calcWordCount(nd.description)} words
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <button onClick={() => setEditingNode(node.id)} style={actionBtn}>✏️ Edit</button>
        <button onClick={() => toggleCollapse(node.id)} style={actionBtn}>📁 Collapse</button>
        <button onClick={() => duplicateSubtree(node.id)} style={actionBtn}>📋 Duplicate</button>
        <button onClick={() => copyNode(node.id)} style={actionBtn}>📄 Copy</button>
        <button onClick={() => removeNode(node.id)} style={{ ...actionBtn, color: "#ef4444" }}>🗑️ Delete</button>
      </div>
    </div>
  );
}

function calcWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const actionBtn: React.CSSProperties = {
  padding: "4px 8px", borderRadius: 4, border: "1px solid #334155", background: "#0f172a",
  color: "#94a3b8", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
};
