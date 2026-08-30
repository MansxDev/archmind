import { useState, useEffect, useMemo, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore } from "../hooks/useFlowStore";

const useClose = (onClose: () => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
};

export default function CommandPalette() {
  const isOpen = useFlowStore((s) => s.commandPaletteOpen);
  const setOpen = useFlowStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { fitView } = useReactFlow();

  useClose(() => setOpen(false));

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const commands = useMemo(() => {
    const store = useFlowStore.getState();
    return [
      { id: "save", label: "Save", shortcut: "Ctrl+S", category: "File", action: () => {} },
      { id: "open", label: "Open", shortcut: "Ctrl+O", category: "File", action: () => {} },
      { id: "new", label: "New Mindmap", shortcut: "Ctrl+N", category: "File", action: () => store.clearAll() },
      { id: "export-svg", label: "Export SVG", shortcut: "", category: "File", action: () => {} },
      { id: "export-md", label: "Export Markdown", shortcut: "", category: "File", action: () => {} },
      { id: "undo", label: "Undo", shortcut: "Ctrl+Z", category: "Edit", action: () => store.undo() },
      { id: "redo", label: "Redo", shortcut: "Ctrl+Shift+Z", category: "Edit", action: () => store.redo() },
      { id: "add-child", label: "Add Child Node", shortcut: "Tab", category: "Edit", action: () => { const id = store.addChildNode(store.selectedNodeId!); if (id) { store.setSelectedNode(id); setTimeout(() => store.setEditingNode(id), 50); } } },
      { id: "add-root", label: "Add Root Node", shortcut: "", category: "Edit", action: () => store.addRootNode() },
      { id: "collapse-all", label: "Collapse All", shortcut: "", category: "View", action: () => store.collapseAll() },
      { id: "expand-all", label: "Expand All", shortcut: "", category: "View", action: () => store.expandAll() },
      { id: "fit-view", label: "Fit View", shortcut: "Ctrl+Shift+F", category: "View", action: () => fitView({ duration: 300 }) },
      { id: "auto-layout", label: "Auto Layout", shortcut: "Ctrl+L", category: "View", action: () => {} },
      { id: "presentation", label: "Presentation Mode", shortcut: "F5", category: "View", action: () => store.setPresentationMode(true) },
      { id: "focus-mode", label: "Toggle Focus Mode", shortcut: "Ctrl+Shift+F", category: "View", action: () => store.setFocusMode(!store.focusMode, store.selectedNodeId) },
      { id: "goto", label: "Goto Node", shortcut: "Ctrl+G", category: "Navigate", action: () => {} },
      { id: "quick-add", label: "Quick Add Node", shortcut: "Ctrl+Enter", category: "Navigate", action: () => {} },
      { id: "search", label: "Search Nodes", shortcut: "Ctrl+F", category: "Navigate", action: () => store.setSearchOpen(true) },
      { id: "set-todo", label: "Set Status: To Do", shortcut: "", category: "Status", action: () => store.setNodeStatus(store.selectedNodeId!, "todo") },
      { id: "set-progress", label: "Set Status: In Progress", shortcut: "", category: "Status", action: () => store.setNodeStatus(store.selectedNodeId!, "in-progress") },
      { id: "set-done", label: "Set Status: Done", shortcut: "", category: "Status", action: () => store.setNodeStatus(store.selectedNodeId!, "done") },
      { id: "set-blocked", label: "Set Status: Blocked", shortcut: "", category: "Status", action: () => store.setNodeStatus(store.selectedNodeId!, "blocked") },
      { id: "set-p0", label: "Set Priority: P0", shortcut: "", category: "Priority", action: () => store.setNodePriority(store.selectedNodeId!, "P0") },
      { id: "set-p1", label: "Set Priority: P1", shortcut: "", category: "Priority", action: () => store.setNodePriority(store.selectedNodeId!, "P1") },
      { id: "set-p2", label: "Set Priority: P2", shortcut: "", category: "Priority", action: () => store.setNodePriority(store.selectedNodeId!, "P2") },
      { id: "set-p3", label: "Set Priority: P3", shortcut: "", category: "Priority", action: () => store.setNodePriority(store.selectedNodeId!, "P3") },
      { id: "toggle-fav", label: "Toggle Favorite", shortcut: "Ctrl+B", category: "Node", action: () => store.toggleFavorite(store.selectedNodeId!) },
      { id: "duplicate", label: "Duplicate Subtree", shortcut: "Ctrl+D", category: "Node", action: () => store.duplicateSubtree(store.selectedNodeId!) },
    ];
  }, [fitView]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIdx]) { filtered[selectedIdx].action(); setOpen(false); }
  };

  // Group by category
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((c) => { (grouped[c.category] = grouped[c.category] || []).push(c); });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "15vh" }}
      onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#1e293b", borderRadius: 12, border: "1px solid #334155",
        padding: 16, width: 500, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", maxHeight: "60vh", display: "flex", flexDirection: "column",
      }}>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          style={{
            width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: "10px 14px", color: "#e2e8f0", fontSize: 15, outline: "none", fontFamily: "inherit",
          }} />
        <div style={{ marginTop: 8, overflowY: "auto", flex: 1 }}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div style={{ padding: "6px 10px", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>{cat}</div>
              {items.map((c) => {
                const idx = filtered.indexOf(c);
                return (
                  <div key={c.id} onClick={() => { c.action(); setOpen(false); }}
                    style={{
                      padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                      background: idx === selectedIdx ? "#6366f130" : "transparent",
                      border: idx === selectedIdx ? "1px solid #6366f1" : "1px solid transparent",
                      display: "flex", alignItems: "center", fontSize: 13, color: idx === selectedIdx ? "#e2e8f0" : "#94a3b8",
                    }}>
                    <span style={{ flex: 1 }}>{c.label}</span>
                    {c.shortcut && <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{c.shortcut}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
