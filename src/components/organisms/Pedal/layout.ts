// Layout constants mapped to the native DL4 MkII faceplate art (3600x2300).
// Coordinates are pixel positions from the original WPF assets so hit areas
// stay aligned with the printed hardware.
export const faceplateSize = { width: 3600, height: 2300 };

// Final positions captured via debug overlay 2025-12-18
export const selectorPosition = { x: 776.0, y: 1019.0 };
export const altButtonPosition = { x: 1235.0, y: 1102.0 };
export const reverbSelectorPosition = { x: 877.0, y: 1506.0 };

export const delayKnobPositions = [
  { x: 1533.0, y: 1027.0 }, // Time / Subdiv
  { x: 1936.0, y: 1027.5 }, // Repeats
  { x: 2337.0, y: 1028.0 }, // Tweak
  { x: 2740.0, y: 1027.0 }, // Tweez
  { x: 3143.0, y: 1029.0 } // Mix
];

export const reverbKnobPositions = [
  { x: 1741.0, y: 1461.0 }, // Reverb Decay
  { x: 2143.0, y: 1464.0 }, // Tweak
  { x: 2545.0, y: 1462.0 }, // Routing
  { x: 2946.0, y: 1465.0 } // Reverb Mix
];

export const detentWindowRect = {
  x: 3720, // keep off-plate but compact for sidebar slot
  y: 260,
  width: 920,
  height: 1080
};

export const footswitchPositions = [
  { x: 400.7, y: 1909.1 },
  { x: 1331.7, y: 1909.1 },
  { x: 2262.7, y: 1910.1 },
  { x: 3191.7, y: 1910.1 }
];

export const virtualSetPosition = { x: 3456, y: 1886 }; // 96% / 82% spot tucked near Tap
