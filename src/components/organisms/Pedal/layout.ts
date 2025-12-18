// Layout constants mapped to the native DL4 MkII faceplate art (3600x2300).
// Coordinates are pixel positions from the original WPF assets so hit areas
// stay aligned with the printed hardware.
export const faceplateSize = { width: 3600, height: 2300 };

export const selectorPosition = { x: 781.3, y: 1040.0 };
export const altButtonPosition = { x: 1245.0, y: 1125.0 };
export const reverbSelectorPosition = { x: 891.5, y: 1560.0 };

export const delayKnobPositions = [
  { x: 1526.3, y: 980.0 }, // Time / Subdiv
  { x: 1929.3, y: 981.0 }, // Repeats
  { x: 2328.3, y: 980.0 }, // Tweak
  { x: 2728.3, y: 979.0 }, // Tweez
  { x: 3129.2, y: 982.0 } // Mix
];

export const reverbKnobPositions = [
  { x: 1723.2, y: 1440.0 }, // Reverb Decay
  { x: 2124.2, y: 1444.0 }, // Tweak
  { x: 2525.2, y: 1442.0 }, // Routing
  { x: 2925.2, y: 1446.0 } // Reverb Mix
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
