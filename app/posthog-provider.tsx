'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_yQgAEdJJkVpI24NdSRID2mor1x1leRpDoC9yZ9mfXal', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
