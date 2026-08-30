import { useEffect, useRef } from "react";
import { useFlowStore } from "./useFlowStore";
import { invokeSaveMindmap, MindmapData } from "../lib/tauri-commands";

export function useAutoSave(getViewport: () => { x: number; y: number; zoom: number }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useFlowStore((s) => s.hasUnsavedChanges);
  const currentFilePath = useFlowStore((s) => s.currentFilePath);
  const markSaved = useFlowStore((s) => s.markSaved);

  useEffect(() => {
    if (!hasUnsavedChanges || !currentFilePath) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const state = useFlowStore.getState();
      const viewport = getViewport();

      const data: MindmapData = {
        version: "1.0.0",
        viewport,
        nodes: state.nodes.map((n) => ({
          id: n.id,
          type: (n.type as "root" | "branch" | "leaf") ?? "branch",
          position: n.position,
          data: {
            label: (n.data as any).label,
            color: (n.data as any).color,
            fontSize: (n.data as any).fontSize,
            parentId: (n.data as any).parentId,
            collapsed: (n.data as any).collapsed ?? false,
            description: (n.data as any).description ?? "",
          },
        })),
        edges: state.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type ?? "smoothstep",
          animated: e.animated ?? false,
          style: {
            stroke: (e.style as any)?.stroke ?? "#6366f1",
            strokeWidth: (e.style as any)?.strokeWidth ?? 2,
          },
        })),
      };

      try {
        await invokeSaveMindmap(state.currentFilePath, data);
        markSaved();
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasUnsavedChanges, currentFilePath, markSaved, getViewport]);
}
