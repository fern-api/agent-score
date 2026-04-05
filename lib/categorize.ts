export const CATEGORIES = [
  'AI/ML',
  'Business',
  'Cloud Infra',
  'Communication',
  'DevTools',
  'Ecommerce',
  'Infrastructure',
  'Payments',
  'Voice AI',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Ordered list of category patterns — first match wins.
// Each pattern is tested against a combined string of:
//   "{hostname} {company name}" (lowercased)
// ---------------------------------------------------------------------------

const PATTERNS: Array<{ category: Category; pattern: RegExp }> = [
  // Voice AI — check before AI/ML to avoid misclassification
  {
    category: 'Voice AI',
    pattern:
      /\b(elevenlabs|deepgram|assemblyai|whisper|murf|lovo|wellsaid|resemble|speechify|descript|play\.ht|playht|tortoise|bark|coqui|cartesia|hume|rime\.zone|ultravox|bland\.ai|vapi|retell|hamming|voice\s*ai|voice\s*clone|text.to.speech|speech.to.text|tts\b|stt\b|transcription\s*api)\b/i,
  },

  // AI/ML — LLM providers, ML infra, vector DBs, AI platforms
  {
    category: 'AI/ML',
    pattern:
      /\b(openai|anthropic|claude\b|cohere|huggingface|hugging.face|replicate|togetherai|together\.ai|mistral|groq|perplexity|pinecone|weaviate|chromadb|chroma\.tech|qdrant|milvus|langchain|llamaindex|llama.?index|mem0|roboflow|clearml|wandb|neptune\.ai|haystack|stability\.ai|stabilityai|midjourney|runway|leonardo\.ai|leonardoai|fireworks\.ai|fireworksai|anyscale|modal\.com|runpod|banana\.dev|baseten|beam\.cloud|inferless|octoai|lepton|deepinfra|novita|cerebras|ai21|aleph.?alpha|xai\.com|grok|gemini|vertex\.ai|bedrock|sagemaker|mlflow|bentoml|ray\.io|dstack|flyte|zenml|metaflow|prefect|dagster|airflow|mlops|llmops|vector\s*db|embedding|fine.?tun|model\s*serv|inference\s*api|ai\s*platform|machine\s*learn|deep\s*learn)\b/i,
  },

  // Payments & Fintech
  {
    category: 'Payments',
    pattern:
      /\b(stripe|paypal|square\b|braintree|adyen|checkout\.com|klarna|affirm|plaid|finix|rapyd|nuvei|payoneer|wise\.com|transferwise|paystack|flutterwave|razorpay|payu\b|worldpay|authorize\.net|paysafe|polar\.sh|payabli|bill\.com|deel\b|lemon\.?squeezy|paddle\.com|chargebee|recurly|chargify|maxio|zuora|patreon|gumroad|mercadopago|payme|payment|billing\s*api|invoice\s*api|subscription\s*api|merchant\s*api|payout|acquir|issuing\s*api)\b/i,
  },

  // Communication — email, SMS, push, chat
  {
    category: 'Communication',
    pattern:
      /\b(twilio|sendgrid|mailgun|postmark|resend\.com|sparkpost|mailchimp|sendbird|stream\.io|pusher|ably|onesignal|braze|iterable|klaviyo|courier\.com|novu\b|knock\.app|courier|sinch|vonage|messagebird|bandwidth\.com|telnyxcom|telnyx|plivo|ringcentral|livekit|agora\.io|daily\.co|100ms|metered|getstream|chatkit|cometchat|msg91|bird\.com|messagebird|email\s*api|sms\s*api|messaging\s*api|notification\s*api|push\s*notif|chat\s*api|inbox\s*api)\b/i,
  },

  // Cloud Infra — managed cloud services, databases, storage, CDN
  {
    category: 'Cloud Infra',
    pattern:
      /\b(cloudflare|supabase|upstash|planetscale|neon\.tech|neondb|turso\b|xata\b|fly\.io|railway\.app|render\.com|heroku|linode|digitalocean|vultr|hetzner|aiven|cockroachdb|cockroach\s*labs|tidb|singlestore|fauna\b|deno\s*deploy|deno\s*kv|liveblocks|convex\.dev|appwrite|pocketbase|backendless|parse\b|firebase|cloudinary|imgix|bunnycdn|fastly|akamai|cloudfront|s3\s*compat|object\s*storage|managed\s*postgres|managed\s*redis|serverless\s*db)\b/i,
  },

  // DevTools — developer tooling, observability, API tooling, CI/CD
  {
    category: 'DevTools',
    pattern:
      /\b(fern\b|mintlify|readme\.com|readmeio|gitbook|docusaurus|storybook|eslint|prettier|jest\b|vitest|playwright|cypress|sentry|datadog|grafana|prometheus|posthog|mixpanel|segment\.com|amplitude|logrocket|bugsnag|rollbar|launchdarkly|splitio|statsig|growthbook|jfrog|jenkins|circleci|github\s*actions|gitlab|bitbucket|linear\b|jira\b|rootly|pagerduty|opsgenie|incident\.io|honeycomb|lightstep|new\s*relic|dynatrace|elastic|kibana|logstash|vector\.dev|opentelemetry|otel|jaeger|zipkin|alloy|loki\b|tempo\b|faro|backstage|port\.io|cortex\.io|configure8|architect\.io|swaggerhub|stoplight|apicurio|specmatic|pact\b|hoppscotch|insomnia|postman|bruno\b|httpie|apidog|openapi|api\s*generat|sdk\s*generat|ci\/?cd|devops\s*platform|observ|monitor\s*api|log\s*manag|error\s*track)\b/i,
  },

  // Ecommerce
  {
    category: 'Ecommerce',
    pattern:
      /\b(shopify|woocommerce|magento|bigcommerce|commercetools|salsify|akeneo|crystallize|medusajs|medusa\b|nacelle|recharge|bold\s*commerce|gorgias|yotpo|loop\s*returns|returnly|avalara|taxjar|shipbob|shipstation|easyship|aftership|shippo|sendcloud|ingrid\b|netsuite|brightpearl|linnworks|skubana|ecommerce|e.commerce|product\s*catalog|inventory\s*api|order\s*api|fulfillment\s*api|cart\s*api|checkout\s*api)\b/i,
  },

  // Business — CRM, ERP, HR, identity, productivity
  {
    category: 'Business',
    pattern:
      /\b(salesforce|hubspot|zendesk|freshdesk|freshworks|intercom|drift\b|calendly|docusign|pandadoc|airtable|coda\.io|notion\b|asana|monday\.com|clickup|workos|okta|auth0|jumpcloud|rippling|gusto|bamboohr|workday|sap\b|oracle\b|dynamics|zoho|pipedrive|copper\b|close\.com|attio|affinity\b|apollo\.io|outreach\b|salesloft|gong\.io|chorus\.ai|loom\b|miro\b|figma\b|canva|zapier|make\.com|tray\.io|workato|boomi\b|mulesoft|celigo|crm\b|erp\b|hris\b|sso\b|saml\b|identity\s*provider|access\s*manag|workflow\s*automat|no.code|low.code|business\s*automat)\b/i,
  },

  // Infrastructure — containers, orchestration, networking, message queues
  {
    category: 'Infrastructure',
    pattern:
      /\b(kubernetes|k8s\b|docker\b|terraform|ansible|puppet\b|chef\b|nginx|apache\b|istio|envoy\b|linkerd|consul|vault\b|nomad\b|packer|waypoint|cilium|calico|helm\b|kustomize|argocd|fluxcd|tekton|knative|dapr\b|temporal\.io|zeromq|kafka\b|rabbitmq|pulsar\b|nats\b|mosquitto|grpc\b|protobuf|graphql\b|opentelemetry|service\s*mesh|container\s*orchest|cluster\s*manag|infra\s*as\s*code|iac\b|gitops|platform\s*engineer|internal\s*developer\s*platform)\b/i,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fast, offline pattern-match. Returns undefined if nothing matched
 * (so the caller can decide whether to escalate to the LLM).
 */
function matchPatterns(docsUrl: string, name?: string): Category | undefined {
  let hostname = '';
  try {
    hostname = new URL(docsUrl).hostname.replace(/^www\./, '');
  } catch {
    hostname = docsUrl;
  }

  const haystack = `${hostname} ${name ?? ''}`.toLowerCase();

  for (const { category, pattern } of PATTERNS) {
    if (pattern.test(haystack)) return category;
  }
}

/**
 * Ask Claude to classify the company when pattern-matching returns nothing.
 * Requires OPENAI_API_KEY in the environment.
 * Returns null on any failure so the caller can fall back gracefully.
 */
async function inferCategoryWithLLM(
  docsUrl: string,
  name?: string,
): Promise<Category | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are classifying a company's API/developer documentation site into exactly one category.

Company name: ${name ?? '(unknown)'}
Docs URL: ${docsUrl}

Categories (pick exactly one):
${CATEGORIES.map((c) => `- ${c}`).join('\n')}

Rules:
- Use "Other" only if the company genuinely doesn't fit any of the above.
- Reply with ONLY the category name, nothing else.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 16,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn('[categorize] OpenAI API error:', res.status);
      return null;
    }

    const data = await res.json();
    const raw = (data?.choices?.[0]?.message?.content ?? '').trim();
    const match = CATEGORIES.find(
      (c) => c.toLowerCase() === raw.toLowerCase(),
    );
    return match ?? null;
  } catch (err) {
    console.warn('[categorize] LLM call failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Infer a category for a docs URL + company name.
 * 1. Fast pattern match — if it hits, return immediately (no API call).
 * 2. Ask GPT-4o mini if patterns don't match.
 * 3. Fall back to 'Other' if the API call fails or is unavailable.
 */
export async function inferCategory(
  docsUrl: string,
  name?: string,
): Promise<Category> {
  const patternResult = matchPatterns(docsUrl, name);
  if (patternResult) return patternResult;

  const llmResult = await inferCategoryWithLLM(docsUrl, name);
  return llmResult ?? 'Other';
}
