import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
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
import { AmountDisplay } from "../amount-display";
import { ParticipantCombobox } from "./participants-combo-box";
import { Trash } from "lucide-react";
import { Slider } from "../ui/slider";

export type Category = Doc<"budgets">["category"];
export type BudgetId = Doc<"budgets">["_id"];

export interface DefaultSplitsValue {
  _id: BudgetId;
  limit: number;
  category: TransactionCategory;
  notes?: string;
  periodStart: number;
  periodEnd: number;
}

interface SplitsFormModalProps {
  defaultValue?: DefaultSplitsValue;
  open: boolean;
  setOpen: (val: boolean) => void;
}

const categories: readonly Category[] = TransactionCategories.filter(
  (c) => c.type === "expense"
).map((item) => item.name);

export const formatTimestampForInput = (timestamp: number) => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  totalAmount: z.number().min(1, "Total amount must be greater than 0."),
  category: z.enum(categories),
  notes: z.string(),
  date: z.number().int().positive("Date is required."),
  participants: z
    .array(
      z.object({
        userId: z.string().min(1, "User is required"),
        name: z.string(),
        sharePercentage: z
          .number()
          .min(1, "Share percentage must be at least 1")
          .max(100, "Share percentage must be at most 100"),
      })
    )
    .min(1, "At least one participant is required")
    .refine(
      (participants) => {
        const totalShare = participants.reduce(
          (sum, p) => sum + p.sharePercentage,
          0
        );
        return totalShare === 100;
      },
      {
        message: "The sum of all share percentages must equal 100%",
      }
    ),
});

export type FormValues = z.infer<typeof formSchema>;

export function SplitFormModal({
  defaultValue,
  open,
  setOpen,
}: SplitsFormModalProps) {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  const { mutate: createSplit, isPending: isCreatingSplit } = useMutation({
    mutationFn: useConvexMutation(api.splits.createSplit),
    onSuccess: () => {
      toast.success("Split Bill created successfully");
      setOpen(false);
      form.setFieldValue("totalAmount", 0);
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
      description: "",
      totalAmount: 0,
      notes: "",
      category: categories[0],
      date: Date.now(),
      participants: [
        {
          sharePercentage: 100,
          userId: user?._id || "",
          name: user?.name || "",
        },
      ],
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      //   if (defaultValue) {
      //     updateBudget({ _id: defaultValue._id, ...value });
      //   } else {
      // @ts-ignore
      createSplit(value);
      //   }
    },
    validators: {
      onChange: formSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[525px] max-h-[calc(100%-40px)] border-2 border-black rounded-sm overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {defaultValue ? "Edit Split Bill" : "Create Split Bill"}
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {defaultValue
              ? "Make changes to your bill"
              : "Split expenses with friends and family"}
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
            name="description"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
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
                    placeholder="e.g: Monthly rent"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="totalAmount"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Total Amount (<AmountDisplay onlyCurrency />)
                    </FieldLabel>
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
              name="date"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Payment Deadline
                    </FieldLabel>
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
            name="category"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as (typeof categories)[0])
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

          <form.Field
            name="participants"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field className="leading-none gap-2" data-invalid={isInvalid}>
                  <div className="flex w-full items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Participants</FieldLabel>

                    <Button
                      variant={"outline"}
                      type="button"
                      size={"sm"}
                      onClick={() => {
                        form.setFieldValue(
                          "participants",
                          (currentParticipants) => {
                            if (!currentParticipants?.length)
                              return currentParticipants;

                            const count = currentParticipants.length;

                            const baseShare = Math.floor(100 / count);

                            let remainder = 100 % count;

                            return currentParticipants.map((participant) => {
                              const share = baseShare + (remainder > 0 ? 1 : 0);
                              remainder--;

                              return {
                                ...participant,
                                sharePercentage: share,
                              };
                            });
                          }
                        );
                      }}
                    >
                      Split Evenly
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {form.getFieldValue("participants")?.map((item, index) => (
                      <div
                        className="space-y-2 border-2 border-black rounded-sm p-2"
                        key={item?.userId}
                      >
                        <div className="flex items-center justify-between">
                          <p>
                            {item.name} (
                            <AmountDisplay
                              amount={
                                (item.sharePercentage / 100) *
                                form.getFieldValue("totalAmount")
                              }
                            />
                            )
                          </p>
                          {item?.userId !== user?._id && (
                            <Button
                              onClick={() => {
                                form.setFieldValue("participants", (prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              type="button"
                              size={"sm"}
                              variant={"destructive"}
                            >
                              <Trash />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center justify-between space-x-4">
                          <Slider
                            value={[item.sharePercentage || 0]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => {
                              form.setFieldValue(
                                `participants[${index}].sharePercentage`,
                                vals[0]
                              );
                            }}
                          />
                          <p className="w-12 text-right">
                            {item.sharePercentage || 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <ParticipantCombobox
                    onParticipantSelect={(participant) => {
                      const newParticipant = {
                        userId: participant.userId,
                        sharePercentage: 0,
                        name: participant.name || "",
                      };

                      const prevParticipants =
                        form.getFieldValue("participants");

                      const values = prevParticipants?.find(
                        (user) => user?.userId === newParticipant?.userId
                      )
                        ? prevParticipants
                        : [...prevParticipants, newParticipant];

                      form.setFieldValue("participants", values);
                    }}
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                <Field className="leading-none gap-0" data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Note (Optional)</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder="Optional note for split bill"
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
              isLoading={isCreatingSplit || isUpdatingBudget}
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-600 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
            >
              {defaultValue ? "Edit" : "Add"} Split Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
