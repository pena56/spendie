import { ColumnDef } from "@tanstack/react-table";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { MoreHorizontal, ArrowUpDown, Edit, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionCategories } from "@/constants/categories";
import { formatCurrency, formatDate, showErrorMessage } from "@/lib/utils";
import { useState } from "react";
import { DeleteConfirmationModal } from "../delete-confirmation-modal";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { toast } from "sonner";
import { TransactionFormModal } from "./transaction-form-modal";

type TransactionsResult = FunctionReturnType<
  typeof api.transactions.getTransactions
>;

export type TransactionType = Extract<
  NonNullable<TransactionsResult>,
  unknown[]
> extends (infer T)[]
  ? T
  : NonNullable<TransactionsResult>;

export const columns: ColumnDef<TransactionType>[] = [
  {
    accessorKey: "description",
    header: "DESCRIPTION",
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => {
      const transaction = row.original;
      const category = TransactionCategories?.find(
        (cat) => cat.name === transaction.category
      );

      return (
        <div className="flex items-center gap-2">
          {category && <category.icon width={16} height={16} />}

          {transaction.category}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) {
        return true;
      }

      const rowTimestamp = row.getValue(columnId) as number;

      const rowDate = new Date(rowTimestamp);

      const year = rowDate.getFullYear();
      const month = (rowDate.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is 0-indexed
      const day = rowDate.getDate().toString().padStart(2, "0");

      const rowDateString = `${year}-${month}-${day}`;

      return rowDateString === filterValue;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          DATE
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const transaction = row.original;

      return <div>{formatDate(transaction.date)}</div>;
    },
  },
  {
    accessorKey: "type",
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <div
          className={`text-xs px-1 py-1 rounded-full uppercase flex items-center justify-center ${
            transaction.type === "income" ? "bg-green-300" : "bg-red-300"
          }`}
        >
          {transaction.type}
        </div>
      );
    },
    header: () => {
      return <div className="text-center">TYPE</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">AMOUNT</div>,
    cell: ({ row }) => {
      const transaction = row.original;
      const amount = parseFloat(row.getValue("amount"));

      return (
        <div
          className={`text-right font-medium ${
            transaction.type === "income" ? "text-green-700" : "text-red-700"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [showDeleteModal, setShowDeleteModal] = useState(false);
      const [showEditModal, setShowEditModal] = useState(false);
      const transaction = row.original;

      const { mutate, isPending } = useMutation({
        mutationFn: useConvexMutation(api.transactions.deleteTransaction),
        onSuccess: () => {
          toast.success("Transaction deleted.");
          setShowDeleteModal(false);
        },
        onError: (err) => {
          showErrorMessage(err);
        },
      });

      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(transaction._id)}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash className="text-red-500" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteConfirmationModal
            title="Delete Transaction"
            subtitle="Are you sure you want to delete this transaction?"
            open={showDeleteModal}
            setOpen={setShowDeleteModal}
            onConfirm={() => {
              mutate({ id: transaction._id });
            }}
            isDeleting={isPending}
          />

          <TransactionFormModal
            open={showEditModal}
            setOpen={setShowEditModal}
            defaultValue={{
              _id: transaction._id,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
              description: transaction.description,
              type: transaction.type,
              notes: transaction.notes,
            }}
          />
        </div>
      );
    },
  },
];
