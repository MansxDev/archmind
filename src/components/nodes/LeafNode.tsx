import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { useFlowStore, NodeData, STATUSES, PRIORITIES } from "../../hooks/useFlowStore";

export const LeafNode = memo(function LeafNode({ data, id, selected }: NodeProps) {
  const nd = data as unknown as NodeData;
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const editingNodeId = useFlowStore((s) => s.editingNodeId);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);
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
        padding: "7px 16px", borderRadius: 8,
        border: `1.5px solid ${selected ? "#ffffff" : nd.color}`,
        background: `${nd.color}10`, backdropFilter: "blur(4px)",
        color: "#cbd5e1", fontSize: nd.fontSize, fontWeight: 500,
        boxShadow: selected ? `0 0 0 3px ${nd.color}40, 0 4px 16px rgba(0,0,0,0.35)` : "0 2px 8px rgba(0,0,0,0.2)",
        cursor: "grab", minWidth: 50, textAlign: "center",
        transition: "box-shadow 0.2s, border-color 0.2s", position: "relative",
      }}>
        {nd.status !== "none" && statusInfo && (
          <div style={{ position: "absolute", top: -6, left: -6, background: statusInfo.color, color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 5, padding: "1px 4px", lineHeight: "12px", zIndex: 11 }}>
            {statusInfo.icon}
          </div>
        )}
        {nd.priority !== "none" && priorityInfo && (
          <div style={{ position: "absolute", top: -6, right: -6, background: priorityInfo.color, color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 5, padding: "1px 4px", lineHeight: "12px", zIndex: 11 }}>
            {nd.priority}
          </div>
        )}

        {isEditing ? (
          <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKeyDown} autoFocus
            style={{ background: "transparent", border: "none", outline: "none", color: "inherit", fontSize: "inherit", fontWeight: "inherit", textAlign: "center", width: "100%", fontFamily: "inherit" }} />
        ) : (
          <span>{nd.emoji} {nd.label}</span>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: nd.color, width: 8, height: 8, border: "2px solid #0f172a" }} />
    </div>
  );
});
