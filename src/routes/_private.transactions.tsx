import Layout from "@/components/layout";
import { columns } from "@/components/transactions/columns";
import { DataTable } from "@/components/transactions/data-table";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import {
  Camera,
  Mic,
  PlusIcon,
  TrendingDown,
  TrendingUp,
  Type,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_private/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: transactions } = useQuery(
    convexQuery(api.transactions.getTransactions, {})
  );
  const [showManualForm, setShowManualForm] = useState(false);

  return (
    <Layout title="Transactions">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-lime-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-start justify-between">
            <p className="text-sm font-black uppercase tracking-wide">Income</p>
            <div className="bg-white border-2 border-black rounded-full p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black">$4,825</p>
          <p className="text-sm font-bold text-green-700">
            +12% from last month
          </p>
        </div>

        <div className="bg-pink-200 border-2 border-black rounded-sm p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-start justify-between">
            <p className="text-sm font-black uppercase tracking-wide">
              Expense
            </p>
            <div className="bg-white border-2 border-black rounded-full p-2">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black">$4,825</p>
          <p className="text-sm font-bold text-red-700">+12% from last month</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={Array.isArray(transactions) ? transactions : []}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full w-14 h-14 fixed bottom-4 right-4 bg-yellow-300 hover:bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 p-0 flex items-center justify-center">
            <PlusIcon className="text-black" width={30} height={30} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          className="w-fit bg-white/10 backdrop-blur-sm border-none shadow-none"
        >
          <DropdownMenuItem
            onClick={() => setShowManualForm(true)}
            className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer hover:bg-blue-50 rounded justify-end"
          >
            <span className="font-medium text-sm">Manual Input</span>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]">
              <Type className="text-black" width={22} height={22} />
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer hover:bg-blue-50 rounded justify-end">
              <span className="font-medium text-sm">Speech Input</span>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]">
                <Mic className="text-black" width={22} height={22} />
              </div>
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer hover:bg-blue-50 rounded justify-end">
              <span className="font-medium text-sm">Scan Receipt/Invoice</span>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]">
                <Camera className="text-black" width={22} height={22} />
              </div>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionFormModal open={showManualForm} setOpen={setShowManualForm} />
    </Layout>
  );
}
