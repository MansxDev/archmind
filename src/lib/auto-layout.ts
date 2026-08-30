import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../hooks/useFlowStore";

interface LayoutOptions {
  direction: "LR" | "TB" | "RL" | "BT";
  nodeWidth: number;
  nodeHeight: number;
  rankSep: number;
  nodeSep: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: "LR",
  nodeWidth: 200,
  nodeHeight: 80,
  rankSep: 120,
  nodeSep: 60,
};

export function applyAutoLayout(
  nodes: Node<NodeData>[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
): Node<NodeData>[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: opts.nodeWidth, height: opts.nodeHeight });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: pos.x - opts.nodeWidth / 2,
        y: pos.y - opts.nodeHeight / 2,
      },
    };
  });
}
