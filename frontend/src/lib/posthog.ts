type PostHogClient = typeof import("posthog-js").default;

let initPromise: Promise<PostHogClient | null> | null = null;

function loadPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key || !import.meta.env.PROD) return Promise.resolve(null);

  return import("posthog-js").then((mod) => {
    const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";
    mod.default.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
    });
    return mod.default;
  });
}

export function initPostHog() {
  initPromise ??= loadPostHog().catch((error: unknown) => {
    console.warn("[posthog] init failed:", error);
    return null;
  });
  return initPromise;
}

type TrackableEvent =
  | { name: "Role Selected"; props: { role: string } }
  | { name: "Section Selected"; props: { section: string; role: string } }
  | { name: "Survey Started"; props: { role: string } }
  | { name: "Survey Completed"; props: { section: string; role: string } };

export function track(event: TrackableEvent) {
  void initPostHog().then((client) => {
    client?.capture(event.name, event.props);
  });
}
