use midir::{MidiInput, MidiInputConnection, MidiOutput, MidiOutputConnection};
use std::sync::{Arc, Mutex};
use std::time::Instant;

/// Minimal MIDI manager for CoreMIDI (macOS) that keeps a single output connection alive.
/// Errors are flattened to strings to keep the bridge simple for the frontend.
pub struct MidiState {
  connection: Option<MidiOutputConnection>,
  selected_port: Option<usize>,
  clock_input: Option<MidiInputConnection<()>>,
  clock_state: Arc<Mutex<ClockState>>,
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
      connection: None,
      selected_port: None,
      clock_input: None,
      clock_state: Arc::new(Mutex::new(ClockState::default())),
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

  pub fn select_output(&mut self, index: usize) -> Result<(), String> {
    // Drop any existing connection before opening a new one.
    self.connection = None;
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
    self.connection = Some(conn);
    self.selected_port = Some(index);
    Ok(())
  }

  pub fn send_cc(&mut self, channel: u8, control: u8, value: u8) -> Result<(), String> {
    let msg = [
      0xB0 | ((channel.saturating_sub(1)) & 0x0F),
      control.min(127),
      value.min(127),
    ];
    self
      .connection
      .as_mut()
      .ok_or_else(|| "No MIDI output selected".to_string())?
      .send(&msg)
      .map_err(|e| e.to_string())
  }

  pub fn send_pc(&mut self, channel: u8, program: u8) -> Result<(), String> {
    let msg = [0xC0 | ((channel.saturating_sub(1)) & 0x0F), program.min(127)];
    self
      .connection
      .as_mut()
      .ok_or_else(|| "No MIDI output selected".to_string())?
      .send(&msg)
      .map_err(|e| e.to_string())
  }

  pub fn selected_port(&self) -> Option<usize> {
    self.selected_port
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
