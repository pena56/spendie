import { AmountDisplay } from "./amount-display";

interface SummaryCardProps {
  title: string;
  amount?: number;
  bgColor: string;
  textColor: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount = 0,
  bgColor,
  textColor,
}) => {
  return (
    <div
      className={`${bgColor} border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
    >
      <p className="text-sm font-black uppercase tracking-wide mb-2">{title}</p>
      <p className={`text-2xl font-black ${textColor}`}>
        <AmountDisplay amount={amount} />
      </p>
    </div>
  );
};
