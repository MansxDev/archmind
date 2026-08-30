<div align="center">

# ⬡ ArchMind

**Native offline mindmap application for Arch Linux**

Built with React + @xyflow/react + Tauri v2 (Rust)

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![GSAP](https://img.shields.io/badge/GSAP-3-green)](https://gsap.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## Screenshot

```
┌─────────────────────────────────────────────────────┐
│ ⬡ ArchMind | project.archmind               TitleBar│
├──┬────┬────────────────────────────────────────────┤
│📁│    │                                            │
│🏷️│ S  │    ┌──────────┐      ┌──────────┐         │
│📊│ I  │    │ Main Idea│══════▶│ Branch 1 │         │
│📋│ D  │    └──────────┘      └──────────┘         │
│⭐│ E  │         ║                   ║              │
│🕐│ B  │    ┌──────────┐      ┌──────────┐         │
│📑│ A  │    │ Branch 2 │══════▶│  Leaf    │         │
│⚙️│ R  │    └──────────┘      └──────────┘         │
├──┴────┴────────────────────────────────────────────┤
│ ● 12 nodes | 11 edges | depth 3 | 45 words  v1.0.0│
└─────────────────────────────────────────────────────┘
```

---

## Features

### Core (10)
- **Hierarchical Nodes** — Root → Branch → Leaf structure
- **Save/Load** — Native `.archmind` JSON files
- **Export** — SVG vector images
- **Undo/Redo** — 100-step history
- **Search** — `Ctrl+F` fuzzy search
- **Collapse/Expand** — Hide/show children with count badge
- **Copy/Paste** — Subtree clipboard
- **Auto Layout** — dagre left-to-right layout
- **Presentation Mode** — `F5` fullscreen slideshow
- **MiniMap** — Canvas navigation overview

### Organization (10)
- **Node Tags** — `#urgent` `#idea` `#todo` filterable labels
- **Status Badges** — To Do / In Progress / Done / Blocked
- **Priority Markers** — P0 (Critical) to P3 (Low)
- **Emoji/Icons** — 20 built-in visual markers per node
- **Node Shapes** — Rectangle, Rounded, Circle, Diamond, Hexagon
- **Favorites** — ⭐ Pin nodes for quick access
- **Templates** — 5 pre-built mindmaps (Meeting, Project, Brainstorm, SWOT, User Journey)
- **Cross-Links** — Reference non-parent nodes
- **Batch Operations** — Multi-select + change status/priority/color/tag
- **Duplicate Subtree** — Deep copy with new IDs

### Navigation (6)
- **Quick Add** — `Ctrl+Enter` instant node creation
- **Goto Node** — `Ctrl+G` fuzzy jump to any node
- **Arrow Navigation** — `←→↑↓` move between connected nodes
- **Focus Mode** — `Ctrl+Shift+F` dim everything except selected path
- **Command Palette** — `Ctrl+Shift+P` 30+ commands with fuzzy search
- **Keyboard Shortcuts** — 25+ shortcuts, customizable

### Visual (7)
- **GSAP Animated Edges** — Data packet flow between nodes
- **6 Color Themes** — Default, Nord, Dracula, Solarized, Gruvbox, Catppuccin
- **Grid Patterns** — Dots, lines, cross, or none
- **Inline Editing** — Double-click any node to edit
- **Rich Node Display** — Emoji + label + status + priority + tags
- **Animated Connections** — Flowing trails + traveling data packet
- **Dark Mode** — Full dark interface

### Advanced (5)
- **Export to Markdown** — Hierarchical text outline
- **Recent Files** — localStorage quick access
- **Statistics Panel** — Live node/depth/word/status/priority counts
- **Orphan Detection** — Find disconnected nodes
- **History Timeline** — Visual undo/redo list

**Total: 38 features**

---

## Keyboard Shortcuts

### File
| Key | Action |
|---|---|
| `Ctrl+S` | Save |
| `Ctrl+O` | Open |
| `Ctrl+N` | New mindmap |
| `Ctrl+Enter` | Quick Add node |
| `Ctrl+G` | Goto node |

### Edit
| Key | Action |
|---|---|
| `Double-click` | Inline edit label |
| `Tab` | Add child node |
| `Enter` | Add sibling node |
| `F2` | Edit selected node |
| `Delete` | Remove selected |
| `Ctrl+Z` | Undo (100 steps) |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy subtree |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate subtree |

### View
| Key | Action |
|---|---|
| `Space` | Collapse/Expand toggle |
| `Arrow Keys` | Navigate between nodes |
| `Ctrl+F` | Search nodes |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+L` | Auto Layout (dagre) |
| `Ctrl+Shift+F` | Focus Mode |
| `F5` | Presentation Mode |

### Node
| Key | Action |
|---|---|
| `Ctrl+B` | Toggle Favorite |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5, Vite 6 |
| State | Zustand 5 |
| Canvas | @xyflow/react 12 (ReactFlow) |
| Animation | GSAP 3 |
| Layout | dagre |
| Backend | Tauri 2 (Rust) |
| Styling | Tailwind CSS 3 |

---

## Architecture

```
archmind/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx              — Main ReactFlow canvas
│   │   ├── Sidebar.tsx             — Sidebar shell
│   │   ├── SearchBar.tsx           — Ctrl+F search
│   │   ├── CommandPalette.tsx      — Ctrl+Shift+P
│   │   ├── PresentationMode.tsx    — F5 slideshow
│   │   ├── QuickAdd.tsx            — Ctrl+Enter
│   │   ├── GotoNode.tsx            — Ctrl+G
│   │   ├── activitybar/            — VS Code activity bar
│   │   ├── titlebar/               — Title bar
│   │   ├── statusbar/              — Status bar
│   │   ├── sidebar/                — 8 sidebar panels
│   │   ├── nodes/                  — Root, Branch, Leaf nodes
│   │   └── edges/                  — GSAP animated edge
│   ├── hooks/
│   │   ├── useFlowStore.ts         — Zustand store (all state)
│   │   ├── useAutoSave.ts          — Debounced auto-save
│   │   └── useUnsavedGuard.ts      — Close confirmation
│   ├── lib/
│   │   ├── tauri-commands.ts       — IPC wrappers
│   │   └── export-markdown.ts      — Markdown export
│   ├── App.tsx                     — VS Code shell layout
│   └── index.css                   — Tailwind + globals
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs                  — Tauri builder
│   │   └── commands/
│   │       ├── file_io.rs          — save/open dialogs
│   │       └── export.rs           — SVG export
│   └── Cargo.toml
└── pkg/
    ├── install.sh                  — User-local installer
    └── arch/archmind.desktop       — Desktop entry
```

---

## Install

### From Source

```bash
# Clone
git clone https://github.com/MansxDev/archmind.git
cd archmind

# Install dependencies
npm install

# Development
npm run tauri dev

# Build
npm run tauri build
```

### Manual Install (Arch Linux)

```bash
# Build first, then:
pkg/install.sh
```

Installs to:
- Binary: `~/.local/bin/archmind`
- Desktop: `~/.local/share/applications/archmind.desktop`
- Icons: `~/.local/share/icons/hicolor/*/apps/archmind.png`

### Run

```bash
archmind
```

Or via app launcher (Rofi, etc.):
```
rofi -show drun → "ArchMind"
```

---

## File Format

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
        "description": "",
        "tags": ["important"],
        "status": "in-progress",
        "priority": "P1",
        "emoji": "💡",
        "shape": "roundrect",
        "isFavorite": false,
        "crossLinks": [],
        "wordCount": 2
      }
    }
  ],
  "edges": [
    {
      "id": "edge-<source>-<target>",
      "source": "root-<uuid>",
      "target": "branch-<uuid>",
      "type": "custom",
      "animated": false,
      "label": "",
      "style": { "stroke": "#6366f1", "strokeWidth": 2 }
    }
  ]
}
```

---

## Node Data Schema

| Field | Type | Description |
|---|---|---|
| `label` | string | Display text |
| `color` | string | Hex border/background color |
| `fontSize` | number | 14-24px |
| `parentId` | string \| null | null = root node |
| `collapsed` | boolean | Children hidden |
| `description` | string | Markdown notes |
| `tags` | string[] | Filterable labels |
| `status` | enum | none, todo, in-progress, done, blocked |
| `priority` | enum | none, P0, P1, P2, P3 |
| `emoji` | string | Visual marker |
| `shape` | enum | rect, roundrect, circle, diamond, hexagon |
| `isFavorite` | boolean | Pinned to favorites |
| `crossLinks` | string[] | IDs of referenced nodes |
| `wordCount` | number | Auto-calculated |

---

## VS Code-Style Layout

```
┌─────────────────────────────────────────────┐
│ TitleBar — file name, path, unsaved dot     │
├──┬────┬────────────────────────────────────┤
│📁│    │                                    │
│🏷️│ S  │                                    │
│📊│ I  │         Canvas (ReactFlow)         │
│📋│ D  │                                    │
│⭐│ E  │                                    │
│🕐│ B  │                                    │
│📑│ A  │                                    │
│⚙️│ R  │                                    │
├──┴────┴────────────────────────────────────┤
│ StatusBar — stats, theme, selected node     │
└─────────────────────────────────────────────┘
```

### Sidebar Panels (8)

| Panel | Icon | Content |
|---|---|---|
| Explorer | 📁 | Tree view of all nodes |
| Tags | 🏷️ | Tag list with click-to-filter |
| Statistics | 📊 | Live stats, orphan detection |
| Templates | 📋 | 5 pre-built mindmaps |
| Favorites | ⭐ | Pinned nodes |
| History | 🕐 | Visual undo/redo timeline |
| Outline | 📑 | Text outline view |
| Settings | ⚙️ | Theme, grid, shortcuts |

---

## Templates

| Template | Icon | Nodes | Use Case |
|---|---|---|---|
| Meeting Notes | 📋 | 6 | Structured meeting outline |
| Project Plan | 🏗️ | 6 | Project breakdown |
| Brainstorm | 🧠 | 4 | Free-form idea generation |
| SWOT Analysis | 📊 | 5 | Strengths/Weaknesses/Opportunities/Threats |
| User Journey | 🗺️ | 5 | User flow mapping |

---

## Themes

| Theme | Accent | Background |
|---|---|---|
| Default Dark | `#6366f1` | `#0f172a` |
| Nord | `#88c0d0` | `#2e3440` |
| Dracula | `#bd93f9` | `#282a36` |
| Solarized | `#268bd2` | `#002b36` |
| Gruvbox | `#d65d0e` | `#282828` |
| Catppuccin | `#cba6f7` | `#1e1e2e` |

---

## Build

```bash
# TypeScript check
npx tsc --noEmit

# Frontend build
npx vite build

# Full Tauri build (frontend + Rust binary)
npx tauri build
```

Binary output: `src-tauri/target/release/archmind` (~13MB)

---

## License

MIT

---

<div align="center">

**Built with ❤️ for Arch Linux**

</div>
