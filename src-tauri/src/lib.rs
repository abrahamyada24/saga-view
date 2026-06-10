use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

#[tauri::command]
fn toggle_fullscreen(window: tauri::WebviewWindow) -> Result<(), String> {
  let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
  window.set_fullscreen(!is_fullscreen).map_err(|e| e.to_string())?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![toggle_fullscreen])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
      let db_path = app_data_dir.join("data").join("studio.db");
      let db_url = format!("file:{}", db_path.display().to_string().replace("\\", "/"));

      // Spawn the Node.js server sidecar
      let sidecar_command = app.shell()
        .sidecar("node")
        .expect("failed to create `node` binary command")
        .args([".output/server/index.mjs"])
        .env("PORT", "5174")
        .env("HOST", "127.0.0.1")
        .env("DB_PATH", db_url);
      let (mut rx, mut _child) = sidecar_command
        .spawn()
        .expect("Failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Stdout(line) = event {
            println!("server: {}", String::from_utf8_lossy(&line));
          } else if let CommandEvent::Stderr(line) = event {
            eprintln!("server err: {}", String::from_utf8_lossy(&line));
          }
        }
      });

      #[cfg(not(debug_assertions))]
      {
        let window = app.get_webview_window("main").expect("main window not found");
        // Give the server a moment to bind to the port
        std::thread::sleep(std::time::Duration::from_millis(2000));
        window.eval("window.location.replace('http://127.0.0.1:5174/admin/session');").unwrap();
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
