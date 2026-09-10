/**
 * Deterministic tribe -> accent color mapping (buff-style badge colors).
 * Hash-based so it doesn't need the full tribe list threaded through every
 * component — same tribe name always gets the same color.
 */
const PALETTE = [
  { bg: "#e8791a", text: "#1a1410" }, // ember orange
  { bg: "#3d6b8a", text: "#f0e6d2" }, // deep teal
  { bg: "#b23a1f", text: "#f0e6d2" }, // blood red
  { bg: "#7a8a3d", text: "#1a1410" }, // moss green
  { bg: "#c9a63d", text: "#1a1410" }, // gold
  { bg: "#8a5a9e", text: "#f0e6d2" }, // violet
];

export function tribeColor(tribe: string) {
  let hash = 0;
  for (let i = 0; i < tribe.length; i++) {
    hash = (hash * 31 + tribe.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
