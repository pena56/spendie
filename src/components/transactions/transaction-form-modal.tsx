import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { showErrorMessage } from "@/lib/utils";
import { Doc } from "convex/_generated/dataModel";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  TransactionCategories,
  TransactionCategory,
} from "@/constants/categories";
import { Textarea } from "../ui/textarea";

export type Category = Doc<"transactions">["category"];
export type TransactionType = Doc<"transactions">["type"];
export type TransactionId = Doc<"transactions">["_id"];

export interface DefaultExpenseValue {
  _id: TransactionId;
  amount: number;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  notes?: string;
  date: number;
}

interface TransactionFormModalProps {
  defaultValue?: DefaultExpenseValue;
  open: boolean;
  setOpen: (val: boolean) => void;
}

const transactionCategories: readonly Category[] = TransactionCategories.map(
  (item) => item.name
);
const transactionType: readonly TransactionType[] = ["income", "expense"];

export const formatTimestampForInput = (timestamp: number) => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const formSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0."),
  description: z.string().min(1, "Description is required"),
  notes: z.string(),
  category: z.enum(transactionCategories),
  type: z.enum(transactionType),
  date: z.number().int().positive("Date is required."),
});

export type FormValues = z.infer<typeof formSchema>;

export function TransactionFormModal({
  defaultValue,
  open,
  setOpen,
}: TransactionFormModalProps) {
  const { mutate: addTransaction, isPending: isAddingTransaction } =
    useMutation({
      mutationFn: useConvexMutation(api.transactions.addTransaction),
      onSuccess: () => {
        toast.success("Transaction added successfully");
        setOpen(false);
        form.setFieldValue("amount", 0);
        form.setFieldValue("description", "");
        form.setFieldValue("notes", "");
      },
      onError: (err) => {
        showErrorMessage(err);
      },
    });

  const { mutate: updateTransaction, isPending: isUpdatingTransaction } =
    useMutation({
      mutationFn: useConvexMutation(api.transactions.updateTransaction),
      onSuccess: () => {
        toast.success("Transaction updated successfully");
        setOpen(false);
        form.setFieldValue("amount", 0);
        form.setFieldValue("description", "");
        form.setFieldValue("notes", "");
      },
      onError: (err) => {
        showErrorMessage(err);
      },
    });

  const form = useForm({
    defaultValues: {
      amount: defaultValue?.amount || 0,
      description: defaultValue?.description || "",
      notes: defaultValue?.notes || "",
      category: defaultValue?.category || transactionCategories[0],
      type: defaultValue?.type || transactionType[1],
      date: defaultValue?.date || Date.now(),
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      if (defaultValue) {
        updateTransaction({ _id: defaultValue._id, ...value });
      } else {
        addTransaction(value);
      }
    },
    validators: {
      onChange: formSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {defaultValue ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {defaultValue
              ? "Make changes to your transaction"
              : "Track your income or expenses to earn XP!"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultValue?.type || "expense"}>
          <TabsList className="w-full">
            <TabsTrigger
              value="expense"
              onClick={() => {
                form.setFieldValue("type", "expense");
              }}
              className="data-[state=active]:bg-yellow-300 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:font-bold"
            >
              Expense
            </TabsTrigger>
            <TabsTrigger
              value="income"
              onClick={() => {
                form.setFieldValue("type", "income");
              }}
              className="data-[state=active]:bg-yellow-300 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] data-[state=active]:-translate-x-0.5 data-[state=active]:-translate-y-0.5 data-[state=active]:font-bold"
            >
              Income
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense">
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
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Amount (NGN)</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="text"
                        placeholder="e.g., Lunch at TFC"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="category"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as (typeof transactionCategories)[0]
                          )
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold text-black">
                          {TransactionCategories.filter(
                            (item) => item.type === "expense"
                          ).map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.name}
                              className="flex items-center gap-4"
                            >
                              <cat.icon />

                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="date"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={formatTimestampForInput(field.state.value)}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(new Date(e.target.value).getTime())
                        }
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="notes"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>
                        Note (Optional)
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="Optional note for transaction"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <DialogFooter>
                <Button
                  isLoading={
                    isAddingTransaction ||
                    isUpdatingTransaction ||
                    isUpdatingTransaction
                  }
                  type="submit"
                  className="w-full bg-linear-to-r from-pink-500 to-orange-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
                >
                  {defaultValue ? "Edit" : "Add"} Expense
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="income">
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
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Amount (NGN)</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="text"
                        placeholder="e.g., Lunch at TFC"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="category"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as (typeof transactionCategories)[0]
                          )
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold text-black">
                          {TransactionCategories.filter(
                            (item) => item.type === "income"
                          ).map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              <cat.icon />

                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="date"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={formatTimestampForInput(field.state.value)}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(new Date(e.target.value).getTime())
                        }
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="notes"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      className="leading-none gap-0"
                      data-invalid={isInvalid}
                    >
                      <FieldLabel htmlFor={field.name}>
                        Note (Optional)
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="Optional note for transaction"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <DialogFooter>
                <Button
                  isLoading={isAddingTransaction || isUpdatingTransaction}
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
                >
                  {defaultValue ? "Edit" : "Add"} Income
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
