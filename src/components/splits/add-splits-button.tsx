import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { SplitFormModal } from "./splits-form-modal";

export function AddSplitsButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="rounded-full w-14 h-14 fixed bottom-4 right-4 bg-pink-300 hover:bg-pink-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 p-0 flex items-center justify-center"
      >
        <PlusIcon className="text-black" width={30} height={30} />
      </Button>

      <SplitFormModal open={showModal} setOpen={setShowModal} />
    </>
  );
}
