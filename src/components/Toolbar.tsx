import { useState, useRef, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore, NodeData } from "../hooks/useFlowStore";
import { invokeSaveMindmap, invokeOpenMindmap, invokeExportSvg, MindmapData } from "../lib/tauri-commands";
import { exportToMarkdown } from "../lib/export-markdown";

function buildMindmapData(state: any, viewport: any): MindmapData {
  return {
    version: "1.0.0",
    viewport,
    nodes: state.nodes.map((n: any) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: n.data.label,
        color: n.data.color,
        fontSize: n.data.fontSize,
        parentId: n.data.parentId,
        collapsed: n.data.collapsed ?? false,
        description: n.data.description ?? "",
      },
    })),
    edges: state.edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type ?? "custom",
      animated: true,
      label: e.label ?? "",
      style: {
        stroke: (e.style as any)?.stroke ?? "#6366f1",
        strokeWidth: (e.style as any)?.strokeWidth ?? 2,
      },
    })),
  };
}

export default function Toolbar() {
  const { getViewport, fitView } = useReactFlow();
  const [openMenu, setOpenMenu] = useState<"file" | "edit" | "view" | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    currentFilePath, hasUnsavedChanges, lastSaved, nodes, edges,
    undo, redo, past, future, addChildNode, addRootNode,
    collapseAll, expandAll, setPresentationMode, setCommandPaletteOpen,
    recentFiles, addRecentFile, setCurrentFilePath, loadFromFile, clearAll, markSaved,
  } = useFlowStore();

  // close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSave = async () => {
    const state = useFlowStore.getState();
    const viewport = getViewport();
    const data = buildMindmapData(state, viewport);
    const path = await invokeSaveMindmap(state.currentFilePath, data);
    if (path) { setCurrentFilePath(path); addRecentFile(path); markSaved(); }
    setOpenMenu(null);
  };

  const handleOpen = async (filePath?: string) => {
    const data = await invokeOpenMindmap(filePath ?? null);
    if (data) { loadFromFile(data); const path = filePath || (data as any).filePath; if (path) { setCurrentFilePath(path); addRecentFile(path); } }
    setOpenMenu(null);
    setShowRecent(false);
  };

  const handleExportSvg = async () => {
    const svgEl = document.querySelector(".react-flow__viewport")?.closest(".react-flow") as HTMLElement;
    if (!svgEl) return;
    const nodes = useFlowStore.getState().nodes;
    const bounds = nodes.reduce(
      (b, n) => ({
        minX: Math.min(b.minX, n.position.x),
        minY: Math.min(b.minY, n.position.y),
        maxX: Math.max(b.maxX, n.position.x + 200),
        maxY: Math.max(b.maxY, n.position.y + 80),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
    const padding = 50;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    clonedSvg.setAttribute("viewBox", `${bounds.minX - padding} ${bounds.minY - padding} ${width} ${height}`);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#0f172a");
    clonedSvg.insertBefore(bg, clonedSvg.firstChild);
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const path = await invokeExportSvg(svgData, null);
    if (path) addRecentFile(path);
    setOpenMenu(null);
  };

  const handleExportMarkdown = () => {
    const state = useFlowStore.getState();
    const md = exportToMarkdown(state.nodes, state.edges);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmap.md";
    a.click();
    URL.revokeObjectURL(url);
    setOpenMenu(null);
  };

  const handleNew = () => {
    if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) return;
    clearAll();
    setOpenMenu(null);
  };

  const btnStyle = (active = false) => ({
    background: active ? "#334155" : "transparent",
    border: "none",
    color: "#94a3b8",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500 as const,
    fontFamily: "inherit",
    transition: "all 0.15s",
  });

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 4,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 4,
    zIndex: 50,
    minWidth: 180,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  };

  const menuItemStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: 13,
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 4,
    fontFamily: "inherit",
  };

  const fileExists = !!currentFilePath;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 40,
        display: "flex",
        gap: 2,
        alignItems: "center",
        background: "#0f172a",
        borderRadius: 10,
        border: "1px solid #1e293b",
        padding: "4px 6px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
      ref={menuRef}
    >
      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={past.length === 0}
        title={`Undo (${past.length})`}
        style={{ ...btnStyle(), opacity: past.length === 0 ? 0.3 : 1 }}
      >
        ↶
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        title={`Redo (${future.length})`}
        style={{ ...btnStyle(), opacity: future.length === 0 ? 0.3 : 1 }}
      >
        ↷
      </button>

      <div style={{ width: 1, height: 20, background: "#334155", margin: "0 4px" }} />

      {/* FILE */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenMenu(openMenu === "file" ? null : "file")} style={btnStyle(openMenu === "file")}>
          File {hasUnsavedChanges && "•"}
        </button>
        {openMenu === "file" && (
          <div style={menuStyle}>
            <button style={menuItemStyle} onClick={handleNew}>New</button>
            <button style={menuItemStyle} onClick={() => handleOpen()}>Open…</button>
            {fileExists && <button style={menuItemStyle} onClick={handleSave}>Save</button>}
            <button style={menuItemStyle} onClick={handleSave}>Save As…</button>

            <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />

            <button style={menuItemStyle} onClick={handleExportSvg}>Export SVG</button>
            <button style={menuItemStyle} onClick={handleExportMarkdown}>Export Markdown</button>

            {/* Recent files */}
            {recentFiles.length > 0 && (
              <>
                <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
                <div style={{ padding: "4px 12px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Recent</div>
                {recentFiles.map((f) => (
                  <button key={f} style={{ ...menuItemStyle, fontSize: 12, color: "#94a3b8" }} onClick={() => handleOpen(f)}>
                    {f.split("/").pop()}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* EDIT */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")} style={btnStyle(openMenu === "edit")}>
          Edit
        </button>
        {openMenu === "edit" && (
          <div style={menuStyle}>
            <button style={menuItemStyle} onClick={() => { undo(); setOpenMenu(null); }}>Undo <span style={{ color: "#64748b", fontSize: 11 }}>Ctrl+Z</span></button>
            <button style={menuItemStyle} onClick={() => { redo(); setOpenMenu(null); }}>Redo <span style={{ color: "#64748b", fontSize: 11 }}>Ctrl+Shift+Z</span></button>
            <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
            <button style={menuItemStyle} onClick={() => { const id = useFlowStore.getState().selectedNodeId; if (id) { addChildNode(id); } setOpenMenu(null); }}>
              Add Child <span style={{ color: "#64748b", fontSize: 11 }}>Tab</span>
            </button>
            <button style={menuItemStyle} onClick={() => { addRootNode(); setOpenMenu(null); }}>Add Root</button>
            <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
            <button style={menuItemStyle} onClick={() => { setCommandPaletteOpen(true); setOpenMenu(null); }}>
              Command Palette <span style={{ color: "#64748b", fontSize: 11 }}>Ctrl+Shift+P</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpenMenu(openMenu === "view" ? null : "view")} style={btnStyle(openMenu === "view")}>
          View
        </button>
        {openMenu === "view" && (
          <div style={menuStyle}>
            <button style={menuItemStyle} onClick={() => { collapseAll(); setOpenMenu(null); }}>Collapse All</button>
            <button style={menuItemStyle} onClick={() => { expandAll(); setOpenMenu(null); }}>Expand All</button>
            <div style={{ height: 1, background: "#334155", margin: "4px 0" }} />
            <button style={menuItemStyle} onClick={() => { fitView({ duration: 300 }); setOpenMenu(null); }}>Fit View</button>
            <button style={menuItemStyle} onClick={() => { setPresentationMode(true); setOpenMenu(null); }}>
              Presentation <span style={{ color: "#64748b", fontSize: 11 }}>F5</span>
            </button>
          </div>
        )}
      </div>

      {/* Right side info */}
      <div style={{ marginLeft: "auto", paddingLeft: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {lastSaved && (
          <span style={{ fontSize: 11, color: "#475569" }}>
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
        <span style={{ fontSize: 11, color: "#334155" }}>
          {nodes.length}N · {edges.length}E
        </span>
      </div>
    </div>
  );
}
