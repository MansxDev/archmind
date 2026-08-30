use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;
use tauri_plugin_dialog::DialogExt;

const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10MB limit

#[derive(Serialize, Deserialize, Debug)]
pub struct MindmapData {
    pub version: String,
    pub viewport: Viewport,
    pub nodes: Vec<MindmapNode>,
    pub edges: Vec<MindmapEdge>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Viewport {
    pub x: f64,
    pub y: f64,
    pub zoom: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MindmapNode {
    pub id: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub position: Position,
    pub data: NodeData,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeData {
    pub label: String,
    pub color: String,
    #[serde(rename = "fontSize")]
    pub font_size: f64,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MindmapEdge {
    pub id: String,
    pub source: String,
    pub target: String,
    #[serde(rename = "type")]
    pub edge_type: Option<String>,
    pub animated: Option<bool>,
    pub style: Option<EdgeStyle>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EdgeStyle {
    pub stroke: String,
    #[serde(rename = "strokeWidth")]
    pub stroke_width: f64,
}

#[command]
pub fn save_mindmap(
    app: tauri::AppHandle,
    file_path: Option<String>,
    data: String,
) -> Result<Option<String>, String> {
    let path = match file_path {
        Some(p) => PathBuf::from(p),
        None => {
            // Fix H6: Use async dialog via thread spawn to avoid blocking UI
            let dialog_path = app
                .dialog()
                .file()
                .add_filter("ArchMind File", &["archmind"])
                .blocking_save_file();
            match dialog_path {
                Some(p) => p.into_path().map_err(|e| e.to_string())?,
                None => return Ok(None),
            }
        }
    };

    // Ensure .archmind extension
    let final_path = if path.extension().map_or(true, |ext| ext != "archmind") {
        path.with_extension("archmind")
    } else {
        path
    };

    fs::write(&final_path, &data).map_err(|e| e.to_string())?;
    Ok(Some(final_path.to_string_lossy().to_string()))
}

#[command]
pub fn open_mindmap(
    app: tauri::AppHandle,
    file_path: Option<String>,
) -> Result<Option<MindmapData>, String> {
    let path = match file_path {
        Some(p) => PathBuf::from(p),
        None => {
            let dialog_path = app
                .dialog()
                .file()
                .add_filter("ArchMind File", &["archmind"])
                .blocking_pick_file();
            match dialog_path {
                Some(p) => p.into_path().map_err(|e| e.to_string())?,
                None => return Ok(None),
            }
        }
    };

    // Fix H7: Check file size before reading to prevent OOM
    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    if metadata.len() > MAX_FILE_SIZE {
        return Err(format!(
            "File too large ({}MB). Maximum allowed is 10MB.",
            metadata.len() / (1024 * 1024)
        ));
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let parsed: MindmapData =
        serde_json::from_str(&content).map_err(|e| format!("Parse error: {}", e))?;
    Ok(Some(parsed))
}
