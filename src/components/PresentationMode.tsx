import { useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore, NodeData } from "../hooks/useFlowStore";

export default function PresentationMode() {
  const { fitView } = useReactFlow();
  const presentationMode = useFlowStore((s) => s.presentationMode);
  const presentationIndex = useFlowStore((s) => s.presentationIndex);
  const setPresentationMode = useFlowStore((s) => s.setPresentationMode);
  const setPresentationIndex = useFlowStore((s) => s.setPresentationIndex);
  const nodes = useFlowStore((s) => s.nodes);

  // Build presentation path: root nodes, then each root's branches in order
  const path = nodes
    .filter((n) => n.type === "root")
    .flatMap((root) => {
      const branches = nodes
        .filter((n) => n.data.parentId === root.id)
        .sort((a, b) => a.position.y - b.position.y);
      return [root, ...branches];
    });

  const totalSlides = path.length;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalSlides) return;
      setPresentationIndex(idx);
      const node = path[idx];
      if (node) {
        fitView({ nodes: [{ id: node.id }], duration: 500, padding: 0.3 });
      }
    },
    [path, totalSlides, setPresentationIndex, fitView]
  );

  useEffect(() => {
    if (!presentationMode) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPresentationMode(false);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goTo(presentationIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(presentationIndex - 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [presentationMode, presentationIndex, goTo, setPresentationMode]);

  // Go to first slide on enter
  useEffect(() => {
    if (presentationMode && totalSlides > 0) {
      goTo(0);
    }
  }, [presentationMode]);

  if (!presentationMode) return null;

  const currentNode = path[presentationIndex];
  const label = currentNode ? (currentNode.data as NodeData).label : "";
  const description = currentNode ? (currentNode.data as NodeData).description : "";

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 flex flex-col items-center justify-center">
      {/* Close button */}
      <button
        onClick={() => setPresentationMode(false)}
        className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Content */}
      <div className="text-center max-w-2xl px-8">
        <h1 className="text-4xl font-bold text-white mb-4">{label}</h1>
        {description && (
          <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">{description}</p>
        )}
      </div>

      {/* Navigation bar */}
      <div className="absolute bottom-8 flex items-center gap-4">
        <button
          onClick={() => goTo(presentationIndex - 1)}
          disabled={presentationIndex === 0}
          className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm text-zinc-500 font-mono">
          {presentationIndex + 1} / {totalSlides}
        </span>

        <button
          onClick={() => goTo(presentationIndex + 1)}
          disabled={presentationIndex >= totalSlides - 1}
          className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-16 flex gap-1.5">
        {path.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === presentationIndex
                ? "bg-indigo-500 scale-125"
                : "bg-zinc-600 hover:bg-zinc-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
