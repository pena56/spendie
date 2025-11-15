import { z } from "zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { Doc } from "convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { showErrorMessage } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { AmountDisplay } from "../amount-display";

export type SplitBillId = Doc<"splitBills">["_id"];

interface SettleSplitModalProps {
  splitId: SplitBillId;
  amountLeft: number;
}

export function SettleSplitModal({
  splitId,
  amountLeft,
}: SettleSplitModalProps) {
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    amount: z
      .number()
      .min(1, "Amount must be greater than 0.")
      .max(amountLeft, `Amount cannot be more than ${amountLeft}`),
  });

  type FormValues = z.infer<typeof formSchema>;

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.splits.settleParticipantShare),
    onSuccess: () => {
      toast.success("Transaction added successfully");
      setOpen(false);
      form.reset();
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const form = useForm({
    defaultValues: {
      amount: amountLeft,
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      mutate({ ...value, splitId });
    },
    validators: {
      onChange: formSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-sm px-4 py-2 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2">
          <Send className="w-4 h-4" />
          SETTLE UP
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Settle Split
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            Pay up your share of this split bill.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="amount"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Amount (<AmountDisplay onlyCurrency />)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <DialogFooter>
            <Button
              isLoading={isPending}
              type="submit"
              className="w-full bg-linear-to-r from-pink-500 to-orange-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
            >
              Settle Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
