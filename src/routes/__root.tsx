import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppErrorComponent } from "@/lib/error-component";
import appCss from "../styles.css?url";

const APP_NAME = "Lighthill Studio";

function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[70dvh] flex-col items-center justify-center bg-bg px-6 pt-32 text-center text-fg"
    >
      <p className="text-xs tracking-[0.2em] text-fg-muted uppercase">404</p>
      <h1 className="mt-4 font-display text-headline">
        This page has left the frame.
      </h1>
      <Link
        to="/"
        className="mt-8 text-sm tracking-[0.14em] uppercase underline underline-offset-4"
      >
        Back to the studio
      </Link>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "In-house photography and a rentable cyclorama studio in Lawrenceville, Georgia — just outside Atlanta.",
      },
      { name: "theme-color", content: "#0c0b0a" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Outfit:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: RootComponent,
  errorComponent: AppErrorComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg font-sans text-fg">
        <PreviewHostBridge />
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:bg-paper focus-visible:px-4 focus-visible:py-2 focus-visible:text-ink"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Header />
          <Outlet />
          <Footer />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
