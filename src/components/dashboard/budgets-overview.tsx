import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { FunctionReturnType } from "convex/server";
import { api } from "convex/_generated/api";
import { Progress } from "../ui/progress";
import { AmountDisplay } from "../amount-display";
import { EmptyState } from "../empty-state";

interface BudgetsOverviewProps {
  data?: FunctionReturnType<typeof api.dashboard.getDashboardData>["budgets"];
}

export default function BudgetsOverview({ data }: BudgetsOverviewProps) {
  const router = useRouter();

  return (
    <div className="border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-black text-xl">Budget Progress</p>

        {data && data?.length > 0 && (
          <Link to="/budgets">
            <Button variant={"link"}>View all</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        {data?.length === 0 ? (
          <EmptyState
            btnLabel="Add budget"
            description="No recent budgets available"
            title="No Budget"
            onBtnClick={() => router.navigate({ to: "/budgets" })}
          />
        ) : (
          data?.map((item) => (
            <BudgetOverviewCard
              key={item._id}
              category={item.category}
              limit={item.limit}
              progress={item.progress}
              spent={item.spent}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface BudgetOverviewCardProps {
  category: string;
  spent: number;
  limit: number;
  progress: number;
}

function BudgetOverviewCard({ ...props }: BudgetOverviewCardProps) {
  if (!props) return null;

  return (
    <div>
      <div className="flex justify-between leading-none">
        <p className="font-bold">{props.category}</p>
        <p className="font-black text-sm">
          <AmountDisplay amount={props.spent} /> /{" "}
          <AmountDisplay amount={props.limit} />
        </p>
      </div>

      <Progress
        value={props.progress >= 100 ? 100 : props.progress}
        indicatorClassName={props.progress > 79 ? "bg-red-400" : "bg-green-400"}
        className="border-2 border-black h-4"
      />
    </div>
  );
}
