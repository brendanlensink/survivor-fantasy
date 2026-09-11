import TorchIcon from "./TorchIcon";
import AuthButtons from "./AuthButtons";

export default function SignInRequired() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <TorchIcon className="w-8 h-8 text-ember" />
      <h1 className="font-display text-2xl uppercase tracking-wide text-[#f3ebdb]">Survivor Fantasy</h1>
      <p className="text-parchment text-sm max-w-sm">
        Survivor Fantasy is a friend-group fantasy league for the TV show Survivor. Each player drafts a
        team of contestants before the season starts, then earns points as those contestants win
        challenges, find idols, and make it through tribal council.
      </p>
      <p className="text-parchment text-sm max-w-sm">
        Sign in with Google to draft your team and see how everyone stacks up on the live leaderboard.
      </p>
      <AuthButtons user={null} />
    </div>
  );
}
