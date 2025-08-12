import { NavLink } from "react-router-dom";
import { Menu, X, Home, Info, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JLPT_LEVELS, JLPTString } from "@/types/kanji";
import { AuthMenu } from "@/components/AuthMenu";

interface NavigationProps {
  currentLevel?: JLPTString;
  onLevelChange?: (level: JLPTString) => void;
  showLevelSelector?: boolean;
}

export function Navigation({ currentLevel, onLevelChange, showLevelSelector = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="text-2xl font-japanese-serif font-bold">漢字</div>
            <span className="text-lg font-semibold">JLPT Explorer</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/learn"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </NavLink>

            {showLevelSelector && currentLevel && onLevelChange && (
              <Select value={currentLevel} onValueChange={(v) => onLevelChange(v as JLPTString)}>
                <SelectTrigger className="w-32 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      JLPT {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <AuthMenu />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in-up">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/learn"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </NavLink>

            {showLevelSelector && currentLevel && onLevelChange && (
              <div className="px-3 py-2">
                <Select value={currentLevel} onValueChange={(v) => onLevelChange(v as JLPTString)}>
                  <SelectTrigger className="w-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        JLPT {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="px-3 py-2">
              <AuthMenu />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}