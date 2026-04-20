import type { Metadata } from 'next';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import './globals.css';
import './bones/registry';

export const metadata: Metadata = {
  metadataBase: new URL('https://buildwithfern.com/agent-score'),
  title: 'Agent Score | Is Your Documentation AI-Ready?',
  description:
    'AI agents can\'t use docs they can\'t read. Run 22 checks and get a letter grade in seconds.',
  openGraph: {
    title: 'Agent Score | Is Your Documentation AI-Ready?',
    description:
      'AI agents can\'t use docs they can\'t read. Run 22 checks and get a letter grade in seconds.',
    type: 'website',
    images: [{ url: 'https://buildwithfern.com/agent-score/agent-score-og.png', width: 1200, height: 630, alt: 'Agent Score' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/agent-score/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/agent-score/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script
          id="posthog-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="Ir init Br Zr Ci jr $r Lr capture calculateEventProperties Yr register register_once register_for_session unregister unregister_for_session Jr getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Kr identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Wr zr createPersonProfile setInternalOrTestUser Xr Or en opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Vr debug ki Gr getPageViewId captureTraceFeedback captureTraceMetric Nr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_yQgAEdJJkVpI24NdSRID2mor1x1leRpDoC9yZ9mfXal', {
              api_host: 'https://us.i.posthog.com',
              defaults: '2026-01-30',
              person_profiles: 'identified_only',
            })`,
          }}
        />
        <div className="page-shell">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
