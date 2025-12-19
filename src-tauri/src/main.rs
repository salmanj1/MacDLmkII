#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;

mod midi;

type SharedMidi = Mutex<midi::MidiState>;

#[tauri::command]
fn list_midi_outputs(state: tauri::State<'_, SharedMidi>) -> Result<Vec<String>, String> {
  let mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.list_outputs()
}

#[tauri::command]
fn select_midi_output(
  state: tauri::State<'_, SharedMidi>,
  index: usize,
) -> Result<Option<usize>, String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.select_output(index)?;
  Ok(mgr.selected_port())
}

#[tauri::command]
fn enable_midi_clock_follow(
  state: tauri::State<'_, SharedMidi>,
  index: usize,
) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.enable_clock_follow(index)
}

#[tauri::command]
fn disable_midi_clock_follow(
  state: tauri::State<'_, SharedMidi>,
) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.disable_clock_follow();
  Ok(())
}

#[tauri::command]
fn midi_clock_status(state: tauri::State<'_, SharedMidi>) -> Result<(bool, Option<f64>), String> {
  let mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  Ok(mgr.clock_status())
}

#[tauri::command]
fn start_midi_clock_send(
  state: tauri::State<'_, SharedMidi>,
  bpm: f64,
) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.start_clock_send(bpm)
}

#[tauri::command]
fn stop_midi_clock_send(state: tauri::State<'_, SharedMidi>) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.stop_clock_send();
  Ok(())
}

#[tauri::command]
fn send_midi_cc(
  state: tauri::State<'_, SharedMidi>,
  channel: u8,
  control: u8,
  value: u8,
) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.send_cc(channel, control, value)
}

#[tauri::command]
fn send_midi_pc(
  state: tauri::State<'_, SharedMidi>,
  channel: u8,
  program: u8,
) -> Result<(), String> {
  let mut mgr = state.lock().map_err(|_| "MIDI state poisoned".to_string())?;
  mgr.send_pc(channel, program)
}

#[tauri::command]
fn export_preset_bank(data: String) -> Result<(), String> {
  // Write to Downloads (preferred), fallback to home, then current dir.
  let target_dir: PathBuf = dirs::download_dir()
    .or_else(dirs::home_dir)
    .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

  let mut path = target_dir;
  path.push("preset-bank.json");

  fs::write(&path, data).map_err(|e| e.to_string())
}

fn main() {
  tauri::Builder::default()
    .manage(Mutex::new(midi::MidiState::default()))
    .invoke_handler(tauri::generate_handler![
      list_midi_outputs,
      select_midi_output,
      send_midi_cc,
      send_midi_pc,
      enable_midi_clock_follow,
      disable_midi_clock_follow,
      midi_clock_status,
      start_midi_clock_send,
      stop_midi_clock_send,
      export_preset_bank
    ])
    .plugin(tauri_plugin_opener::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
