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
import {
  TransactionCategories,
  TransactionCategory,
} from "@/constants/categories";
import { Textarea } from "../ui/textarea";

export type Category = Doc<"budgets">["category"];
export type BudgetId = Doc<"budgets">["_id"];

export interface DefaultBudgetValue {
  _id: BudgetId;
  limit: number;
  category: TransactionCategory;
  notes?: string;
  periodStart: number;
  periodEnd: number;
}

interface BudgetFormModalProps {
  defaultValue?: DefaultBudgetValue;
  open: boolean;
  setOpen: (val: boolean) => void;
}

const budgetCategories: readonly Category[] = TransactionCategories.filter(
  (item) => item.type === "expense"
).map((item) => item.name);

export const formatTimestampForInput = (timestamp: number) => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const formSchema = z
  .object({
    limit: z.number().min(1, "Amount must be greater than 0."),
    notes: z.string(),
    category: z.enum(budgetCategories),
    periodStart: z.number().int().positive("Start date is required."),
    periodEnd: z.number().int().positive("End date is required."),
  })
  .refine((data) => data.periodEnd > data.periodStart, {
    message: "End date must be after start date.",
    path: ["periodEnd"],
  })
  .refine((data) => data.periodEnd - data.periodStart >= 86400000, {
    message: "Budget period must be at least 1 day long.",
    path: ["periodEnd"],
  });

export type FormValues = z.infer<typeof formSchema>;

export function BudgetFormModal({
  defaultValue,
  open,
  setOpen,
}: BudgetFormModalProps) {
  const { mutate: addBudget, isPending: isAddingBudget } = useMutation({
    mutationFn: useConvexMutation(api.budgets.createBudget),
    onSuccess: () => {
      toast.success("Budget created successfully");
      setOpen(false);
      form.setFieldValue("limit", 0);
      form.setFieldValue("notes", "");
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const { mutate: updateBudget, isPending: isUpdatingBudget } = useMutation({
    mutationFn: useConvexMutation(api.budgets.updateBudget),
    onSuccess: () => {
      toast.success("Budget updated successfully");
      setOpen(false);
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const form = useForm({
    defaultValues: {
      limit: defaultValue?.limit || 0,
      notes: defaultValue?.notes || "",
      category: defaultValue?.category || budgetCategories[0],
      periodStart: defaultValue?.periodStart || Date.now(),
      periodEnd: defaultValue?.periodEnd || Date.now(),
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      if (defaultValue) {
        updateBudget({ _id: defaultValue._id, ...value });
      } else {
        addBudget(value);
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
            {defaultValue ? "Edit Budget" : "Add Budget"}
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {defaultValue
              ? "Make changes to your budget"
              : "Set limits and track your spending"}
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
            name="limit"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Budget Limit (NGN)
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

          <form.Field
            name="category"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Budget Category</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as (typeof budgetCategories)[0])
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <div className="w-full flex space-x-4">
            <form.Field
              name="periodStart"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
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
              name="periodEnd"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>End Date</FieldLabel>
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
          </div>

          <form.Field
            name="notes"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Note (Optional)</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder="Optional note for transaction"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <DialogFooter>
            <Button
              isLoading={isAddingBudget || isUpdatingBudget}
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-600 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
            >
              {defaultValue ? "Edit" : "Add"} Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
