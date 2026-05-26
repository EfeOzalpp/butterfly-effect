import posthog from "posthog-js";

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";
  if (!key || !import.meta.env.PROD) return;

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
}

type TrackableEvent =
  | { name: "Role Selected"; props: { role: string } }
  | { name: "Section Selected"; props: { section: string; role: string } }
  | { name: "Survey Started"; props: { role: string } }
  | { name: "Survey Completed"; props: { section: string; role: string } };

export function track(event: TrackableEvent) {
  posthog.capture(event.name, event.props);
}
