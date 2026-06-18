import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";
import { Users, UserCheck, Crown, Volume2, Search, AlertCircle } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalAudioPlays: number;
  topKanji: { kanji: string; count: number }[];
}

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [profilesRes, premiumRes, audioRes, searchesRes, activeRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).neq("subscription_plan", "free"),
          supabase.from("audio_plays").select("*", { count: "exact", head: true }),
          supabase.from("kanji_searches").select("kanji").gte("created_at", sevenDaysAgo).limit(1000),
          supabase.from("audio_plays").select("user_id").gte("created_at", sevenDaysAgo).limit(5000),
        ]);

        if (profilesRes.error) throw profilesRes.error;

        const counts: Record<string, number> = {};
        (searchesRes.data || []).forEach((r: any) => {
          counts[r.kanji] = (counts[r.kanji] || 0) + 1;
        });
        const topKanji = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([kanji, count]) => ({ kanji, count }));

        const activeUserIds = new Set((activeRes.data || []).map((r: any) => r.user_id));

        setStats({
          totalUsers: profilesRes.count || 0,
          activeUsers: activeUserIds.size,
          premiumUsers: premiumRes.count || 0,
          totalAudioPlays: audioRes.count || 0,
          topKanji,
        });
      } catch (e: any) {
        setError(e.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <SakuraBackground />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-2 py-6">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} />
              <StatCard icon={<UserCheck />} label="Active (7d)" value={stats.activeUsers} />
              <StatCard icon={<Crown />} label="Premium Users" value={stats.premiumUsers} />
              <StatCard icon={<Volume2 />} label="Audio Plays" value={stats.totalAudioPlays} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" /> Most Searched Kanji (7d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topKanji.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No searches recorded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {stats.topKanji.map((k) => (
                      <div key={k.kanji} className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-japanese-serif">{k.kanji}</div>
                        <div className="text-sm text-muted-foreground mt-1">{k.count} searches</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          </div>
          <div className="text-primary opacity-60">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
