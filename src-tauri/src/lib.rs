mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::file_io::save_mindmap,
            commands::file_io::open_mindmap,
            commands::export::export_svg, // Fix H4: renamed from export_png
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
