import { Edit2, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { TransactionCategories } from "@/constants/categories";
import { Progress } from "../ui/progress";
import { BudgetFormModal } from "./budget-form-modal";
import { useState } from "react";
import { DeleteConfirmationModal } from "../delete-confirmation-modal";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { toast } from "sonner";
import { showErrorMessage } from "@/lib/utils";

export type ActiveBudgets = FunctionReturnType<
  typeof api.budgets.getActiveBudgets
>;

interface BudgetCardProps {
  data?: ActiveBudgets[0];
}

export function BudgetCard({ data }: BudgetCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: deleteBudget, isPending } = useMutation({
    mutationFn: useConvexMutation(api.budgets.deleteBudget),
    onSuccess: () => {
      toast.success("Budget deleted successfully.");
    },
    onError: (e) => {
      showErrorMessage(e);
    },
  });

  if (!data) return null;

  const category = TransactionCategories.find(
    (cat) => cat.name === data.category
  );

  return (
    <div
      className={`flex flex-col space-y-2 bg-linear-to-br ${category?.color} border-2 border-black rounded-sm p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-3 border-black rounded-sm flex items-center justify-center text-3xl">
            {category && <category.icon />}
          </div>
          <div>
            <h3 className="text-xl font-black">{data.category}</h3>
            <p className="text-sm font-bold text-gray-700">
              ${data.spent} / ${data.limit}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => setShowEditModal(true)}
            className="bg-white w-8 h-8 border-2 border-black rounded-sm hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-black" />
          </Button>

          <Button
            onClick={() => setShowDeleteModal(true)}
            className="bg-white w-8 h-8 border-2 border-black rounded-sm hover:bg-gray-50 transition-colors"
          >
            <Trash className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      </div>

      <Progress
        value={data.progress >= 100 ? 100 : data.progress}
        indicatorClassName={data.progress > 79 ? "bg-red-400" : "bg-green-400"}
        className="border-2 border-black h-4"
      />

      <div className="flex items-center justify-between">
        <span className="font-black text-2xl">{data.progress.toFixed(0)}%</span>
        {data.progress > 100 ? (
          <span className="bg-red-500 text-black border-2 border-black rounded-lg px-3 py-1 text-xs font-black">
            OVER BUDGET!
          </span>
        ) : data.progress > 79 ? (
          <span className="bg-orange-400 text-black border-2 border-black rounded-lg px-3 py-1 text-xs font-black">
            NEAR LIMIT
          </span>
        ) : (
          <span className="bg-green-500 text-black border-2 border-black rounded-lg px-3 py-1 text-xs font-black">
            ON TRACK
          </span>
        )}
      </div>

      <BudgetFormModal
        open={showEditModal}
        setOpen={setShowEditModal}
        defaultValue={{
          _id: data._id,
          category: data.category,
          limit: data.limit,
          periodEnd: data.periodEnd,
          periodStart: data.periodStart,
          notes: data.notes,
        }}
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        title="Delete Budget"
        subtitle="Are you sure you want to delete this budget?"
        isDeleting={isPending}
        onConfirm={() => {
          deleteBudget({ budgetId: data._id });
        }}
      />
    </div>
  );
}
