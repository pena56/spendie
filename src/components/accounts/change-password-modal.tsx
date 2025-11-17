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

export const formSchema = z.object({
  oldPassword: z.string().min(1, "Old Password is required"),
  newPassword: z.string().min(8, "New Password must be at least 8 characters"),
});

export type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordModal() {
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexAction(api.user.changePassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setOpen(false);
      form.reset();
    },
    onError: (err) => {
      showErrorMessage(err);
    },
  });

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
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
          <Button variant={"secondary"} size={"lg"} className="font-black">
            Change Password
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Change your password
            </DialogTitle>
            <DialogDescription className="text-center text-black font-medium text-base">
              Create a new password.
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
              name="oldPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>Old Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="current-password"
                      type="password"
                      placeholder="Your Old Password"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className="leading-none gap-0"
                    data-invalid={isInvalid}
                  >
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      type="password"
                      placeholder="Your New Password"
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
                className="w-full bg-linear-to-r from-pink-500 to-orange-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black"
              >
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
