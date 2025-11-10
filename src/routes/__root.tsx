import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";

import appCss from "../styles.css?url";

export const Route = wrapCreateRootRouteWithSentry(createRootRouteWithContext)<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Spendie",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster
          duration={5000}
          position="top-center"
          theme="light"
          richColors
          style={{
            fontFamily: "Space Grotesk",
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
