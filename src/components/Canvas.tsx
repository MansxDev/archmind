import { useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Panel,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RootNode } from "./nodes/RootNode";
import { BranchNode } from "./nodes/BranchNode";
import { LeafNode } from "./nodes/LeafNode";
import GSAPAnimatedEdge from "./edges/GSAPAnimatedEdge";
import { useFlowStore, NodeData } from "../hooks/useFlowStore";
import { useAutoSave } from "../hooks/useAutoSave";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";
import SearchBar from "./SearchBar";
import PresentationMode from "./PresentationMode";
import QuickAdd from "./QuickAdd";
import GotoNode from "./GotoNode";

const nodeTypes = { root: RootNode, branch: BranchNode, leaf: LeafNode };
const edgeTypes = { custom: GSAPAnimatedEdge };

function getVisibleNodes(nodes: { id: string; data: any }[], activeTagFilter: string[], focusMode: boolean, focusNodeId: string | null): Set<string> {
  const hidden = new Set<string>();

  // Hide collapsed descendants
  for (const node of nodes) {
    if (node.data.collapsed) {
      const stack = [node.id];
      while (stack.length > 0) {
        const current = stack.pop()!;
        for (const n of nodes) {
          if (n.data.parentId === current && !hidden.has(n.id)) {
            hidden.add(n.id);
            stack.push(n.id);
          }
        }
      }
    }
  }

  // Hide nodes not matching tag filter
  if (activeTagFilter.length > 0) {
    for (const n of nodes) {
      if (!hidden.has(n.id)) {
        const nodeTags = (n.data as any).tags ?? [];
        if (!activeTagFilter.some((t) => nodeTags.includes(t))) {
          hidden.add(n.id);
        }
      }
    }
  }

  // Focus mode — hide everything except ancestors + descendants of focused node
  if (focusMode && focusNodeId) {
    const ancestorIds = new Set<string>();
    let current: string | null = focusNodeId;
    while (current) {
      ancestorIds.add(current);
      const node = nodes.find((n) => n.id === current);
      current = node?.data?.parentId ?? null;
    }
    const descendantIds = new Set<string>();
    const stack = [focusNodeId];
    while (stack.length > 0) {
      const cid = stack.pop()!;
      for (const n of nodes) {
        if (n.data.parentId === cid) {
          descendantIds.add(n.id);
          stack.push(n.id);
        }
      }
    }
    const keepIds = new Set([...ancestorIds, ...descendantIds]);
    for (const n of nodes) {
      if (!keepIds.has(n.id) && !hidden.has(n.id)) {
        hidden.add(n.id);
      }
    }
  }

  return hidden;
}

function CanvasInner() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const toggleMultiSelect = useFlowStore((s) => s.toggleMultiSelect);
  const clearMultiSelect = useFlowStore((s) => s.clearMultiSelect);
  const addChildNode = useFlowStore((s) => s.addChildNode);
  const addSiblingNode = useFlowStore((s) => s.addSiblingNode);
  const removeSelected = useFlowStore((s) => s.removeSelected);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const toggleCollapse = useFlowStore((s) => s.toggleCollapse);
  const copyNode = useFlowStore((s) => s.copyNode);
  const pasteNode = useFlowStore((s) => s.pasteNode);
  const setSearchOpen = useFlowStore((s) => s.setSearchOpen);
  const setCommandPaletteOpen = useFlowStore((s) => s.setCommandPaletteOpen);
  const setPresentationMode = useFlowStore((s) => s.setPresentationMode);
  const setEditingNode = useFlowStore((s) => s.setEditingNode);
  const navigateToNode = useFlowStore((s) => s.navigateToNode);
  const setFocusMode = useFlowStore((s) => s.setFocusMode);
  const focusMode = useFlowStore((s) => s.focusMode);
  const focusNodeId = useFlowStore((s) => s.focusNodeId);
  const activeTagFilter = useFlowStore((s) => s.activeTagFilter);
  const gridStyle = useFlowStore((s) => s.gridStyle);
  const showMinimap = useFlowStore((s) => s.showMinimap);
  const duplicateSubtree = useFlowStore((s) => s.duplicateSubtree);
  const toggleFavorite = useFlowStore((s) => s.toggleFavorite);

  const { fitView } = useReactFlow();
  const flowRef = useRef<HTMLDivElement>(null);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [gotoOpen, setGotoOpen] = React.useState(false);

  useAutoSave(() => ({ x: 0, y: 0, zoom: 1 }));
  useUnsavedGuard();

  const viewportRestored = useRef(false);
  useEffect(() => {
    if (viewportRestored.current) return;
    viewportRestored.current = true;
    const saved = localStorage.getItem("archmind-viewport");
    if (saved) {
      try { setTimeout(() => fitView({ duration: 0, ...JSON.parse(saved) }), 100); } catch {}
    }
  }, [fitView]);

  const handleAutoLayout = useCallback(async () => {
    const { nodes: ns, edges: es } = useFlowStore.getState();
    const dagre = (await import("dagre")).default;
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 200, marginx: 50, marginy: 50 });
    g.setDefaultEdgeLabel(() => ({}));
    ns.forEach((n: any) => g.setNode(n.id, { width: 200, height: 80 }));
    es.forEach((e: any) => g.setEdge(e.source, e.target));
    dagre.layout(g);
    useFlowStore.setState({
      nodes: ns.map((n: any) => ({ ...n, position: g.node(n.id) || n.position })),
      hasUnsavedChanges: true,
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    const store = useFlowStore.getState();
    const sel = store.selectedNodeId;

    // Global shortcuts
    if (e.ctrlKey && e.key === "f") { e.preventDefault(); setSearchOpen(true); return; }
    if (e.ctrlKey && e.shiftKey && e.key === "P") { e.preventDefault(); setCommandPaletteOpen(!store.commandPaletteOpen); return; }
    if (e.key === "F5") { e.preventDefault(); setPresentationMode(!store.presentationMode); return; }
    if (e.ctrlKey && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); return; }
    if (e.ctrlKey && e.key === "c" && sel) { e.preventDefault(); copyNode(sel); return; }
    if (e.ctrlKey && e.key === "v") { e.preventDefault(); pasteNode(sel); return; }
    if (e.ctrlKey && e.key === "l") { e.preventDefault(); handleAutoLayout(); return; }
    if (e.ctrlKey && e.key === "g") { e.preventDefault(); setGotoOpen(true); return; }
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); setQuickAddOpen(true); return; }
    if (e.ctrlKey && e.shiftKey && e.key === "F") { e.preventDefault(); setFocusMode(!store.focusMode, store.selectedNodeId); return; }

    if (!sel) return;

    if (e.key === "Tab") { e.preventDefault(); const id = addChildNode(sel); if (id) { setSelectedNode(id); setTimeout(() => setEditingNode(id), 50); } return; }
    if (e.key === "Enter" && !e.ctrlKey) { e.preventDefault(); const id = addSiblingNode(sel); if (id) { setSelectedNode(id); setTimeout(() => setEditingNode(id), 50); } return; }
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); removeSelected(); return; }
    if (e.key === " " && !e.ctrlKey) { e.preventDefault(); toggleCollapse(sel); return; }
    if (e.key === "F2") { e.preventDefault(); setEditingNode(sel); return; }
    if (e.ctrlKey && e.key === "d") { e.preventDefault(); duplicateSubtree(sel); return; }
    if (e.ctrlKey && e.key === "b") { e.preventDefault(); toggleFavorite(sel); return; }

    if (e.key === "ArrowRight") { e.preventDefault(); navigateToNode("right"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); navigateToNode("left"); }
    if (e.key === "ArrowDown") { e.preventDefault(); navigateToNode("down"); }
    if (e.key === "ArrowUp") { e.preventDefault(); navigateToNode("up"); }
  }, [setSelectedNode, addChildNode, addSiblingNode, removeSelected, toggleCollapse, undo, redo, setSearchOpen, setCommandPaletteOpen, setPresentationMode, copyNode, pasteNode, navigateToNode, setEditingNode, handleAutoLayout, setFocusMode, duplicateSubtree, toggleFavorite]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const hidden = useMemo(() => getVisibleNodes(nodes, activeTagFilter, focusMode, focusNodeId), [nodes, activeTagFilter, focusMode, focusNodeId]);
  const visibleNodes = useMemo(() => nodes.filter((n) => !hidden.has(n.id)), [nodes, hidden]);
  const visibleEdges = useMemo(() => edges.filter((e) => !hidden.has(e.source) && !hidden.has(e.target)), [edges, hidden]);

  const selectedCount = useFlowStore((s) => {
    let count = 0;
    if (s.selectedNodeId) count++;
    count += s.multiSelectedIds.size;
    return count;
  });

  const handleDeleteAll = useCallback(() => {
    if (selectedCount > 1) removeSelected();
  }, [selectedCount, removeSelected]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    const ev = window.event as MouseEvent | undefined;
    if (ev && ev.shiftKey) { toggleMultiSelect(node.id); }
    else { setSelectedNode(node.id); clearMultiSelect(); }
  }, [setSelectedNode, toggleMultiSelect, clearMultiSelect]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    clearMultiSelect();
  }, [setSelectedNode, clearMultiSelect]);

  const gridGap = gridStyle === "none" ? 0 : 16;

  return (
    <div style={{ width: "100%", height: "100%", background: "#0f172a" }} ref={flowRef}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
        connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
        defaultEdgeOptions={{ type: "custom", animated: false, style: { stroke: "#6366f1", strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
      >
        {gridStyle !== "none" && <Background color="#334155" gap={gridGap} size={gridStyle === "cross" ? 1.5 : 1} />}
        {showMinimap && (
          <MiniMap
            nodeColor={(n) => (n.data as NodeData).color ?? "#6366f1"}
            maskColor="rgba(0,0,0,0.5)"
            style={{ borderRadius: 8, border: "1px solid #334155" }}
            pannable zoomable
          />
        )}
        {selectedCount > 1 && (
          <Panel position="top-center" style={{ background: "#1e293b", borderRadius: 8, padding: "6px 16px", border: "1px solid #334155", color: "#94a3b8", fontSize: 13 }}>
            {selectedCount} nodes selected — <button onClick={handleDeleteAll} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Delete All</button>
          </Panel>
        )}
        {focusMode && (
          <Panel position="top-center" style={{ background: "#f9731620", borderRadius: 8, padding: "6px 16px", border: "1px solid #f97316", color: "#f97316", fontSize: 13, marginTop: selectedCount > 1 ? 40 : 0 }}>
            🎯 Focus Mode — <button onClick={() => setFocusMode(false)} style={{ color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>Exit</button>
          </Panel>
        )}
      </ReactFlow>
      <SearchBar />
      <PresentationMode />
      <QuickAdd isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <GotoNode isOpen={gotoOpen} onClose={() => setGotoOpen(false)} />
    </div>
  );
}

import React from "react";

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
