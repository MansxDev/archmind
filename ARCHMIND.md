# ArchMind — Changelog & Architecture Document

> Auto-generated: 2026-08-30
> Owner: MansxDev
> Stack: React 19 + Vite + TypeScript + @xyflow/react + Zustand 5 + GSAP + Tauri v2 (Rust)

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Feature Timeline](#2-feature-timeline)
3. [Keyboard Shortcuts](#3-keyboard-shortcuts)
4. [Node System](#4-node-system)
5. [Edge System](#5-edge-system)
6. [File Format](#6-file-format)
7. [Layout Rules](#7-layout-rules)
8. [Component Map](#8-component-map)
9. [Bug Fixes](#9-bug-fixes)
10. [Build & Install](#10-build--install)

---

## 1. Architecture

```
archmind/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx           — Main ReactFlow canvas + keyboard handler
│   │   ├── Toolbar.tsx          — File/Edit/View menus + undo/redo
│   │   ├── Sidebar.tsx          — Property editor + description + shortcuts
│   │   ├── Layout.tsx           — Shell wrapper (ReactFlowProvider)
│   │   ├── SearchBar.tsx        — Ctrl+F floating search
│   │   ├── CommandPalette.tsx   — Ctrl+Shift+P modal
│   │   ├── PresentationMode.tsx — F5 fullscreen slideshow
│   │   ├── nodes/
│   │   │   ├── RootNode.tsx     — Purple root node, inline edit, collapse
│   │   │   ├── BranchNode.tsx   — Green branch node, inline edit, collapse
│   │   │   └── LeafNode.tsx     — Grey leaf node, inline edit
│   │   └── edges/
│   │       └── GSAPAnimatedEdge.tsx — GSAP flowing dots animation
│   ├── hooks/
│   │   ├── useFlowStore.ts      — Zustand store (all state + actions)
│   │   ├── useAutoSave.ts       — Debounced auto-save (2s)
│   │   └── useUnsavedGuard.ts   — Close confirmation
│   ├── lib/
│   │   ├── tauri-commands.ts    — IPC wrappers (save/open/export)
│   │   ├── auto-layout.ts       — dagre auto-layout utility
│   │   └── export-markdown.ts   — Mindmap → markdown export
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs               — Tauri builder + plugins
│   │   └── commands/
│   │       ├── file_io.rs       — save_mindmap / open_mindmap
│   │       └── export.rs        — export_svg
│   ├── Cargo.toml               — tauri 2, dialog, fs
│   └── tauri.conf.json          — Window, bundle config
└── pkg/
    ├── install.sh               — User-local install script
    └── arch/archmind.desktop    — Desktop entry for Rofi
```

**Tech Stack:**
- React 19 + Vite 6 + TypeScript
- @xyflow/react ^12 (ReactFlow)
- Zustand 5 (state management)
- GSAP 3 (edge animation)
- Tauri v2 (Rust backend, native dialogs)
- Tailwind CSS 3
- dagre (auto-layout)

---

## 2. Feature Timeline

### Phase 1 — Core (Sprint 1-4)
| Feature | Status |
|---|---|
| Hierarchical nodes (Root > Branch > Leaf) | ✅ |
| Save/Load .archmind files | ✅ |
| Export SVG | ✅ |
| Native file dialogs (Tauri) | ✅ |
| Dark mode | ✅ |
| MiniMap | ✅ |
| Context menu (right-click) | ✅ |
| Basic keyboard shortcuts | ✅ |

### Phase 2 — Power Features (Sprint 5-8)
| Feature | Status |
|---|---|
| Undo/Redo (50 steps, Ctrl+Z / Ctrl+Shift+Z) | ✅ |
| Search nodes (Ctrl+F) | ✅ |
| Collapse/Expand (Space) | ✅ |
| Copy/Paste subtree (Ctrl+C / Ctrl+V) | ✅ |
| Command Palette (Ctrl+Shift+P) | ✅ |
| Node Descriptions/Notes | ✅ |
| Auto Layout — dagre LR (Ctrl+L) | ✅ |
| Presentation Mode (F5) | ✅ |

### Phase 3 — Polish (Sprint 9)
| Feature | Status |
|---|---|
| Inline Editing (double-click, no more prompt()) | ✅ |
| Arrow Key Navigation (←→↑↓) | ✅ |
| Collapsed Child Count Badge | ✅ |
| Multi-Select (Shift+click) | ✅ |
| Export to Markdown | ✅ |
| Recent Files (localStorage) | ✅ |
| Edge Labels (double-click edge) | ✅ |
| Undo/Redo Visual Indicator (↶ ↷ buttons) | ✅ |

### Phase 4 — Animation (Sprint 10)
| Feature | Status |
|---|---|
| GSAP Animated Edges (3-layer flowing dots) | ✅ |
| React error #185 fix (infinite re-render) | ✅ |

---

## 3. Keyboard Shortcuts

### Global
| Key | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` | Save |
| `Ctrl+O` | Open |
| `Ctrl+N` | New mindmap |
| `Ctrl+F` | Search nodes |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+L` | Auto Layout (dagre) |
| `F5` | Presentation Mode |

### Node Editing
| Key | Action |
|---|---|
| `Double-click` | Inline edit label |
| `Tab` | Add child node (auto-opens editor) |
| `Enter` | Add sibling node (auto-opens editor) |
| `F2` | Edit selected node label |
| `Delete` / `Backspace` | Remove selected node/edge |
| `Space` | Collapse/Expand toggle |

### Navigation
| Key | Action |
|---|---|
| `Arrow Right` | Move to nearest right node |
| `Arrow Left` | Move to nearest left node |
| `Arrow Down` | Move to nearest bottom node |
| `Arrow Up` | Move to nearest top node |
| `Shift+Click` | Toggle multi-select |
| `Drag on pane` | Rubber band selection |

### Clipboard
| Key | Action |
|---|---|
| `Ctrl+C` | Copy subtree (node + descendants) |
| `Ctrl+V` | Paste as new child of selected |

---

## 4. Node System

### Hierarchy
```
Root (purple)  →  Branch (green)  →  Leaf (grey)
     ↓                  ↓
   Branch            Leaf
     ↓
   Leaf
```

- **Root**: `parentId: null`, purple border `#6366f1`, fontSize 24
- **Branch**: `parentId: root|branch`, green border `#22c55e`, fontSize 18
- **Leaf**: `parentId: branch`, grey border `#94a3b8`, fontSize 14

### Node Data Shape
```typescript
interface NodeData {
  label: string;        // Display text
  color: string;        // Hex border/bg color
  fontSize: number;     // 14-24
  parentId: string | null; // null = root
  collapsed: boolean;   // children hidden
  description: string;  // markdown notes
}
```

### Node Features
- **Inline editing**: Double-click → input field replaces label text
- **Collapse toggle**: ⊕/⊖ button top-right corner
- **Child count badge**: Shows "N" when collapsed
- **Add child button**: ⊕ button bottom-right corner
- **Description preview**: In sidebar, not inline

### Auto-Child Type
```typescript
const CHILD_TYPE = {
  root: "branch",
  branch: "leaf",
  leaf: "leaf",
};
```

---

## 5. Edge System

### Animated Edges (GSAP)
Each edge has 3 SVG layers animated via GSAP timeline:

| Layer | Speed | Opacity | Effect |
|---|---|---|---|
| Flowing Dots | 3s linear | 0.6 | Main data flow animation |
| Pulse Ring | 4s linear | 0.3 | Offset dash pattern |
| Glow Blur | 5s + yoyo | 0.15→0.35 | Breathing glow |

### GSAP Implementation
```typescript
// strokeDashoffset animates from pathLen to -pathLen
gsap.to(dots, {
  strokeDashoffset: -pathLen,
  duration: 3,
  ease: "none",
  repeat: -1,  // infinite loop
});
```

### Edge Properties
```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  type: "custom";      // always GSAPAnimatedEdge
  animated: false;     // GSAP handles animation, not ReactFlow
  label?: string;      // edge label text
  style: {
    stroke: string;    // inherits from parent node color
    strokeWidth: 2;
  };
}
```

### Edge Labels
- Double-click edge → editable text label
- Displayed as small pill badge at midpoint
- Used for annotating relationships ("relates to", "depends on")

---

## 6. File Format

### .archmind (JSON)
```json
{
  "version": "1.0.0",
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "nodes": [
    {
      "id": "root-<uuid>",
      "type": "root",
      "position": { "x": 100, "y": 300 },
      "data": {
        "label": "Main Idea",
        "color": "#6366f1",
        "fontSize": 24,
        "parentId": null,
        "collapsed": false,
        "description": ""
      }
    }
  ],
  "edges": [
    {
      "id": "edge-<source>-<target>",
      "source": "root-<uuid>",
      "target": "branch-<uuid>",
      "type": "custom",
      "animated": true,
      "label": "",
      "style": { "stroke": "#6366f1", "strokeWidth": 2 }
    }
  ]
}
```

### Export Formats
| Format | Command | Notes |
|---|---|---|
| `.archmind` | Save / Ctrl+S | Full state including viewport |
| SVG | File → Export SVG | Vector image of canvas |
| Markdown | File → Export Markdown | Hierarchical text outline |

---

## 7. Layout Rules

### Node Positioning
- **Root**: `{ x: 100, y: 300 }` (default starting position)
- **Branch children**: `offsetX: 250`, `spread: 180px` vertically
- **Leaf children**: `offsetX: 150`, `spread: 120px` vertically

### Auto Layout (dagre)
```
Direction: LR (left-to-right)
Node separation: 80px
Rank separation: 200px
Margin: 50px
```

### Cycle Prevention
```typescript
function wouldCreateCycle(nodes, sourceId, targetId): boolean {
  // Walks up parent chain from targetId
  // Returns true if sourceId is an ancestor of targetId
}
```

### Visibility Filtering
- Collapsed nodes hide ALL descendants (recursive)
- Edges to hidden nodes are also hidden
- Collapsed node shows child count badge

### Viewport Persistence
- Saved to `localStorage` as `{ x, y, zoom }`
- Restored on app mount
- `fitView()` used for presentation mode navigation

---

## 8. Component Map

### Canvas.tsx
- Main ReactFlow wrapper
- Registers nodeTypes + edgeTypes
- Keyboard handler (all shortcuts)
- Multi-select with Shift+click
- Viewport restore from localStorage

### Toolbar.tsx
- File menu: New, Open, Save, Save As, Export SVG, Export Markdown, Recent Files
- Edit menu: Undo, Redo, Add Child, Add Root, Command Palette
- View menu: Collapse All, Expand All, Fit View, Presentation
- Undo/Redo buttons with disabled state
- Save indicator + node/edge count

### Sidebar.tsx
- Selected node editor
- Label input field
- Color picker (preset swatches)
- Font size slider (14-24)
- Description textarea (markdown notes)
- Character count
- Shortcut hints
- Stats (node count, edge count)

### SearchBar.tsx (Ctrl+F)
- Floating search bar top-right
- Real-time node filtering
- Arrow key navigation between matches
- Auto-fits view to selected match
- Escape to close

### CommandPalette.tsx (Ctrl+Shift+P)
- Modal with fuzzy search
- 12 commands across 3 categories
- Keyboard navigation (↑↓ arrows)
- Enter to execute
- Escape to close

### PresentationMode.tsx (F5)
- Fullscreen overlay
- Shows root → branch → leaf paths (longest path)
- Arrow Left/Right to navigate slides
- Progress dots at bottom
- Escape to exit

### GSAPAnimatedEdge.tsx
- Custom ReactFlow edge
- 3-layer GSAP animation (dots, pulse, glow)
- Edge label support
- Smooth step path with 16px border radius

---

## 9. Bug Fixes

### Critical (Phase 1)
| Bug | Fix |
|---|---|
| Recursive DFS deletion crashing | Collect all descendant IDs before removing |
| Stale closures in AutoSave/UnsavedGuard | Use `useFlowStore.getState()` instead of closure refs |
| ID collision (Math.random) | Switch to `crypto.randomUUID()` |
| Cycle detection missing on connect | Walk parent chain before allowing edge |
| 10MB file size limit | Validate in Rust backend before parsing |
| Viewport not saved/restored | Save to localStorage on mount |

### Critical (Phase 2)
| Bug | Fix |
|---|---|
| React error #185 (infinite re-render) | Remove viewport save from effect loop, use `useMemo` for visible nodes, subscribe individual selectors |

### UX Fixes
| Bug | Fix |
|---|---|
| prompt() dialog for editing | Replace with inline contentEditable |
| Flat node list (no hierarchy) | Add `parentId` field, recursive filtering |
| No visual feedback for undo | Show undo/redo buttons in toolbar with disabled state |
| No child count when collapsed | Add badge with `nodes.filter(n => n.parentId === id).length` |

---

## 10. Build & Install

### Build Commands
```bash
npx tsc --noEmit        # TypeScript check
npx vite build          # Frontend build
npx tauri build         # Full Tauri build (frontend + Rust binary)
```

### Install
```bash
pkg/install.sh
# → ~/.local/bin/archmind
# → ~/.local/share/applications/archmind.desktop
# → ~/.local/share/icons/hicolor/*/apps/archmind.png
```

### Run
```bash
archmind                        # terminal
rofi -show drun → "ArchMind"    # app launcher
```

### Binary Size
- ~13MB ELF (release optimized)
- Frontend: ~520KB JS + ~32KB CSS (gzipped: ~170KB + ~7KB)

---

*End of document.*
