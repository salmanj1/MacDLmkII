export const routingOptions = [
  { label: 'Rev → Dly', value: 0 },
  { label: 'Parallel', value: 1 },
  { label: 'Dly → Rev', value: 2 }
] as const;

export const defaultRoutingValue = 1;

export const normalizeRoutingValue = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return defaultRoutingValue;
  if (value <= 2) return Math.max(0, Math.min(2, Math.round(value)));
  if (value < 43) return 0;
  if (value < 86) return 1;
  return 2;
};
