import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auth state listener in useAuth will pick up the recovery session
    setReady(true);
  }, []);

  const handle = async () => {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);
    if (res.ok) {
      toast.success("Password updated");
      navigate("/");
    } else {
      toast.error(res.message || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <SakuraBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Set a new password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading || !ready} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading || !ready} />
            </div>
            <Button className="w-full" onClick={handle} disabled={!password || !confirm || loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
