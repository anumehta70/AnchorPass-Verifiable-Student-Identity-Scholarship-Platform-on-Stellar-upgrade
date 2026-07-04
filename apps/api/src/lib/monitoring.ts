import * as Sentry from "@sentry/node";
import { PostHog } from "posthog-node";

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn("[monitoring] SENTRY_DSN not set — Sentry disabled");
    return;
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.2,
  });
}

let posthog: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (posthog) return posthog;
  if (!process.env.POSTHOG_API_KEY) {
    console.warn("[monitoring] POSTHOG_API_KEY not set — analytics disabled");
    return null;
  }
  posthog = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
  });
  return posthog;
}

export function track(event: string, distinctId: string, properties?: Record<string, unknown>) {
  const client = getPostHog();
  client?.capture({ distinctId, event, properties });
}
