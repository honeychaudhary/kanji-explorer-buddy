import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { User, BookOpen, Target, Trophy } from "lucide-react";

interface UserProfile {
  display_name: string;
  avatar_url?: string;
  bio?: string;
  total_kanji_learned: number;
  current_streak: number;
  longest_streak: number;
  preferred_jlpt_level: string;
  created_at: string;
}

export const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign in to track progress</h3>
          <p className="text-muted-foreground mb-4">
            Create an account to save your learning progress and unlock AI-powered features.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading || !profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
            <div className="h-3 bg-muted rounded w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString();
  const initials = profile.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{profile.display_name}</h3>
            <p className="text-sm text-muted-foreground">
              Member since {joinDate}
            </p>
            <Badge variant="secondary" className="mt-1">
              {profile.preferred_jlpt_level}
            </Badge>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {profile.total_kanji_learned}
            </div>
            <div className="text-xs text-muted-foreground">Learned</div>
          </div>
          
          <div className="text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">
              {profile.current_streak}
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
          
          <div className="text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">
              {profile.longest_streak}
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};