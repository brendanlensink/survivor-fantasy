export default function PageHeading({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl uppercase tracking-wide text-parchment">{children}</h1>
      <div className="w-16 h-1 bg-ember mt-2 mb-3" />
      {subtitle && <p className="text-parchment-dim text-sm max-w-prose">{subtitle}</p>}
    </div>
  );
}
