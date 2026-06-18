import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon, Shield } from "lucide-react";

export const AuthMenu = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button asChild size="sm" variant="secondary">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  const name = profile?.full_name || profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = name.slice(0, 2).toUpperCase();
  const avatar = profile?.avatar_url || (user.user_metadata as any)?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-primary-foreground/10 transition-colors">
          <Avatar className="w-7 h-7">
            {avatar && <AvatarImage src={avatar} alt={name} />}
            <AvatarFallback className="text-xs bg-primary-foreground/20 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm hidden sm:inline max-w-[120px] truncate">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium truncate">{name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <UserIcon className="w-4 h-4 mr-2" /> Settings
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="w-4 h-4 mr-2" /> Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
