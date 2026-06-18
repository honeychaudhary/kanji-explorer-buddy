import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async () => {
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.ok) {
      setSent(true);
      toast.success("Password reset email sent");
    } else {
      toast.error(res.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <SakuraBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md backdrop-blur-sm bg-card/90 border-primary/20">
          <CardHeader className="text-center">
            <div className="text-4xl font-japanese-serif mb-4">漢字</div>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>We'll email you a secure link to set a new password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <p className="text-sm text-muted-foreground text-center">
                If an account exists for <span className="font-medium">{email}</span>, you'll receive a reset link shortly.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <Button className="w-full" onClick={handle} disabled={!email || loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </>
            )}
            <p className="text-xs text-center text-muted-foreground">
              <Link to="/login" className="underline">Back to sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
