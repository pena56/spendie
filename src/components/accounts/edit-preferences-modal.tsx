import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { showErrorMessage } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CurrencyArray, LocalesArray } from "@/constants/currency";

export const formatTimestampForInput = (timestamp: number) => {
  return new Date(timestamp).toISOString().split("T")[0];
};

export const formSchema = z.object({
  currency: z.string().min(1, "Currency is always required"),
  locale: z.string().min(1, "Locale is always required"),
});

function formatCurrency({
  currency,
  locale,
}: {
  locale?: string;
  currency?: string;
}): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  });
  return formatter.format(10000);
}

export type FormValues = z.infer<typeof formSchema>;

export function EditPreferencesModal() {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.user.updateUserInfo),
    onSuccess: () => {
      toast.success("Preferences updated successfully");
      setOpen(false);
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      currency: user?.currency || "",
      locale: user?.locale || "",
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      mutate(value);
    },
    validators: {
      onChange: formSchema,
    },
  });

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-orange-300 text-black hover:bg-orange-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Edit Your Preferences
            </DialogTitle>
            <DialogDescription className="text-center text-black font-medium text-base">
              Customize how currency is displayed.
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
            <form.Subscribe
              selector={(state) => ({
                locale: state.values.locale,
                currency: state.values.currency,
              })}
              children={({ currency, locale }) => {
                return (
                  <p className="text-center font-black text-2xl">
                    {formatCurrency({ currency, locale })}
                  </p>
                );
              }}
            />

            <form.Field
              name="locale"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>Locale</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                      >
                        <SelectValue placeholder="Select your locale" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold text-black">
                        {LocalesArray.map((cat, index) => (
                          <SelectItem
                            key={`${cat.region}-${index}`}
                            value={cat.locale}
                            className="flex items-center gap-4"
                          >
                            {cat.locale}
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
              name="currency"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                      >
                        <SelectValue placeholder="Select your currency" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold text-black">
                        {CurrencyArray.map((cat, index) => (
                          <SelectItem
                            key={`${cat.region}-${index}`}
                            value={cat.currency}
                            className="flex items-center gap-4"
                          >
                            {cat.currency}
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

            <DialogFooter>
              <Button
                type="submit"
                isLoading={isPending}
                className="w-full bg-linear-to-r from-pink-500 to-orange-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
