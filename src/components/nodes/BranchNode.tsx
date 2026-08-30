import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useFlowStore, NodeData, STATUSES, PRIORITIES } from "../../hooks/useFlowStore";

export const BranchNode = memo(function BranchNode({ data, id, selected }: NodeProps) {
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
        padding: "10px 20px", borderRadius: 10,
        border: `2px solid ${selected ? "#ffffff" : nd.color}`,
        background: `${nd.color}15`, backdropFilter: "blur(4px)",
        color: "#e2e8f0", fontSize: nd.fontSize, fontWeight: 600,
        boxShadow: selected ? `0 0 0 3px ${nd.color}40, 0 6px 24px rgba(0,0,0,0.4)` : "0 3px 12px rgba(0,0,0,0.25)",
        cursor: "grab", minWidth: 70, textAlign: "center",
        transition: "box-shadow 0.2s, border-color 0.2s", position: "relative",
      }}>
        {nd.status !== "none" && statusInfo && (
          <div style={{ position: "absolute", top: -7, left: -7, background: statusInfo.color, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "1px 5px", lineHeight: "14px", zIndex: 11 }}>
            {statusInfo.icon}
          </div>
        )}
        {nd.priority !== "none" && priorityInfo && (
          <div style={{ position: "absolute", top: -7, right: -7, background: priorityInfo.color, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "1px 5px", lineHeight: "14px", zIndex: 11 }}>
            {nd.priority}
          </div>
        )}

        {isEditing ? (
          <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKeyDown} autoFocus
            style={{ background: "transparent", border: "none", outline: "none", color: "inherit", fontSize: "inherit", fontWeight: "inherit", textAlign: "center", width: "100%", fontFamily: "inherit" }} />
        ) : (
          <span>{nd.emoji} {nd.label}</span>
        )}

        {nd.tags.length > 0 && (
          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }}>
            {nd.tags.slice(0, 2).map((t) => (
              <span key={t} style={{ fontSize: 9, background: "#ffffff15", padding: "1px 5px", borderRadius: 4, color: "#ffffffaa" }}>#{t}</span>
            ))}
            {nd.tags.length > 2 && <span style={{ fontSize: 9, color: "#ffffff70" }}>+{nd.tags.length - 2}</span>}
          </div>
        )}

        <button onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
          style={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: "#1e293b", border: `2px solid ${nd.color}`, color: nd.color, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontWeight: 700, zIndex: 10 }}>
          {nd.collapsed ? "+" : "−"}
        </button>

        {nd.collapsed && childCount > 0 && (
          <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", background: nd.color, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", lineHeight: "16px", zIndex: 10 }}>
            {childCount}
          </div>
        )}

        <button onClick={(e) => { e.stopPropagation(); addChildNode(id); }}
          style={{ position: "absolute", bottom: -10, right: -10, width: 20, height: 20, borderRadius: "50%", background: "#1e293b", border: `2px solid ${nd.color}`, color: nd.color, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, zIndex: 10 }}>
          +
        </button>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: nd.color, width: 9, height: 9, border: "2px solid #0f172a" }} />
      <Handle type="target" position={Position.Left} style={{ background: nd.color, width: 9, height: 9, border: "2px solid #0f172a" }} />
    </div>
  );
});
