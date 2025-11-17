import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Menu, PiggyBank, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-yellow-300 border-b-2 border-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-sm bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex items-center justify-center">
              <PiggyBank className="w-7 h-7 text-black" />
            </div>
            <span className="text-3xl font-black text-foreground tracking-tighter group-hover:scale-105 transition-transform">
              SPENDIE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Authenticated>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="text-foreground font-bold text-lg hover:bg-foreground/10 hover:scale-105 transition-all"
                >
                  DASHBOARD
                </Button>
              </Link>
            </Authenticated>

            <Unauthenticated>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  className="border-2 border-foreground bg-transparent text-foreground font-bold text-lg transition-all"
                >
                  LOG IN
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button
                  className="bg-foreground text-white font-black text-lg border-2 border-black hover:scale-105 transition-all"
                  style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.2)" }}
                >
                  REGISTER
                </Button>
              </Link>
            </Unauthenticated>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" strokeWidth={3} />
            ) : (
              <Menu className="h-6 w-6 text-foreground" strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4  border-t-2 border-foreground/20 flex flex-col space-y-2">
            <Authenticated>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full text-foreground font-bold text-lg hover:bg-foreground/10 justify-start"
                >
                  DASHBOARD
                </Button>
              </Link>
            </Authenticated>

            <Unauthenticated>
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-2 border-foreground bg-transparent text-foreground font-bold text-lg hover:bg-foreground hover:text-primary"
                >
                  LOG IN
                </Button>
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-foreground text-white font-black text-lg border-2 border-foreground hover:bg-foreground/90">
                  REGISTER
                </Button>
              </Link>
            </Unauthenticated>
          </div>
        )}
      </div>
    </nav>
  );
};
