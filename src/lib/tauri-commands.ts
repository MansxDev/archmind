import { invoke } from "@tauri-apps/api/core";

export interface MindmapData {
  version: string;
  viewport: { x: number; y: number; zoom: number };
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export interface MindmapNode {
  id: string;
  type: "root" | "branch" | "leaf";
  position: { x: number; y: number };
  data: {
    label: string;
    color: string;
    fontSize: number;
    parentId: string | null;
    collapsed: boolean;
    description: string;
  };
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: { stroke: string; strokeWidth: number };
}

export async function invokeSaveMindmap(
  filePath: string | null,
  data: MindmapData
): Promise<string | null> {
  return invoke<string | null>("save_mindmap", {
    filePath,
    data: JSON.stringify(data),
  });
}

export async function invokeOpenMindmap(
  filePath: string | null
): Promise<MindmapData | null> {
  return invoke<MindmapData | null>("open_mindmap", { filePath });
}

export async function invokeExportSvg(
  svgData: string,
  filePath: string | null
): Promise<string | null> {
  return invoke<string | null>("export_svg", { svgData, filePath });
}
