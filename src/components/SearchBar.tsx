import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFlowStore, NodeData } from "../hooks/useFlowStore";

export default function SearchBar() {
  const { fitView } = useReactFlow();
  const searchOpen = useFlowStore((s) => s.searchOpen);
  const searchQuery = useFlowStore((s) => s.searchQuery);
  const setSearchQuery = useFlowStore((s) => s.setSearchQuery);
  const setSearchOpen = useFlowStore((s) => s.setSearchOpen);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);
  const nodes = useFlowStore((s) => s.nodes);

  const [matchIndex, setMatchIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = nodes.filter((n) => {
    const label = (n.data as NodeData).label;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setMatchIndex(0);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (matches.length > 0 && matchIndex < matches.length) {
      const node = matches[matchIndex];
      setSelectedNode(node.id);
      fitView({ nodes: [{ id: node.id }], duration: 300, padding: 0.5 });
    }
  }, [matchIndex, matches, fitView, setSelectedNode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      setMatchIndex((i) => (i + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMatchIndex((i) => (i - 1 + matches.length) % Math.max(matches.length, 1));
    }
  };

  if (!searchOpen) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl px-3 py-2 min-w-[300px]">
        <svg className="w-4 h-4 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setMatchIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search nodes..."
          className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none"
        />
        {searchQuery && (
          <span className="text-[10px] text-zinc-400 shrink-0">
            {matches.length > 0 ? `${matchIndex + 1}/${matches.length}` : "No matches"}
          </span>
        )}
        <button
          onClick={() => setSearchOpen(false)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
