import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const AuthMenu = () => {
  const { user, isGuest, signInMagic, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    const res = await signInMagic(email);
    if (res.ok) {
      toast.success(res.message || "Magic link sent");
      setOpen(false);
    } else {
      toast.error(res.message || "Failed to send magic link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm opacity-90">{user.email}</span>
          <Button size="sm" variant="secondary" onClick={signOut}>Sign out</Button>
        </>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">Sign in</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in with magic link</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleSend} disabled={!email}>Send magic link</Button>
              <p className="text-sm text-muted-foreground">Or continue as guest—your progress will sync after you sign in.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
