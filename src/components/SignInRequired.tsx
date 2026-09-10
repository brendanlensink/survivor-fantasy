import TorchIcon from "./TorchIcon";
import AuthButtons from "./AuthButtons";

export default function SignInRequired() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <TorchIcon className="w-8 h-8 text-ember" />
      <h1 className="font-display text-2xl uppercase tracking-wide text-parchment">Sign in to continue</h1>
      <p className="text-parchment-dim text-sm max-w-sm">
        Survivor Fantasy is for the league only. Sign in with Google to see standings, draft your team, and browse the cast.
      </p>
      <AuthButtons user={null} />
    </div>
  );
}
