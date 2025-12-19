use midir::{MidiInput, MidiInputConnection, MidiOutput, MidiOutputConnection};
use std::sync::{
  atomic::{AtomicBool, Ordering},
  Arc, Mutex,
};
use std::thread::JoinHandle;
use std::time::{Duration, Instant};

/// Minimal MIDI manager for CoreMIDI (macOS) that keeps a single output connection alive.
/// Errors are flattened to strings to keep the bridge simple for the frontend.
pub struct MidiState {
  connection: Arc<Mutex<Option<MidiOutputConnection>>>,
  selected_port: Option<usize>,
  clock_input: Option<MidiInputConnection<()>>,
  clock_state: Arc<Mutex<ClockState>>,
  clock_send_running: Arc<AtomicBool>,
  clock_send_handle: Option<JoinHandle<()>>,
}

#[derive(Default)]
struct ClockState {
  last_tick: Option<Instant>,
  ticks: u32,
  bpm: Option<f64>,
  running: bool,
}

impl Default for MidiState {
  fn default() -> Self {
    Self {
      connection: Arc::new(Mutex::new(None)),
      selected_port: None,
      clock_input: None,
      clock_state: Arc::new(Mutex::new(ClockState::default())),
      clock_send_running: Arc::new(AtomicBool::new(false)),
      clock_send_handle: None,
    }
  }
}

impl MidiState {
  pub fn list_outputs(&self) -> Result<Vec<String>, String> {
    let midi_out = MidiOutput::new("MacDL MkII").map_err(|e| e.to_string())?;
    let ports = midi_out.ports();

    let mut names = Vec::with_capacity(ports.len());
    for port in ports {
      let name = midi_out
        .port_name(&port)
        .map_err(|e| e.to_string())?;
      names.push(name);
    }
    Ok(names)
  }

  pub fn list_inputs(&self) -> Result<Vec<String>, String> {
    let midi_in = MidiInput::new("MacDL MkII Clock In").map_err(|e| e.to_string())?;
    let ports = midi_in.ports();
    let mut names = Vec::with_capacity(ports.len());
    for port in ports {
      let name = midi_in.port_name(&port).map_err(|e| e.to_string())?;
      names.push(name);
    }
    Ok(names)
  }

  pub fn select_output(&mut self, index: usize) -> Result<(), String> {
    // Drop any existing connection before opening a new one.
    self.stop_clock_send();
    if let Ok(mut conn) = self.connection.lock() {
      *conn = None;
    }
    self.selected_port = None;
    self.clock_input = None;

    let midi_out = MidiOutput::new("MacDL MkII").map_err(|e| e.to_string())?;
    let ports = midi_out.ports();
    let port = ports
      .get(index)
      .ok_or_else(|| "MIDI port index out of range".to_string())?;

    let conn = midi_out
      .connect(port, "MacDL MkII out")
      .map_err(|e| e.to_string())?;
    if let Ok(mut guard) = self.connection.lock() {
      *guard = Some(conn);
    }
    self.selected_port = Some(index);
    Ok(())
  }

  pub fn send_cc(&mut self, channel: u8, control: u8, value: u8) -> Result<(), String> {
    let msg = [
      0xB0 | ((channel.saturating_sub(1)) & 0x0F),
      control.min(127),
      value.min(127),
    ];
    self.send_bytes(&msg)
  }

  pub fn send_pc(&mut self, channel: u8, program: u8) -> Result<(), String> {
    let msg = [0xC0 | ((channel.saturating_sub(1)) & 0x0F), program.min(127)];
    self.send_bytes(&msg)
  }

  pub fn selected_port(&self) -> Option<usize> {
    self.selected_port
  }

  pub fn start_clock_send(&mut self, bpm: f64) -> Result<(), String> {
    if bpm <= 0.0 {
      return Err("BPM must be greater than zero".to_string());
    }
    let sleep = Duration::from_secs_f64(60.0 / (bpm * 24.0));
    {
      let conn = self.connection.lock().map_err(|_| "MIDI state poisoned")?;
      if conn.is_none() {
        return Err("No MIDI output selected".to_string());
      }
    }

    self.stop_clock_send();
    self.clock_send_running.store(true, Ordering::Relaxed);

    let running = Arc::clone(&self.clock_send_running);
    let connection = Arc::clone(&self.connection);
    self.clock_send_handle = Some(std::thread::spawn(move || {
      while running.load(Ordering::Relaxed) {
        let send_result = {
          connection
            .lock()
            .ok()
            .and_then(|mut guard| guard.as_mut().map(|c| c.send(&[0xF8])))
        };

        if let Some(Err(err)) = send_result {
          eprintln!("[MIDI] clock send failed: {err}");
          // Back off briefly to avoid tight error loops.
          std::thread::sleep(Duration::from_millis(50));
        } else {
          std::thread::sleep(sleep);
        }
      }
    }));

    // Send a Start message once when enabling, so devices lock tempo immediately.
    self.send_bytes(&[0xFA])?;
    Ok(())
  }

  pub fn stop_clock_send(&mut self) {
    self.clock_send_running.store(false, Ordering::Relaxed);
    if let Some(handle) = self.clock_send_handle.take() {
      let _ = handle.join();
    }
    let _ = self.send_bytes(&[0xFC]); // stop message is best-effort
  }

  fn send_bytes(&mut self, msg: &[u8]) -> Result<(), String> {
    let mut guard = self.connection.lock().map_err(|_| "MIDI state poisoned")?;
    guard
      .as_mut()
      .ok_or_else(|| "No MIDI output selected".to_string())?
      .send(msg)
      .map_err(|e| e.to_string())
  }

  pub fn enable_clock_follow(&mut self, index: usize) -> Result<(), String> {
    self.clock_input = None;
    let midi_in = MidiInput::new("MacDL MkII Clock In").map_err(|e| e.to_string())?;
    let ports = midi_in.ports();
    let port = ports
      .get(index)
      .ok_or_else(|| "MIDI port index out of range".to_string())?;

    let state = Arc::clone(&self.clock_state);
    let conn = midi_in
      .connect(
        port,
        "MacDL MkII clock in",
        move |_timestamp, message, _| {
          if message.is_empty() {
            return;
          }
          match message[0] {
            0xF8 => {
              if let Ok(mut clock) = state.lock() {
                let now = Instant::now();
                if let Some(last) = clock.last_tick {
                  let elapsed = now.duration_since(last).as_secs_f64();
                  clock.ticks += 1;
                  if clock.ticks >= 24 {
                    if elapsed > 0.0 {
                      let bpm = 60.0 / (elapsed / 24.0);
                      clock.bpm = Some(bpm);
                      clock.running = true;
                    }
                    clock.ticks = 0;
                  }
                }
                clock.last_tick = Some(now);
              }
            }
            0xFA | 0xFB => {
              if let Ok(mut clock) = state.lock() {
                clock.running = true;
                clock.ticks = 0;
                clock.last_tick = None;
              }
            }
            0xFC => {
              if let Ok(mut clock) = state.lock() {
                clock.running = false;
              }
            }
            _ => {}
          }
        },
        (),
      )
      .map_err(|e| e.to_string())?;

    self.clock_input = Some(conn);
    Ok(())
  }

  pub fn disable_clock_follow(&mut self) {
    self.clock_input = None;
    if let Ok(mut clock) = self.clock_state.lock() {
      *clock = ClockState::default();
    }
  }

  pub fn clock_status(&self) -> (bool, Option<f64>) {
    if let Ok(clock) = self.clock_state.lock() {
      (clock.running, clock.bpm)
    } else {
      (false, None)
    }
  }
}
