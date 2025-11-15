import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { showErrorMessage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useConvexAction } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useRouter } from "@tanstack/react-router";

export const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type FormValues = z.infer<typeof formSchema>;

export function DeleteAccountModal() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexAction(api.user.deleteAccount),
    onSuccess: () => {
      toast.success("Account deleted successfully!");
      setOpen(false);
      form.reset();
      router.navigate({ to: "/auth/login" });
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      mutate(value);
    },
    validators: {
      onChange: formSchema,
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"destructive"} size={"lg"} className="font-black">
            Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-center text-black font-medium text-base">
              Are you sure you want to delete your account? This action cannot
              be reversed
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
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Enter your account password to proceed
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="current-password"
                      type="password"
                      placeholder="Your Password"
                      disabled={isPending}
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
                type="submit"
                isLoading={isPending}
                className="w-full bg-red-600 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-white"
              >
                Delete Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
