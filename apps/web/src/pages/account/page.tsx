import { TextInput } from "@myapp/ui/components/text-input";
import { ThemeSlider } from "@myapp/ui/components/theme-slider";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/auth/session-context";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

function AccountPage() {
  const { session } = useSession();
  const email = session?.user.email ?? "";

  const { data: profile, isLoading: profileLoading } = trpc.user.myProfile.useQuery();
  const utils = trpc.useUtils();

  const updateProfile = trpc.user.updateMyProfile.useMutation({
    onSuccess: () => utils.user.myProfile.invalidate(),
  });

  const [name, setName] = useState("");
  useEffect(() => {
    if (profile?.name != null) setName(profile.name);
  }, [profile?.name]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ name });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setPasswordBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordBusy(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-hanover-green" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-muted px-4 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Account settings</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Manage your profile and password for the employee portal.
        </p>

        <div className="mb-8 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
          <ThemeSlider />
        </div>

        <div className="mb-8 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div>
              <label
                htmlFor="account-email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Email
              </label>
              <input
                id="account-email"
                type="email"
                readOnly
                value={email}
                className="w-full cursor-not-allowed rounded border border-border bg-muted px-4 py-2 text-muted-foreground"
              />
            </div>
            <TextInput
              label="Display name"
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {updateProfile.isError && (
              <p className="text-sm text-destructive">{updateProfile.error.message}</p>
            )}
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-md bg-hanover-green px-4 py-2 font-medium text-white hover:bg-hanover-green/90 disabled:opacity-60"
            >
              {updateProfile.isPending ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Security</h2>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <TextInput
              label="New password"
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextInput
              label="Confirm new password"
              id="account-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            {passwordMessage ? (
              <p className="text-sm text-hanover-green">{passwordMessage}</p>
            ) : null}
            <button
              type="submit"
              disabled={passwordBusy || !newPassword}
              className="rounded-md border border-border bg-background px-4 py-2 font-medium text-foreground hover:bg-muted disabled:opacity-60"
            >
              {passwordBusy ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
