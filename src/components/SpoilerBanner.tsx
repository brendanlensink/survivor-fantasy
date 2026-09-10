import { toggleSpoilerMode } from "@/lib/spoilerModeActions";

export default function SpoilerBanner() {
  return (
    <div className="bg-ember text-wood-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
      <span className="truncate">🔒 Spoiler-free mode is on</span>
      <form action={toggleSpoilerMode} className="shrink-0">
        <button
          type="submit"
          className="underline underline-offset-2 hover:no-underline font-semibold whitespace-nowrap"
        >
          Turn off
        </button>
      </form>
    </div>
  );
}
