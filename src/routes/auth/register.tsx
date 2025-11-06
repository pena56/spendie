import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showErrorMessage } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

const formSchema = z.object({
  email: z.email().min(1, "A valid email address is required."),
  password: z.string().min(1, "Password is required."),
  flow: z.string(),
});

/**
 * Renders the registration form and handles sign-up via the "password" auth flow.
 *
 * The form validates email and password, displays field-level validation errors, shows a loading state while submitting, attempts authentication with `signIn`, resets the form and navigates to `/dashboard` on success, and displays an error message on failure.
 *
 * @returns The React element for the register route UI.
 */
function RouteComponent() {
  const { signIn } = useAuthActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      flow: "signUp",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      signIn("password", value)
        .then(() => {
          form.reset();
          router.navigate({ to: "/dashboard" });
        })
        .catch((err) => {
          showErrorMessage(err);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
  });

  return (
    <div className="min-h-screen">
      <Card className="w-full sm:max-w-md font-poppins mx-auto">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Register your new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="bug-report-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email address:
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password:</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type="password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            isLoading={isSubmitting}
            type="submit"
            form="bug-report-form"
            className="w-full"
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}