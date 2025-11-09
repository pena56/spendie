"use client";

import { useState } from "react";

const FINANCIAL_TIPS = [
  {
    title: "💰 Savings Tip",
    content:
      "Try the 50/30/20 rule: spend 50% on needs, 30% on wants, and save 20% of your income.",
  },
  {
    title: "💳 Spending Tip",
    content:
      "Wait 24 hours before making non-essential purchases. This helps avoid impulse buying!",
  },
  {
    title: "📊 Budgeting Tip",
    content:
      "Track your expenses daily. Small purchases add up quickly, and awareness is key to control.",
  },
  {
    title: "🎯 Savings Tip",
    content:
      "Automate your savings by setting up automatic transfers on payday. Out of sight, out of mind!",
  },
  {
    title: "💡 Spending Tip",
    content:
      "Use the envelope method: allocate cash to different spending categories for better control.",
  },
  {
    title: "📈 Budgeting Tip",
    content:
      "Review your budget monthly and adjust categories based on your actual spending patterns.",
  },
  {
    title: "🏦 Savings Tip",
    content:
      "Start an emergency fund with 3-6 months of living expenses. This prevents debt in tough times.",
  },
  {
    title: "🛒 Spending Tip",
    content:
      "Unsubscribe from marketing emails. You can't spend money on things you don't know about!",
  },
];

export function LoadingScreen() {
  const [tip] = useState<(typeof FINANCIAL_TIPS)[0] | null>(
    FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)]
  );

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center max-w-md w-full space-y-12">
        {/* SPENDIE Logo */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            {/* Animated logo container */}
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-yellow-300 to-amber-400 shadow-lg flex items-center justify-center animate-pulse">
              <div className="text-5xl font-bold text-white">$</div>
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-yellow-400 border-r-yellow-300 animate-spin" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            SPENDIE
          </h1>
          <p className="text-gray-600 text-center text-lg font-medium">
            Loading your finances...
          </p>
        </div>

        {/* Animated loading bars */}
        <div className="w-full space-y-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full animate-[shimmer_2s_infinite] w-full" />
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full animate-[shimmer_2s_infinite_0.4s] w-3/4" />
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400 rounded-full animate-[shimmer_2s_infinite_0.8s] w-1/2" />
          </div>
        </div>

        {/* Financial Tip Section */}
        {tip && (
          <div className="w-full bg-white rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 p-6 border-2 border-gray-900 space-y-3 animate-fade-in">
            <div className="text-lg font-bold text-gray-900">{tip.title}</div>
            <p className="text-gray-700 leading-relaxed text-sm">
              {tip.content}
            </p>
            <div className="pt-2 text-xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              Tip of the moment
            </div>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
