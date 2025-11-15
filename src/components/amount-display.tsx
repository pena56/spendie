import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

export const AmountDisplay = ({
  amount,
  onlyCurrency,
}: {
  amount?: number;
  onlyCurrency?: boolean;
}) => {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));
  const currency = user?.currency || "USD";
  const locale = user?.locale || navigator.language;

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

  if (onlyCurrency)
    return <span className="w-fit leading-none">{currency}</span>;

  return <span className="w-fit leading-none">{formatted}</span>;
};
