import { useState, useEffect, useRef, useMemo } from "react";
import { useFlowStore, NodeData } from "../hooks/useFlowStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GotoNode({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodes = useFlowStore((s) => s.nodes);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const matches = useMemo(() => {
    if (!query) return nodes.slice(0, 20);
    const q = query.toLowerCase();
    return nodes
      .filter((n) => {
        const nd = n.data as NodeData;
        return nd.label.toLowerCase().includes(q) || nd.emoji.includes(q) || nd.tags.some((t) => t.toLowerCase().includes(q));
      })
      .slice(0, 20);
  }, [nodes, query]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!isOpen) return null;

  const handleSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, matches.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && matches[selectedIndex]) { handleSelect(matches[selectedIndex].id); }
    if (e.key === "Escape") onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20vh" }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#1e293b", borderRadius: 12, border: "1px solid #334155",
        padding: 16, width: 500, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", maxHeight: "60vh", overflow: "hidden",
      }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>🔍 Goto Node</div>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, emoji, or tag..."
          style={{
            width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: "10px 14px", color: "#e2e8f0", fontSize: 15, outline: "none", fontFamily: "inherit",
          }} />
        <div style={{ marginTop: 8, maxHeight: 300, overflowY: "auto" }}>
          {matches.map((n, i) => {
            const nd = n.data as NodeData;
            return (
              <div key={n.id} onClick={() => handleSelect(n.id)}
                style={{
                  padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                  background: i === selectedIndex ? "#6366f130" : "transparent",
                  border: i === selectedIndex ? "1px solid #6366f1" : "1px solid transparent",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                  color: i === selectedIndex ? "#e2e8f0" : "#94a3b8",
                }}>
                <span>{nd.emoji}</span>
                <span style={{ flex: 1 }}>{nd.label}</span>
                <span style={{ fontSize: 10, color: "#475569" }}>{n.type}</span>
              </div>
            );
          })}
          {matches.length === 0 && (
            <div style={{ padding: 8, color: "#475569", fontSize: 12 }}>No nodes found</div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
          ↑↓ to navigate · Enter to select · Esc to close
        </div>
      </div>
    </div>
  );
}
