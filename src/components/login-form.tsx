import { useRouter } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { Navbar } from "./navbar";
import { PiggyBank } from "lucide-react";

const formSchema = z.object({
  email: z.email().min(1, "A valid email address is required."),
  password: z.string().min(1, "Password is required."),
  flow: z.string(),
});

export function LoginForm() {
  const { signIn } = useAuthActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      flow: "signIn",
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
    <div className="min-h-screen bg-yellow-300">
      <Navbar />

      <div className="mx-auto flex max-w-md items-center justify-center pt-20 px-4">
        <Card
          className="w-full animate-fade-in rounded-sm border-2 border-foreground bg-background p-8 px-4 md:p-10"
          style={{ boxShadow: "6px 6px 0px rgba(0,0,0,0.2)" }}
        >
          <CardHeader>
            <div className=" text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex items-center justify-center">
                  <PiggyBank className="w-7 h-7 text-black" />
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter">
                  SPENDIE
                </h1>
              </div>
              <h2
                className="text-3xl font-black text-foreground"
                style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 1)" }}
              >
                WELCOME BACK!
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <form
              id="login-form"
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
                      <Field
                        data-invalid={isInvalid}
                        className="flex flex-col gap-0"
                      >
                        <FieldLabel
                          htmlFor={field.name}
                          className="uppercase font-black text-lg"
                        >
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
                          placeholder="Enter your email address"
                          className="text-lg font-black h-10"
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
                      <Field
                        data-invalid={isInvalid}
                        className="flex flex-col gap-0"
                      >
                        <FieldLabel
                          htmlFor={field.name}
                          className="uppercase font-black text-lg"
                        >
                          Password:
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          type="password"
                          placeholder="Enter your password"
                          className="text-lg font-black h-10"
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
          <CardFooter className="mt-5">
            <Button
              isLoading={isSubmitting}
              type="submit"
              form="login-form"
              className="h-14 w-full font-black text-lg border-2 border-foreground/20 hover:scale-105 transition-all "
              style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
