// Layout constants mapped to the native DL4 MkII faceplate art (3600x2300).
// Coordinates are pixel positions from the original WPF assets so hit areas
// stay aligned with the printed hardware.
export const faceplateSize = { width: 3600, height: 2300 };

// Final positions captured via debug overlay 2025-12-18
export const selectorPosition = { x: 777.9, y: 899.0 };
export const altButtonPosition = { x: 1240.3, y: 993.7 };
export const reverbSelectorPosition = { x: 911.7, y: 1393.6 };

export const delayKnobPositions = [
  { x: 1532.9, y: 861.2 }, // Time / Subdiv
  { x: 1940.1, y: 858.2 }, // Repeats
  { x: 2338.3, y: 854.7 }, // Tweak
  { x: 2740.0, y: 855.5 }, // Tweez
  { x: 3137.1, y: 855.5 } // Mix
];

export const reverbKnobPositions = [
  { x: 1730.7, y: 1359.2 }, // Reverb Decay
  { x: 2131.7, y: 1360.2 }, // Tweak
  { x: 2529.7, y: 1354.8 }, // Routing
  { x: 2937.1, y: 1358.8 } // Reverb Mix
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
