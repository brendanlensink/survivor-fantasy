import TorchIcon from "./TorchIcon";

export default function EmptyState({
  children,
  compact,
}: {
  children: React.ReactNode;
  /** Smaller inline variant for use inside an already-framed card/table, vs. a standalone page section. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p className="text-parchment-dim text-sm flex items-center gap-2 py-2">
        <TorchIcon className="w-3.5 h-3.5 text-wood-500 shrink-0" />
        {children}
      </p>
    );
  }

  return (
    <div className="border border-dashed border-wood-600 rounded-lg px-6 py-10 text-center">
      <TorchIcon className="w-6 h-6 text-wood-500 mx-auto mb-3" />
      <p className="text-parchment-dim">{children}</p>
    </div>
  );
}
