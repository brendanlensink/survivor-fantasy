export default function TorchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2c1.5 2 2.5 3.3 1 5-1 1.1-1 2 0 3 1.8 1.8 1.2 4.3-1 4.3s-2.8-2.5-1-4.3c1-1 1-1.9 0-3-1.5-1.7-.5-3 1-5Z"
        fill="currentColor"
      />
      <path d="M12 13v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
