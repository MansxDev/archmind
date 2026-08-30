import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../hooks/useFlowStore";

export function exportToMarkdown(nodes: Node<NodeData>[], edges: Edge[]): string {
  const lines: string[] = [];
  const roots = nodes.filter((n) => !n.data.parentId);

  function walk(parentId: string, depth: number) {
    const children = nodes.filter((n) => n.data.parentId === parentId);
    for (const child of children) {
      const nd = child.data;
      const indent = "  ".repeat(depth);
      const description = nd.description ? `\n${indent}  > ${nd.description.replace(/\n/g, `\n${indent}  > `)}` : "";
      lines.push(`${indent}- **${nd.label}**${description}`);
      walk(child.id, depth + 1);
    }
  }

  for (const root of roots) {
    lines.push(`# ${root.data.label}`);
    if (root.data.description) lines.push(`\n> ${root.data.description.replace(/\n/g, "\n> ")}\n`);
    walk(root.id, 1);
    lines.push("");
  }

  // add edge annotations if any
  const labeledEdges = edges.filter((e) => e.label);
  if (labeledEdges.length > 0) {
    lines.push("---");
    lines.push("## Relationships\n");
    for (const edge of labeledEdges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (source && target) {
        lines.push(`- ${source.data.label} → ${edge.label} → ${target.data.label}`);
      }
    }
  }

  return lines.join("\n");
}
