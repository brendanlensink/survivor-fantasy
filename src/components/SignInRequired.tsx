import TorchIcon from "./TorchIcon";
import AuthButtons from "./AuthButtons";

export default function SignInRequired() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <TorchIcon className="w-8 h-8 text-ember" />
      <h1 className="font-display text-2xl uppercase tracking-wide text-parchment">Sign in to continue</h1>
      <p className="text-parchment-dim text-sm max-w-sm">
        Sign in with Google to draft a team, see standings, and become the sole (fantasy) survivor.
      </p>
      <AuthButtons user={null} />
    </div>
  );
}
