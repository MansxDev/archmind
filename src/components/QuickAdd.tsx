import { useState, useEffect, useRef } from "react";
import { useFlowStore } from "../hooks/useFlowStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAdd({ isOpen, onClose }: Props) {
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addChildNode = useFlowStore((s) => s.addChildNode);
  const addRootNode = useFlowStore((s) => s.addRootNode);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);

  useEffect(() => {
    if (isOpen) { setLabel(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!label.trim()) return;
    const id = selectedNodeId ? addChildNode(selectedNodeId) : addRootNode();
    if (id) {
      useFlowStore.getState().updateNodeData(id, { label: label.trim() });
      setSelectedNode(id);
    }
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20vh" }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#1e293b", borderRadius: 12, border: "1px solid #334155",
        padding: 16, width: 400, boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
          Quick Add {selectedNodeId ? "child" : "root"} node
        </div>
        <input ref={inputRef} value={label} onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
          placeholder="Node label..."
          style={{
            width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: "10px 14px", color: "#e2e8f0", fontSize: 15, outline: "none", fontFamily: "inherit",
          }} />
        <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
          Enter to add · Escape to cancel
        </div>
      </div>
    </div>
  );
}
