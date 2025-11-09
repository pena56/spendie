import { Camera, Mic, PlusIcon, Type } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import { TransactionFormModal } from "./transaction-form-modal";

export function AddTransactionsButton() {
  const [showManualForm, setShowManualForm] = useState(false);

  return (
    <>
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
    </>
  );
}
