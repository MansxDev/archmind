import {
  Node, Edge, OnNodesChange, OnEdgesChange, OnConnect,
  applyNodeChanges, applyEdgeChanges, addEdge, Connection,
} from "@xyflow/react";
import { create } from "zustand";
import { MindmapData } from "../lib/tauri-commands";

// ─── Types ────────────────────────────────────────────────────
export type NodeShape = "rect" | "roundrect" | "circle" | "diamond" | "hexagon";
export type NodeStatus = "none" | "todo" | "in-progress" | "done" | "blocked";
export type NodePriority = "none" | "P0" | "P1" | "P2" | "P3";
export type EdgeStyle = "solid" | "dashed" | "dotted" | "curved";
export type ThemeName = "default" | "nord" | "dracula" | "solarized" | "gruvbox" | "catppuccin";
export type GridStyle = "dots" | "lines" | "cross" | "none";
export type SidebarPanel = "explorer" | "tags" | "stats" | "templates" | "favorites" | "settings" | "history" | "outline";

export interface NodeData {
  label: string;
  color: string;
  fontSize: number;
  parentId: string | null;
  collapsed: boolean;
  description: string;
  tags: string[];
  status: NodeStatus;
  priority: NodePriority;
  emoji: string;
  shape: NodeShape;
  isFavorite: boolean;
  crossLinks: string[];
  wordCount: number;
  [key: string]: unknown;
}

export interface HistoryEntry {
  nodes: Node<NodeData>[];
  edges: Edge[];
  timestamp: number;
  label: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: { type: string; label: string; color: string; parentId: string | null; emoji: string }[];
  edges: { source: string; target: string }[];
}

export interface Theme {
  name: ThemeName;
  label: string;
  bg: string;
  sidebar: string;
  surface: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  nodeColors: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────
const genId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const CHILD_TYPE: Record<string, "branch" | "leaf"> = { root: "branch", branch: "leaf", leaf: "leaf" };
const CHILD_STYLE: Record<string, { color: string; fontSize: number; label: string }> = {
  branch: { color: "#22c55e", fontSize: 18, label: "Branch" },
  leaf: { color: "#94a3b8", fontSize: 14, label: "Detail" },
};
const MAX_HISTORY = 100;
const MAX_RECENT = 10;

export const THEMES: Record<ThemeName, Theme> = {
  default: { name: "default", label: "Default Dark", bg: "#0f172a", sidebar: "#1e293b", surface: "#1e293b", border: "#334155", text: "#e2e8f0", textDim: "#94a3b8", accent: "#6366f1", nodeColors: {} },
  nord: { name: "nord", label: "Nord", bg: "#2e3440", sidebar: "#3b4252", surface: "#434c5e", border: "#4c566a", text: "#eceff4", textDim: "#a0a8b7", accent: "#88c0d0", nodeColors: {} },
  dracula: { name: "dracula", label: "Dracula", bg: "#282a36", sidebar: "#44475a", surface: "#44475a", border: "#6272a4", text: "#f8f8f2", textDim: "#6272a4", accent: "#bd93f9", nodeColors: {} },
  solarized: { name: "solarized", label: "Solarized Dark", bg: "#002b36", sidebar: "#073642", surface: "#073642", border: "#586e75", text: "#839496", textDim: "#586e75", accent: "#268bd2", nodeColors: {} },
  gruvbox: { name: "gruvbox", label: "Gruvbox", bg: "#282828", sidebar: "#3c3836", surface: "#3c3836", border: "#504945", text: "#ebdbb2", textDim: "#a89984", accent: "#d65d0e", nodeColors: {} },
  catppuccin: { name: "catppuccin", label: "Catppuccin Mocha", bg: "#1e1e2e", sidebar: "#313244", surface: "#313244", border: "#45475a", text: "#cdd6f4", textDim: "#a6adc8", accent: "#cba6f7", nodeColors: {} },
};

export const STATUSES: { value: NodeStatus; label: string; color: string; icon: string }[] = [
  { value: "none", label: "None", color: "transparent", icon: "" },
  { value: "todo", label: "To Do", color: "#64748b", icon: "○" },
  { value: "in-progress", label: "In Progress", color: "#3b82f6", icon: "◐" },
  { value: "done", label: "Done", color: "#22c55e", icon: "●" },
  { value: "blocked", label: "Blocked", color: "#ef4444", icon: "⊘" },
];

export const PRIORITIES: { value: NodePriority; label: string; color: string }[] = [
  { value: "none", label: "None", color: "transparent" },
  { value: "P0", label: "P0 — Critical", color: "#ef4444" },
  { value: "P1", label: "P1 — High", color: "#f97316" },
  { value: "P2", label: "P2 — Medium", color: "#eab308" },
  { value: "P3", label: "P3 — Low", color: "#64748b" },
];

export const SHAPES: { value: NodeShape; label: string }[] = [
  { value: "rect", label: "Rectangle" },
  { value: "roundrect", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "diamond", label: "Diamond" },
  { value: "hexagon", label: "Hexagon" },
];

export const EMOJIS = ["💡", "🎯", "📌", "🐛", "✅", "⚡", "🔥", "📝", "🚀", "🎨", "🔧", "💰", "⚠️", "❌", "🔒", "🌐", "📊", "🗂️", "💬", "🔔"];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "meeting", name: "Meeting Notes", description: "Structured meeting outline", icon: "📋",
    nodes: [
      { type: "root", label: "Meeting Title", color: "#6366f1", parentId: null, emoji: "📋" },
      { type: "branch", label: "Attendees", color: "#22c55e", parentId: "root", emoji: "👥" },
      { type: "branch", label: "Agenda", color: "#3b82f6", parentId: "root", emoji: "📝" },
      { type: "branch", label: "Decisions", color: "#f97316", parentId: "root", emoji: "⚖️" },
      { type: "branch", label: "Action Items", color: "#ef4444", parentId: "root", emoji: "🎯" },
      { type: "leaf", label: "Next Meeting", color: "#94a3b8", parentId: "Action Items", emoji: "📅" },
    ],
    edges: [{ source: "root", target: "Attendees" }, { source: "root", target: "Agenda" }, { source: "root", target: "Decisions" }, { source: "root", target: "Action Items" }, { source: "Action Items", target: "Next Meeting" }],
  },
  {
    id: "project", name: "Project Plan", description: "Project breakdown structure", icon: "🏗️",
    nodes: [
      { type: "root", label: "Project Name", color: "#6366f1", parentId: null, emoji: "🏗️" },
      { type: "branch", label: "Planning", color: "#22c55e", parentId: "root", emoji: "📋" },
      { type: "branch", label: "Design", color: "#8b5cf6", parentId: "root", emoji: "🎨" },
      { type: "branch", label: "Development", color: "#3b82f6", parentId: "root", emoji: "💻" },
      { type: "branch", label: "Testing", color: "#f97316", parentId: "root", emoji: "🧪" },
      { type: "branch", label: "Launch", color: "#ef4444", parentId: "root", emoji: "🚀" },
    ],
    edges: [{ source: "root", target: "Planning" }, { source: "root", target: "Design" }, { source: "root", target: "Development" }, { source: "root", target: "Testing" }, { source: "root", target: "Launch" }],
  },
  {
    id: "brainstorm", name: "Brainstorm", description: "Free-form idea generation", icon: "🧠",
    nodes: [
      { type: "root", label: "Big Idea", color: "#6366f1", parentId: null, emoji: "💡" },
      { type: "branch", label: "Idea 1", color: "#22c55e", parentId: "root", emoji: "💡" },
      { type: "branch", label: "Idea 2", color: "#3b82f6", parentId: "root", emoji: "💡" },
      { type: "branch", label: "Idea 3", color: "#f97316", parentId: "root", emoji: "💡" },
    ],
    edges: [{ source: "root", target: "Idea 1" }, { source: "root", target: "Idea 2" }, { source: "root", target: "Idea 3" }],
  },
  {
    id: "swot", name: "SWOT Analysis", description: "Strengths, Weaknesses, Opportunities, Threats", icon: "📊",
    nodes: [
      { type: "root", label: "SWOT Analysis", color: "#6366f1", parentId: null, emoji: "📊" },
      { type: "branch", label: "Strengths", color: "#22c55e", parentId: "root", emoji: "💪" },
      { type: "branch", label: "Weaknesses", color: "#ef4444", parentId: "root", emoji: "⚠️" },
      { type: "branch", label: "Opportunities", color: "#3b82f6", parentId: "root", emoji: "🌟" },
      { type: "branch", label: "Threats", color: "#f97316", parentId: "root", emoji: "🛡️" },
    ],
    edges: [{ source: "root", target: "Strengths" }, { source: "root", target: "Weaknesses" }, { source: "root", target: "Opportunities" }, { source: "root", target: "Threats" }],
  },
  {
    id: "user-journey", name: "User Journey", description: "User flow mapping", icon: "🗺️",
    nodes: [
      { type: "root", label: "User Goal", color: "#6366f1", parentId: null, emoji: "🎯" },
      { type: "branch", label: "Entry Point", color: "#22c55e", parentId: "root", emoji: "🚪" },
      { type: "branch", label: "Onboarding", color: "#3b82f6", parentId: "root", emoji: "👋" },
      { type: "branch", label: "Core Flow", color: "#8b5cf6", parentId: "root", emoji: "⚡" },
      { type: "branch", label: "Success", color: "#22c55e", parentId: "root", emoji: "🎉" },
    ],
    edges: [{ source: "root", target: "Entry Point" }, { source: "root", target: "Onboarding" }, { source: "root", target: "Core Flow" }, { source: "root", target: "Success" }],
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function collectDescendantIds(nodes: Node<NodeData>[], parentId: string): string[] {
  const result: string[] = [];
  const stack = [parentId];
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    for (const n of nodes) {
      if (n.data.parentId === currentId) {
        result.push(n.id);
        stack.push(n.id);
      }
    }
  }
  return result;
}

function countChildren(nodes: Node<NodeData>[], parentId: string): number {
  return nodes.filter((n) => n.data.parentId === parentId).length;
}

function wouldCreateCycle(nodes: Node<NodeData>[], sourceId: string, targetId: string): boolean {
  if (sourceId === targetId) return true;
  const visited = new Set<string>();
  let current: string | null = targetId;
  while (current) {
    if (current === sourceId) return true;
    if (visited.has(current)) break;
    visited.add(current);
    current = nodes.find((n) => n.id === current)?.data?.parentId ?? null;
  }
  return false;
}

function calcWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateMindmapData(data: unknown): data is MindmapData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.version !== "string") return false;
  if (!obj.viewport || typeof obj.viewport !== "object") return false;
  if (!Array.isArray(obj.nodes)) return false;
  if (!Array.isArray(obj.edges)) return false;
  return true;
}

// ─── Store ────────────────────────────────────────────────────
interface FlowState {
  // Core
  nodes: Node<NodeData>[];
  edges: Edge[];
  currentFilePath: string | null;
  hasUnsavedChanges: boolean;
  lastSaved: number | null;
  selectedNodeId: string | null;
  multiSelectedIds: Set<string>;
  clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null;
  recentFiles: string[];
  editingNodeId: string | null;
  editingEdgeId: string | null;

  // History
  past: HistoryEntry[];
  future: HistoryEntry[];

  // UI State
  sidebarPanel: SidebarPanel;
  sidebarOpen: boolean;
  searchQuery: string;
  searchOpen: boolean;
  commandPaletteOpen: boolean;
  presentationMode: boolean;
  presentationIndex: number;
  focusMode: boolean;
  focusNodeId: string | null;
  splitView: boolean;
  theme: ThemeName;
  gridStyle: GridStyle;
  showMinimap: boolean;
  showStatusBar: boolean;
  edgeAnimation: string;

  // Tags & Filters
  activeTagFilter: string[];
  allTags: string[];

  // Templates
  templates: Template[];

  // Favorites
  favorites: string[];

  // Shortcuts
  shortcuts: Record<string, string>;

  // Actions — Core
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNode: (id: string | null) => void;
  toggleMultiSelect: (id: string) => void;
  clearMultiSelect: () => void;
  addChildNode: (parentId: string) => string | null;
  addSiblingNode: (siblingId: string) => string | null;
  addRootNode: () => string;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  updateEdgeLabel: (edgeId: string, text: string) => void;
  updateEdgeStyle: (edgeId: string, style: EdgeStyle) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  removeSelected: () => void;
  toggleCollapse: (id: string) => void;
  collapseAll: () => void;
  expandAll: () => void;
  copyNode: (id: string) => void;
  pasteNode: (targetParentId: string | null) => void;
  undo: () => void;
  redo: () => void;
  navigateToNode: (direction: "up" | "down" | "left" | "right") => void;

  // Actions — UI
  setSidebarPanel: (p: SidebarPanel) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPresentationMode: (on: boolean) => void;
  setPresentationIndex: (i: number) => void;
  setFocusMode: (on: boolean, nodeId?: string | null) => void;
  setSplitView: (on: boolean) => void;
  setTheme: (t: ThemeName) => void;
  setGridStyle: (g: GridStyle) => void;
  setShowMinimap: (show: boolean) => void;
  setShowStatusBar: (show: boolean) => void;
  setEdgeAnimation: (preset: string) => void;
  setEditingNode: (id: string | null) => void;
  setEditingEdge: (id: string | null) => void;

  // Actions — Tags & Filter
  addTagToNode: (nodeId: string, tag: string) => void;
  removeTagFromNode: (nodeId: string, tag: string) => void;
  setTagFilter: (tags: string[]) => void;

  // Actions — Status & Priority
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  setNodePriority: (nodeId: string, priority: NodePriority) => void;

  // Actions — Batch
  batchSetStatus: (ids: string[], status: NodeStatus) => void;
  batchSetPriority: (ids: string[], priority: NodePriority) => void;
  batchSetColor: (ids: string[], color: string) => void;
  batchAddTag: (ids: string[], tag: string) => void;

  // Actions — Advanced
  setNodeEmoji: (nodeId: string, emoji: string) => void;
  setNodeShape: (nodeId: string, shape: NodeShape) => void;
  mergeNodes: (sourceId: string, targetId: string) => void;
  duplicateSubtree: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addCrossLink: (sourceId: string, targetId: string) => void;
  removeCrossLink: (sourceId: string, targetId: string) => void;
  applyTemplate: (templateId: string) => void;
  addRecentFile: (path: string) => void;
  setShortcuts: (s: Record<string, string>) => void;

  // Actions — Data
  loadFromFile: (data: MindmapData) => void;
  setCurrentFilePath: (path: string | null) => void;
  markSaved: () => void;
  clearAll: () => void;
}

// ─── Implementation ───────────────────────────────────────────
export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [
    { id: "root-1", type: "root", position: { x: 100, y: 300 }, data: { label: "Main Idea", color: "#6366f1", fontSize: 24, parentId: null, collapsed: false, description: "", tags: [], status: "none", priority: "none", emoji: "💡", shape: "roundrect", isFavorite: false, crossLinks: [], wordCount: 0 } },
  ],
  edges: [],
  currentFilePath: null,
  hasUnsavedChanges: false,
  lastSaved: null,
  selectedNodeId: null,
  multiSelectedIds: new Set(),
  clipboard: null,
  recentFiles: JSON.parse(localStorage.getItem("archmind-recent") || "[]"),
  editingNodeId: null,
  editingEdgeId: null,
  past: [],
  future: [],
  sidebarPanel: "explorer",
  sidebarOpen: true,
  searchQuery: "",
  searchOpen: false,
  commandPaletteOpen: false,
  presentationMode: false,
  presentationIndex: 0,
  focusMode: false,
  focusNodeId: null,
  splitView: false,
  theme: (localStorage.getItem("archmind-theme") as ThemeName) || "default",
  gridStyle: "dots",
  showMinimap: true,
  showStatusBar: true,
  edgeAnimation: "flow",
  activeTagFilter: [],
  allTags: [],
  templates: DEFAULT_TEMPLATES,
  favorites: [],
  shortcuts: JSON.parse(localStorage.getItem("archmind-shortcuts") || "{}"),

  // ─── Core Actions ──────────────────────────────────────────
  onNodesChange: (changes) => {
    const state = get();
    const hasDragEnd = changes.some((c) => c.type === "position" && c.dragging === false);
    if (hasDragEnd) {
      set({ past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Move" }].slice(-MAX_HISTORY), future: [] });
    }
    set({ nodes: applyNodeChanges(changes, state.nodes) as Node<NodeData>[], hasUnsavedChanges: true });
  },

  onEdgesChange: (changes) => {
    const state = get();
    set({ edges: applyEdgeChanges(changes, state.edges), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Edge" }].slice(-MAX_HISTORY), future: [] });
  },

  onConnect: (connection: Connection) => {
    const state = get();
    if (!connection.source || !connection.target) return;
    if (wouldCreateCycle(state.nodes, connection.source, connection.target)) return;
    const sourceNode = state.nodes.find((n) => n.id === connection.source);
    const strokeColor = (sourceNode?.data as NodeData)?.color ?? "#6366f1";
    set({
      edges: addEdge({ ...connection, type: "custom", animated: false, style: { stroke: strokeColor, strokeWidth: 2 } }, state.edges),
      hasUnsavedChanges: true,
      past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Connect" }].slice(-MAX_HISTORY), future: [],
    });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  toggleMultiSelect: (id) => {
    const state = get();
    const next = new Set(state.multiSelectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    set({ multiSelectedIds: next, selectedNodeId: id });
  },

  clearMultiSelect: () => set({ multiSelectedIds: new Set() }),

  addChildNode: (parentId: string) => {
    const state = get();
    const parentNode = state.nodes.find((n) => n.id === parentId);
    if (!parentNode) return null;
    const parentType = (parentNode.type as string) ?? "branch";
    const childType = CHILD_TYPE[parentType] ?? "leaf";
    const childStyle = CHILD_STYLE[childType] ?? CHILD_STYLE.leaf;
    const existingChildren = countChildren(state.nodes, parentId);
    const spread = childType === "branch" ? 180 : 120;
    const offsetX = childType === "branch" ? 250 : 150;
    const position = { x: parentNode.position.x + offsetX, y: parentNode.position.y - 60 + existingChildren * spread };
    const id = genId(childType);
    const newNode: Node<NodeData> = { id, type: childType, position, data: { label: childStyle.label, color: childStyle.color, fontSize: childStyle.fontSize, parentId, collapsed: false, description: "", tags: [], status: "none", priority: "none", emoji: "", shape: "roundrect", isFavorite: false, crossLinks: [], wordCount: 0 } };
    const parentColor = (parentNode.data as NodeData).color;
    const newEdge: Edge = { id: `edge-${parentId}-${id}`, source: parentId, target: id, type: "custom", animated: false, style: { stroke: parentColor, strokeWidth: 2 } };
    set({ nodes: [...state.nodes, newNode], edges: [...state.edges, newEdge], hasUnsavedChanges: true, selectedNodeId: id, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Add Child" }].slice(-MAX_HISTORY), future: [] });
    return id;
  },

  addSiblingNode: (siblingId: string) => {
    const state = get();
    const sibling = state.nodes.find((n) => n.id === siblingId);
    if (!sibling || !sibling.data.parentId) return null;
    return get().addChildNode(sibling.data.parentId);
  },

  addRootNode: () => {
    const state = get();
    const maxY = state.nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    const id = genId("root");
    const newNode: Node<NodeData> = { id, type: "root", position: { x: 100, y: maxY + 200 }, data: { label: "New Idea", color: "#6366f1", fontSize: 24, parentId: null, collapsed: false, description: "", tags: [], status: "none", priority: "none", emoji: "💡", shape: "roundrect", isFavorite: false, crossLinks: [], wordCount: 0 } };
    set({ nodes: [...state.nodes, newNode], hasUnsavedChanges: true, selectedNodeId: id, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Add Root" }].slice(-MAX_HISTORY), future: [] });
    return id;
  },

  updateNodeData: (id, data) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === id);
    const label = data.label ?? (node?.data as NodeData)?.label ?? "";
    const desc = data.description ?? (node?.data as NodeData)?.description ?? "";
    const wc = data.label !== undefined || data.description !== undefined ? calcWordCount(`${label} ${desc}`) : (node?.data as NodeData)?.wordCount ?? 0;
    set({ nodes: state.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data, wordCount: wc } } : n), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Edit" }].slice(-MAX_HISTORY), future: [] });
  },

  updateEdgeLabel: (edgeId, text) => {
    const state = get();
    set({ edges: state.edges.map((e) => e.id === edgeId ? { ...e, label: text } : e), hasUnsavedChanges: true });
  },

  updateEdgeStyle: (edgeId, style: EdgeStyle) => {
    const state = get();
    const dash = style === "dashed" ? "8 4" : style === "dotted" ? "2 4" : "none";
    set({ edges: state.edges.map((e) => e.id === edgeId ? { ...e, style: { ...e.style, strokeDasharray: dash } } : e), hasUnsavedChanges: true });
  },

  removeNode: (id) => {
    const state = get();
    const targetNode = state.nodes.find((n) => n.id === id);
    if (!targetNode) return;
    const rootCount = state.nodes.filter((n) => n.type === "root").length;
    if (targetNode.type === "root" && rootCount <= 1) return;
    const descendantIds = collectDescendantIds(state.nodes, id);
    const allIdsToRemove = new Set([id, ...descendantIds]);
    set({ nodes: state.nodes.filter((n) => !allIdsToRemove.has(n.id)), edges: state.edges.filter((e) => !allIdsToRemove.has(e.source) && !allIdsToRemove.has(e.target)), hasUnsavedChanges: true, selectedNodeId: allIdsToRemove.has(state.selectedNodeId ?? "") ? null : state.selectedNodeId, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Delete" }].slice(-MAX_HISTORY), future: [] });
  },

  removeEdge: (id) => {
    const state = get();
    set({ edges: state.edges.filter((e) => e.id !== id), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Delete Edge" }].slice(-MAX_HISTORY), future: [] });
  },

  removeSelected: () => {
    const state = get();
    const ids = new Set(state.multiSelectedIds);
    if (state.selectedNodeId) ids.add(state.selectedNodeId);
    if (ids.size === 0) return;
    const rootCount = state.nodes.filter((n) => n.type === "root").length;
    const selectedRoots = state.nodes.filter((n) => n.type === "root" && ids.has(n.id)).length;
    if (selectedRoots >= rootCount) return;
    const allDescendants = [...ids].flatMap((id) => collectDescendantIds(state.nodes, id));
    const allRemove = new Set([...ids, ...allDescendants]);
    set({ nodes: state.nodes.filter((n) => !allRemove.has(n.id)), edges: state.edges.filter((e) => !allRemove.has(e.source) && !allRemove.has(e.target)), hasUnsavedChanges: true, selectedNodeId: null, multiSelectedIds: new Set(), past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Delete Selected" }].slice(-MAX_HISTORY), future: [] });
  },

  toggleCollapse: (id) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } } : n), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Toggle Collapse" }].slice(-MAX_HISTORY), future: [] });
  },

  collapseAll: () => {
    const state = get();
    set({ nodes: state.nodes.map((n) => { const has = state.nodes.some((c) => c.data.parentId === n.id); return has ? { ...n, data: { ...n.data, collapsed: true } } : n; }), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Collapse All" }].slice(-MAX_HISTORY), future: [] });
  },

  expandAll: () => {
    const state = get();
    set({ nodes: state.nodes.map((n) => ({ ...n, data: { ...n.data, collapsed: false } })), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Expand All" }].slice(-MAX_HISTORY), future: [] });
  },

  copyNode: (id) => {
    const state = get();
    const descendantIds = collectDescendantIds(state.nodes, id);
    const allIds = new Set([id, ...descendantIds]);
    set({ clipboard: { nodes: state.nodes.filter((n) => allIds.has(n.id)).map((n) => JSON.parse(JSON.stringify(n))), edges: state.edges.filter((e) => allIds.has(e.source) && allIds.has(e.target)).map((e) => JSON.parse(JSON.stringify(e))) } });
  },

  pasteNode: (targetParentId) => {
    const state = get();
    if (!state.clipboard) return;
    const idMap = new Map<string, string>();
    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];
    for (const n of state.clipboard.nodes) { idMap.set(n.id, genId((n.type as string) ?? "branch")); }
    for (const n of state.clipboard.nodes) {
      const newId = idMap.get(n.id)!;
      const newParentId = n.data.parentId ? (idMap.get(n.data.parentId) ?? targetParentId) : null;
      newNodes.push({ ...n, id: newId, data: { ...n.data, parentId: newParentId }, position: { x: n.position.x + 50, y: n.position.y + 50 } });
    }
    for (const e of state.clipboard.edges) {
      const ns = idMap.get(e.source); const nt = idMap.get(e.target);
      if (ns && nt) newEdges.push({ ...e, id: `edge-${ns}-${nt}`, source: ns, target: nt });
    }
    set({ nodes: [...state.nodes, ...newNodes], edges: [...state.edges, ...newEdges], hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Paste" }].slice(-MAX_HISTORY), future: [] });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({ nodes: prev.nodes, edges: prev.edges, past: past.slice(0, -1), future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), timestamp: Date.now(), label: prev.label }, ...future].slice(0, MAX_HISTORY), hasUnsavedChanges: true });
  },

  redo: () => {
    const { past, nodes, edges, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({ nodes: next.nodes, edges: next.edges, past: [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), timestamp: Date.now(), label: next.label }], future: future.slice(1), hasUnsavedChanges: true });
  },

  navigateToNode: (direction) => {
    const state = get();
    const current = state.nodes.find((n) => n.id === state.selectedNodeId);
    if (!current) return;
    let best: Node<NodeData> | null = null;
    let bestDist = Infinity;
    for (const n of state.nodes) {
      if (n.id === current.id) continue;
      const dx = n.position.x - current.position.x;
      const dy = n.position.y - current.position.y;
      if (direction === "right" && dx > 10 && Math.abs(dy) < 200) { const d = Math.sqrt(dx * dx + dy * dy); if (d < bestDist) { bestDist = d; best = n; } }
      if (direction === "left" && dx < -10 && Math.abs(dy) < 200) { const d = Math.sqrt(dx * dx + dy * dy); if (d < bestDist) { bestDist = d; best = n; } }
      if (direction === "down" && dy > 10 && Math.abs(dx) < 200) { const d = Math.sqrt(dx * dx + dy * dy); if (d < bestDist) { bestDist = d; best = n; } }
      if (direction === "up" && dy < -10 && Math.abs(dx) < 200) { const d = Math.sqrt(dx * dx + dy * dy); if (d < bestDist) { bestDist = d; best = n; } }
    }
    if (best) set({ selectedNodeId: best.id });
  },

  // ─── UI Actions ────────────────────────────────────────────
  setSidebarPanel: (p) => set({ sidebarPanel: p, sidebarOpen: true }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchOpen: (open) => set({ searchOpen: open, searchQuery: open ? get().searchQuery : "" }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setPresentationMode: (on) => set({ presentationMode: on, presentationIndex: 0 }),
  setPresentationIndex: (i) => set({ presentationIndex: i }),
  setFocusMode: (on, nodeId) => set({ focusMode: on, focusNodeId: nodeId ?? null }),
  setSplitView: (on) => set({ splitView: on }),
  setTheme: (t) => { localStorage.setItem("archmind-theme", t); set({ theme: t }); },
  setGridStyle: (g) => set({ gridStyle: g }),
  setShowMinimap: (show) => set({ showMinimap: show }),
  setShowStatusBar: (show) => set({ showStatusBar: show }),
  setEdgeAnimation: (preset) => set({ edgeAnimation: preset }),
  setEditingNode: (id) => set({ editingNodeId: id }),
  setEditingEdge: (id) => set({ editingEdgeId: id }),

  // ─── Tags & Filter ─────────────────────────────────────────
  addTagToNode: (nodeId, tag) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, tags: [...new Set([...n.data.tags, tag])] } } : n), allTags: [...new Set([...state.allTags, tag])], hasUnsavedChanges: true });
  },

  removeTagFromNode: (nodeId, tag) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, tags: n.data.tags.filter((t) => t !== tag) } } : n), hasUnsavedChanges: true });
  },

  setTagFilter: (tags) => set({ activeTagFilter: tags }),

  // ─── Status & Priority ─────────────────────────────────────
  setNodeStatus: (nodeId, status) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Set Status" }].slice(-MAX_HISTORY), future: [] });
  },

  setNodePriority: (nodeId, priority) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, priority } } : n), hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Set Priority" }].slice(-MAX_HISTORY), future: [] });
  },

  // ─── Batch ─────────────────────────────────────────────────
  batchSetStatus: (ids, status) => {
    const state = get();
    const idSet = new Set(ids);
    set({ nodes: state.nodes.map((n) => idSet.has(n.id) ? { ...n, data: { ...n.data, status } } : n), hasUnsavedChanges: true });
  },

  batchSetPriority: (ids, priority) => {
    const state = get();
    const idSet = new Set(ids);
    set({ nodes: state.nodes.map((n) => idSet.has(n.id) ? { ...n, data: { ...n.data, priority } } : n), hasUnsavedChanges: true });
  },

  batchSetColor: (ids, color) => {
    const state = get();
    const idSet = new Set(ids);
    set({ nodes: state.nodes.map((n) => idSet.has(n.id) ? { ...n, data: { ...n.data, color } } : n), hasUnsavedChanges: true });
  },

  batchAddTag: (ids, tag) => {
    const state = get();
    const idSet = new Set(ids);
    set({ nodes: state.nodes.map((n) => idSet.has(n.id) ? { ...n, data: { ...n.data, tags: [...new Set([...n.data.tags, tag])] } } : n), allTags: [...new Set([...state.allTags, tag])], hasUnsavedChanges: true });
  },

  // ─── Advanced ──────────────────────────────────────────────
  setNodeEmoji: (nodeId, emoji) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, emoji } } : n), hasUnsavedChanges: true });
  },

  setNodeShape: (nodeId, shape) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, shape } } : n), hasUnsavedChanges: true });
  },

  mergeNodes: (sourceId, targetId) => {
    const state = get();
    const source = state.nodes.find((n) => n.id === sourceId);
    const target = state.nodes.find((n) => n.id === targetId);
    if (!source || !target) return;
    // Re-parent source children to target
    const childIds = collectDescendantIds(state.nodes, sourceId);
    const allRemove = new Set([sourceId, ...childIds]);
    const newNodes = state.nodes.filter((n) => !allRemove.has(n.id)).map((n) => {
      if (childIds.includes(n.id)) return { ...n, data: { ...n.data, parentId: targetId } };
      return n;
    });
    set({ nodes: newNodes, edges: state.edges.filter((e) => !allRemove.has(e.source) && !allRemove.has(e.target)), hasUnsavedChanges: true });
  },

  duplicateSubtree: (id) => {
    const state = get();
    const descendantIds = collectDescendantIds(state.nodes, id);
    const allIds = new Set([id, ...descendantIds]);
    const idMap = new Map<string, string>();
    for (const nid of allIds) idMap.set(nid, genId("node"));
    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];
    for (const n of state.nodes.filter((n) => allIds.has(n.id))) {
      const newId = idMap.get(n.id)!;
      const origParent = n.data.parentId;
      const newParentId = origParent && idMap.has(origParent) ? idMap.get(origParent)! : null;
      newNodes.push({ ...JSON.parse(JSON.stringify(n)), id: newId, position: { x: n.position.x + 60, y: n.position.y + 60 }, data: { ...n.data, parentId: newParentId } });
    }
    for (const e of state.edges.filter((e) => allIds.has(e.source) && allIds.has(e.target))) {
      const ns = idMap.get(e.source)!; const nt = idMap.get(e.target)!;
      newEdges.push({ ...e, id: `edge-${ns}-${nt}`, source: ns, target: nt });
    }
    set({ nodes: [...state.nodes, ...newNodes], edges: [...state.edges, ...newEdges], hasUnsavedChanges: true });
  },

  toggleFavorite: (id) => {
    const state = get();
    const isFav = state.favorites.includes(id);
    set({ favorites: isFav ? state.favorites.filter((f) => f !== id) : [...state.favorites, id], nodes: state.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, isFavorite: !isFav } } : n) });
  },

  addCrossLink: (sourceId, targetId) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => {
      if (n.id === sourceId) return { ...n, data: { ...n.data, crossLinks: [...new Set([...n.data.crossLinks, targetId])] } };
      if (n.id === targetId) return { ...n, data: { ...n.data, crossLinks: [...new Set([...n.data.crossLinks, sourceId])] } };
      return n;
    }), hasUnsavedChanges: true });
  },

  removeCrossLink: (sourceId, targetId) => {
    const state = get();
    set({ nodes: state.nodes.map((n) => {
      if (n.id === sourceId) return { ...n, data: { ...n.data, crossLinks: n.data.crossLinks.filter((l) => l !== targetId) } };
      if (n.id === targetId) return { ...n, data: { ...n.data, crossLinks: n.data.crossLinks.filter((l) => l !== sourceId) } };
      return n;
    }), hasUnsavedChanges: true });
  },

  applyTemplate: (templateId) => {
    const state = get();
    const template = state.templates.find((t) => t.id === templateId);
    if (!template) return;
    const idMap = new Map<string, string>();
    template.nodes.forEach((n, i) => idMap.set(i === 0 ? "root" : n.label, genId(n.type)));
    const nodes: Node<NodeData>[] = template.nodes.map((n, i) => ({
      id: idMap.get(i === 0 ? "root" : n.label)!,
      type: n.type as any,
      position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 180 },
      data: { label: n.label, color: n.color, fontSize: n.type === "root" ? 24 : 18, parentId: n.parentId ? idMap.get(n.parentId === "root" ? "root" : template.nodes.find((tn) => tn.type === n.parentId)?.label ?? n.parentId) ?? null : null, collapsed: false, description: "", tags: [], status: "none", priority: "none", emoji: n.emoji, shape: "roundrect", isFavorite: false, crossLinks: [], wordCount: 0 },
    }));
    const edges: Edge[] = template.edges.map((e) => {
      const src = idMap.get(e.source === "root" ? "root" : template.nodes.find((n) => n.type === e.source)?.label ?? e.source)!;
      const tgt = idMap.get(e.target === "root" ? "root" : template.nodes.find((n) => n.type === e.target)?.label ?? e.target)!;
      return { id: `edge-${src}-${tgt}`, source: src, target: tgt, type: "custom", animated: false, style: { stroke: "#6366f1", strokeWidth: 2 } };
    });
    set({ nodes, edges, hasUnsavedChanges: true, past: [...state.past, { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)), timestamp: Date.now(), label: "Apply Template" }].slice(-MAX_HISTORY), future: [] });
  },

  addRecentFile: (path) => {
    const state = get();
    const recent = [path, ...state.recentFiles.filter((f) => f !== path)].slice(0, MAX_RECENT);
    localStorage.setItem("archmind-recent", JSON.stringify(recent));
    set({ recentFiles: recent });
  },

  setShortcuts: (s) => { localStorage.setItem("archmind-shortcuts", JSON.stringify(s)); set({ shortcuts: s }); },

  // ─── Data ──────────────────────────────────────────────────
  loadFromFile: (data) => {
    if (!validateMindmapData(data)) return;
    const nodes = (data.nodes as any[]).map((n) => ({
      id: n.id, type: n.type, position: n.position,
      data: { label: n.data.label ?? "Untitled", color: n.data.color ?? "#6366f1", fontSize: n.data.fontSize ?? 16, parentId: n.data.parentId ?? null, collapsed: n.data.collapsed ?? false, description: n.data.description ?? "", tags: n.data.tags ?? [], status: n.data.status ?? "none", priority: n.data.priority ?? "none", emoji: n.data.emoji ?? "", shape: n.data.shape ?? "roundrect", isFavorite: n.data.isFavorite ?? false, crossLinks: n.data.crossLinks ?? [], wordCount: n.data.wordCount ?? 0 },
    }));
    const edges = (data.edges as any[]).map((e) => ({
      id: e.id, source: e.source, target: e.target, type: e.type || "custom", animated: false, label: e.label ?? "",
      style: e.style ?? { stroke: "#6366f1", strokeWidth: 2 },
    }));
    const allTags = [...new Set(nodes.flatMap((n: any) => n.data.tags))];
    const favorites = nodes.filter((n: any) => n.data.isFavorite).map((n: any) => n.id);
    set({ nodes, edges, hasUnsavedChanges: false, selectedNodeId: null, past: [], future: [], allTags, favorites });
  },

  setCurrentFilePath: (path) => set({ currentFilePath: path }),
  markSaved: () => set({ hasUnsavedChanges: false, lastSaved: Date.now() }),

  clearAll: () => {
    const id = genId("root");
    set({
      nodes: [{ id, type: "root", position: { x: 100, y: 300 }, data: { label: "Main Idea", color: "#6366f1", fontSize: 24, parentId: null, collapsed: false, description: "", tags: [], status: "none", priority: "none", emoji: "💡", shape: "roundrect", isFavorite: false, crossLinks: [], wordCount: 0 } }],
      edges: [], currentFilePath: null, hasUnsavedChanges: false, lastSaved: null, selectedNodeId: null, past: [], future: [], allTags: [], favorites: [],
    });
  },
}));
