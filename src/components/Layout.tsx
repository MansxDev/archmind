import { ReactFlowProvider } from "@xyflow/react";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import CommandPalette from "./CommandPalette";
import PresentationMode from "./PresentationMode";

export default function Layout() {
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
        </div>
        <div className="h-6 flex items-center px-4 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[10px] text-zinc-400 select-none justify-between">
          <span>ArchMind v1.0.0</span>
          <span>Ctrl+Shift+P for commands</span>
        </div>
      </div>
      <CommandPalette />
      <PresentationMode />
    </ReactFlowProvider>
  );
}
