export default function TorchIcon({ className }: { className?: string }) {
  // Fixed-color pixel-art asset, not a stroke icon — it can't pick up
  // `text-*` tint classes the way the old inline SVG did. Callers that pass
  // a "dim"/muted wood color (unfilled draft pips, EmptyState's decorative
  // icon) still get a visibly unlit look via opacity + grayscale instead.
  const muted = className?.includes("wood-500") || className?.includes("wood-600");
  return (
    <img
      src="/images/torch.png"
      alt=""
      aria-hidden="true"
      className={`${className ?? ""} object-contain ${muted ? "opacity-40 grayscale" : ""}`}
    />
  );
}
