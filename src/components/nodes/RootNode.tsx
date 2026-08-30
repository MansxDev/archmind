import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useFlowStore, NodeData, STATUSES, PRIORITIES } from "../../hooks/useFlowStore";

export const RootNode = memo(function RootNode({ data, id, selected }: NodeProps) {
  const nd = data as unknown as NodeData;
  const addChildNode = useFlowStore((s) => s.addChildNode);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const editingNodeId = useFlowStore((s) => s.editingNodeId);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);
  const toggleCollapse = useFlowStore((s) => s.toggleCollapse);
  const nodes = useFlowStore((s) => s.nodes);
  const childCount = nodes.filter((n) => n.data.parentId === id).length;
  const isEditing = editingNodeId === id;
  const [editValue, setEditValue] = useState(nd.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) { setEditValue(nd.label); setTimeout(() => inputRef.current?.focus(), 0); } }, [isEditing, nd.label]);

  const handleDoubleClick = (e: React.MouseEvent) => { e.stopPropagation(); setEditingNode(id); };
  const commitEdit = () => { const val = editValue.trim(); if (val) updateNodeData(id, { label: val }); setEditingNode(null); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); commitEdit(); } if (e.key === "Escape") setEditingNode(null); e.stopPropagation(); };

  const statusInfo = STATUSES.find((s) => s.value === nd.status);
  const priorityInfo = PRIORITIES.find((p) => p.value === nd.priority);

  return (
    <div onDoubleClick={handleDoubleClick}>
      <div style={{
        padding: "14px 28px", borderRadius: 12,
        border: `2.5px solid ${selected ? "#ffffff" : nd.color}`,
        background: `${nd.color}18`, backdropFilter: "blur(4px)",
        color: "#f8fafc", fontSize: nd.fontSize, fontWeight: 700,
        boxShadow: selected ? `0 0 0 3px ${nd.color}40, 0 8px 32px rgba(0,0,0,0.5)` : "0 4px 16px rgba(0,0,0,0.3)",
        cursor: "grab", minWidth: 80, textAlign: "center",
        transition: "box-shadow 0.2s, border-color 0.2s", position: "relative",
      }}>
        {/* Status badge */}
        {nd.status !== "none" && statusInfo && (
          <div style={{ position: "absolute", top: -8, left: -8, background: statusInfo.color, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "1px 5px", lineHeight: "14px", zIndex: 11 }}>
            {statusInfo.icon}
          </div>
        )}
        {/* Priority badge */}
        {nd.priority !== "none" && priorityInfo && (
          <div style={{ position: "absolute", top: -8, right: -8, background: priorityInfo.color, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "1px 5px", lineHeight: "14px", zIndex: 11 }}>
            {nd.priority}
          </div>
        )}

        {isEditing ? (
          <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKeyDown} autoFocus
            style={{ background: "transparent", border: "none", outline: "none", color: "inherit", fontSize: "inherit", fontWeight: "inherit", textAlign: "center", width: "100%", fontFamily: "inherit" }} />
        ) : (
          <span>{nd.emoji} {nd.label}</span>
        )}

        {/* Tags */}
        {nd.tags.length > 0 && (
          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
            {nd.tags.slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 9, background: "#ffffff20", padding: "1px 5px", borderRadius: 4, color: "#ffffffcc" }}>#{t}</span>
            ))}
            {nd.tags.length > 3 && <span style={{ fontSize: 9, color: "#ffffff80" }}>+{nd.tags.length - 3}</span>}
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
          style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: "#1e293b", border: `2px solid ${nd.color}`, color: nd.color, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontWeight: 700, zIndex: 10 }}>
          {nd.collapsed ? "+" : "−"}
        </button>

        {/* Child count badge */}
        {nd.collapsed && childCount > 0 && (
          <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", background: nd.color, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", lineHeight: "16px", zIndex: 10 }}>
            {childCount}
          </div>
        )}

        {/* Add child */}
        <button onClick={(e) => { e.stopPropagation(); addChildNode(id); }}
          style={{ position: "absolute", bottom: -10, right: -10, width: 22, height: 22, borderRadius: "50%", background: "#1e293b", border: `2px solid ${nd.color}`, color: nd.color, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, zIndex: 10 }}>
          +
        </button>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: nd.color, width: 10, height: 10, border: "2px solid #0f172a" }} />
      <Handle type="target" position={Position.Left} style={{ background: nd.color, width: 10, height: 10, border: "2px solid #0f172a" }} />
    </div>
  );
});
