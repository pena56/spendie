interface Greeting {
  id: number;
  greeting: string;
  motivation: string;
}

export const greetings: Greeting[] = [
  {
    id: 1,
    greeting: "HEY THERE, CHAMP!",
    motivation: "Let's crush those money goals today",
  },
  {
    id: 2,
    greeting: "RISE AND GRIND!",
    motivation: "Your wallet will thank you later",
  },
  {
    id: 3,
    greeting: "HELLO, FINANCIAL WIZARD!",
    motivation: "Time to sprinkle some money magic",
  },
  {
    id: 4,
    greeting: "WHAT'S UP, BUDGET BOSS?",
    motivation: "Let's make every penny count",
  },
  {
    id: 5,
    greeting: "AHOY, SAVINGS SAILOR!",
    motivation: "Navigate those financial seas like a pro",
  },
  {
    id: 6,
    greeting: "BOOM! YOU'RE HERE!",
    motivation: "Ready to level up your finances?",
  },
  {
    id: 7,
    greeting: "HELLO, MONEY MAVERICK!",
    motivation: "Let's outsmart those expenses",
  },
  {
    id: 8,
    greeting: "YO, PENNY PINCHER!",
    motivation: "Small wins lead to big gains",
  },
  {
    id: 9,
    greeting: "WHAT'S GOOD, CASH KING?",
    motivation: "Rule your spending empire",
  },
  {
    id: 10,
    greeting: "HEY BEAUTIFUL, IT'S BUDGET DAY!",
    motivation: "Let's make it a financial masterpiece",
  },
  {
    id: 11,
    greeting: "SURPRISE! IT'S YOU!",
    motivation: "Time to check on those goals",
  },
  {
    id: 12,
    greeting: "GREETINGS, SAVINGS SENSEI!",
    motivation: "Share your wisdom with your wallet",
  },
  {
    id: 13,
    greeting: "HELLO FROM THE MONEY SIDE!",
    motivation: "We've been waiting for you",
  },
  {
    id: 14,
    greeting: "CAN WE GET A CHEER?",
    motivation: "You're doing amazing, seriously",
  },
  {
    id: 15,
    greeting: "TODAY'S YOUR DAY!",
    motivation: "Let's make financial dreams a reality",
  },
];

export const getDailyGreeting = (): Greeting => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return greetings[dayOfYear % greetings.length];
};
