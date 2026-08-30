use std::fs;
use std::path::PathBuf;
use tauri::command;
use tauri_plugin_dialog::DialogExt;

#[command]
pub fn export_svg(
    app: tauri::AppHandle,
    svg_data: String,
    file_path: Option<String>,
) -> Result<Option<String>, String> {
    let path = match file_path {
        Some(p) => PathBuf::from(p),
        None => {
            let dialog_path = app
                .dialog()
                .file()
                .add_filter("SVG Image", &["svg"])
                .blocking_save_file();
            match dialog_path {
                Some(p) => p.into_path().map_err(|e| e.to_string())?,
                None => return Ok(None),
            }
        }
    };

    // Fix H4: Always use .svg extension since we export SVG, not PNG
    let final_path = if path.extension().map_or(true, |ext| ext != "svg") {
        path.with_extension("svg")
    } else {
        path
    };

    fs::write(&final_path, &svg_data).map_err(|e| e.to_string())?;
    Ok(Some(final_path.to_string_lossy().to_string()))
}
