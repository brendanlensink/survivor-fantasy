import SpoilerToggleButton from "./SpoilerToggleButton";

export default function SpoilerBanner() {
  return (
    <div className="bg-ember text-wood-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
      <span className="truncate">🔒 Spoiler-free mode is on</span>
      <SpoilerToggleButton className="underline underline-offset-2 hover:no-underline font-semibold whitespace-nowrap shrink-0">
        Turn off
      </SpoilerToggleButton>
    </div>
  );
}
