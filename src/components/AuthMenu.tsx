import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const AuthMenu = () => {
  const { user, isGuest, signIn, signUp, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const res = await signIn(email, password);
    if (res.ok) {
      toast.success(res.message || "Signed in");
      setOpen(false);
    } else {
      toast.error(res.message || "Failed to sign in");
    }
  };

  const handleSignUp = async () => {
    const res = await signUp(email, password);
    if (res.ok) {
      toast.success(res.message || "Account created. You can now sign in.");
      setOpen(false);
    } else {
      toast.error(res.message || "Failed to create account");
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
              <DialogTitle>Sign in</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSignIn} disabled={!email || !password}>Sign in</Button>
                <Button variant="outline" onClick={handleSignUp} disabled={!email || !password}>Create account</Button>
              </div>
              <p className="text-sm text-muted-foreground">Or continue as guest—your progress will sync after you sign in.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
