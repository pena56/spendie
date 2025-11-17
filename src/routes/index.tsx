import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  Github,
  PiggyBank,
  Rocket,
  Trophy,
  Twitter,
  Users,
  Utensils,
} from "lucide-react";
import { BackgroundLines } from "@/components/ui/background-lines";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-yellow-300">
      <Navbar />

      <BackgroundLines className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center overflow-hidden bg-yellow-300">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-foreground/5 animate-pulse"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-foreground/5 animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 animate-fade-in space-y-8 max-w-5xl">
          {/* Coin Icon - Large and Bold */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 animate-ping  bg-foreground/20"
                style={{ animationDuration: "2s" }}
              ></div>
              <div className="relative w-32 h-32 rounded-sm bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex items-center justify-center">
                <PiggyBank className="w-20 h-20 text-black" />
              </div>
            </div>
          </div>

          {/* Main Logo/Title - Ultra Bold */}
          <h1
            className="text-8xl font-black tracking-tighter text-foreground md:text-9xl transform hover:scale-105 transition-transform"
            style={{
              textShadow: "4px 4px 0px rgba(0,0,0,0.1)",
              letterSpacing: "-0.05em",
            }}
          >
            SPENDIE
          </h1>

          {/* Tagline in badge */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-foreground/10 transform rotate-1 rounded-2xl"></div>
            <div className="relative bg-foreground text-white px-8 py-4 rounded-2xl border-4 border-foreground transform -rotate-1 hover:rotate-0 transition-transform">
              <h2 className="text-2xl font-black md:text-3xl">
                LEVEL UP YOUR WALLET!
              </h2>
            </div>
          </div>

          <p className="mx-auto max-w-2xl text-xl font-bold text-foreground/90 md:text-2xl">
            Track expenses, unlock achievements, and save smarter.
          </p>

          <Authenticated>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="group relative mt-8 border-4 border-foreground bg-foreground text-white px-12 py-8 text-xl font-black transition-all hover:bg-foreground/90 hover:scale-110 hover:shadow-2xl transform"
                style={{
                  boxShadow: "8px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                GET STARTED
                <span className="ml-3 inline-block text-2xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Button>
            </Link>
          </Authenticated>

          <Unauthenticated>
            <Link to="/auth/login">
              <Button
                size="lg"
                className="group relative mt-8 border-4 border-foreground bg-foreground text-white px-12 py-8 text-xl font-black transition-all hover:bg-foreground/90 hover:scale-110 hover:shadow-2xl transform"
                style={{
                  boxShadow: "8px 8px 0px rgba(0,0,0,0.2)",
                }}
              >
                GET STARTED
                <span className="ml-3 inline-block text-2xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Button>
            </Link>
          </Unauthenticated>
        </div>
      </BackgroundLines>

      <section className="relative bg-background px-4 sm:px-6 lg:px-8 py-24">
        <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-yellow-300 to-transparent"></div>

        <div className="mx-auto max-w-7xl">
          <h2
            className="text-center text-5xl font-black text-foreground mb-16 md:text-6xl"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
            }}
          >
            WHY SPENDIE?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div
              className="feature-card  transition-all duration-700 group"
              style={{ transitionDelay: "0ms" }}
            >
              <div
                className="relative h-full rounded-3xl bg-card p-10 shadow-xl border-4 border-foreground/10 hover:border-orange-500 transition-all hover:scale-105 hover:rotate-1 transform"
                style={{
                  boxShadow: "8px 8px 0px rgba(0,0,0,0.05)",
                }}
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-400 border-4 border-foreground/20 group-hover:scale-110 transition-transform">
                  <Utensils
                    className="h-10 w-10 text-foreground"
                    strokeWidth={3}
                  />
                </div>
                <h3 className="mb-4 text-3xl font-black text-black">
                  SMART TRACKING
                </h3>
                <p className="text-lg font-semibold text-black">
                  Log transactions via voice/scan, AI insights on spending.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className="feature-card transition-all duration-700 group"
              style={{ transitionDelay: "200ms" }}
            >
              <div
                className="relative h-full rounded-3xl bg-card p-10 shadow-xl border-4 border-foreground/10 hover:border-pink-500 transition-all hover:scale-105 hover:-rotate-1 transform"
                style={{
                  boxShadow: "8px 8px 0px rgba(0,0,0,0.05)",
                }}
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-400 border-4 border-foreground/20 group-hover:scale-110 transition-transform">
                  <Users
                    className="h-10 w-10 text-foreground"
                    strokeWidth={3}
                  />
                </div>
                <h3 className="mb-4 text-3xl font-black text-card-foreground">
                  SOCIAL SPLITS
                </h3>
                <p className="text-lg font-semibold text-muted-foreground">
                  Invite friends, settle shares instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              className="feature-card transition-all duration-700 group"
              style={{ transitionDelay: "400ms" }}
            >
              <div
                className="relative h-full rounded-3xl bg-card p-10 shadow-xl border-4 border-foreground/10 hover:border-green-500 transition-all hover:scale-105 hover:rotate-1 transform"
                style={{
                  boxShadow: "8px 8px 0px rgba(0,0,0,0.05)",
                }}
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-400 border-4 border-foreground/20 group-hover:scale-110 transition-transform">
                  <Trophy
                    className="h-10 w-10 text-foreground"
                    strokeWidth={3}
                  />
                </div>
                <h3 className="mb-4 text-3xl font-black text-card-foreground">
                  GAMIFIED GOALS
                </h3>
                <p className="text-lg font-semibold text-muted-foreground">
                  Earn XP, unlock avatars/frames for streaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-background to-transparent"></div>

        <div className="mx-auto max-w-6xl">
          <h2
            className="text-center text-5xl font-black text-foreground mb-16 md:text-6xl"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
            }}
          >
            HOW IT WORKS
          </h2>

          <div className="grid gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div
                  className="absolute inset-0 bg-foreground/20 rounded-full animate-pulse"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-primary border-4 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                  <span className="text-5xl font-black text-white">1</span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-foreground">TRACK</h3>
              <p className="text-xl font-bold text-foreground/80 max-w-xs">
                Snap receipts or voice-log expenses/income in seconds. AI
                categorizes automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div
                  className="absolute inset-0 bg-foreground/20 rounded-full animate-pulse"
                  style={{ animationDuration: "2s", animationDelay: "0.5s" }}
                ></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-primary border-4 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                  <span className="text-5xl font-black text-white">2</span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-foreground">SPLIT</h3>
              <p className="text-xl font-bold text-foreground/80 max-w-xs">
                Share bills with friends. Calculate splits and settle up
                instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div
                  className="absolute inset-0 bg-foreground/20 rounded-full animate-pulse"
                  style={{ animationDuration: "2s", animationDelay: "1s" }}
                ></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-primary border-4 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                  <span className="text-5xl font-black text-white">3</span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-foreground">LEVEL UP</h3>
              <p className="text-xl font-bold text-foreground/80 max-w-xs">
                Hit goals, earn XP, unlock rewards. Make saving fun!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-background px-4 sm:px-6 lg:px-8 py-24">
        <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-yellow-300 to-transparent"></div>

        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8 pt-10">
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="absolute inset-0 animate-ping rounded-full bg-foreground/20"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-foreground/10 border-4 border-foreground">
                  <Rocket className="w-14 h-14" />
                </div>
              </div>
            </div>

            <h2
              className="text-center text-5xl font-black text-foreground mb-16 md:text-6xl"
              style={{
                textShadow: "2px 2px 0px rgba(0, 0, 0, 1)",
              }}
            >
              READY TO LEVEL UP?
            </h2>

            <Link to="/auth/register">
              <Button
                size="lg"
                className="group relative border-2 border-foreground bg-foreground text-white px-10 py-10 text-2xl font-black transition-all hover:bg-foreground/90 hover:scale-110 hover:shadow-2xl transform"
                style={{
                  boxShadow: "6px 6px 0px rgba(0,0,0,0.2)",
                }}
              >
                START FREE NOW
                <span className="ml-3 inline-block text-3xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative bg-foreground text-background px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-foreground to-foreground/90"></div>
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-lg font-bold">Powered by Convex & TanStack</p>
          <div className="flex gap-8">
            <a
              href="https://x.com/pena_mo56"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background transition-all  hover:scale-125 transform"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" strokeWidth={2.5} />
            </a>
            <a
              href="https://github.com/pena56"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background transition-all  hover:scale-125 transform"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
