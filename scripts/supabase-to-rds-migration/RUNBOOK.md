# agent-score Supabase → RDS (`agent_score`) — RUNBOOK

FER-11415. Moves the agent-score Supabase project into a new `agent_score`
database inside the existing prod RDS instance `fern-prod-enc`, and moves the
`og-images` Supabase Storage bucket to S3. **Maintenance-window cutover** — no
dual-write/flag layer (writes come only from cron/scripts, not live traffic).

`cutover.sh` is the source of truth for the DB sequence. This runbook is the
operator's checklist around it, with every placeholder resolved.

> **Do NOT touch the `fdr` or `dashboard` databases on `fern-prod-enc`.** The
> toolkit's `lib.sh` refuses to target them; the only new database is
> `agent_score`.

## Prerequisites

- `bash` 4+ (`brew install bash` on macOS — the scripts use associative arrays).
- `psql` + `pg_dump` whose major version ≥ the Supabase server major.
- `aws` CLI. Read-only `--profile fern` works for describe/checks; the **RDS
  snapshot** in step 3 needs a profile with `rds:CreateDBSnapshot`.
- `vercel` CLI authenticated to the `buildwithfern` scope.
- `jq` + `curl` (for the og-images copy).
- The CDK S3 bucket already deployed (step 1).

## Config

```bash
cd agent-score/scripts/supabase-to-rds-migration
cp config.prod.sh.example config.prod.sh
chmod +x *.sh
# Fill in the three CHANGE_ME secrets in config.prod.sh:
#   - Supabase DB password  (Supabase dashboard → Project Settings → Database)
#   - RDS master password    (AWS Secrets Manager, prod RDS master secret)
# Everything else (hosts, db names, bucket, Vercel project) is pre-filled.
```

`config.prod.sh` is gitignored — never commit it.

---

## Execution order

### 1. Provision the S3 bucket (AWS / CDK) — one-time

```bash
cd fern-platform/servers/agent-score-deploy
pnpm install            # or npm install
npm run cdk -- synth    # sanity check
npm run deploy:prod     # cdk deploy agent-score-og-images-prod  (needs write creds)
```

Creates public-read bucket `agent-score-prod-og-images` (RETAIN). No RDS
security-group change is needed — `fern-prod-enc` is publicly accessible
(0.0.0.0 ingress).

### 2. Dry-run the storage copy (optional, read-only)

```bash
DEPLOY_ENV=prod ./migrate-og-images.sh --dry-run
```

### 3. Run the cutover (DB) — `cutover.sh` drives this

```bash
DEPLOY_ENV=prod ./cutover.sh
```

It walks these steps, pausing for you at each human-operated gate:

1. **Preflight** — tool + pg_dump version checks, `00_audit.sh`.
2. **RDS snapshot** — prints the exact `aws rds create-db-snapshot` /
   `rds wait` commands (run them with a write-capable profile); confirm when
   `available`.
3. **Quiesce writers** — pause cron/GitHub-Actions `generate-scores` /
   `rescore-*` and any ad-hoc script runs; confirm.
4. **Ensure DB/roles/schema** — `CREATE DATABASE agent_score`, NOLOGIN RLS
   roles, schema restore (only if the target has no public tables yet).
5. **Dump + restore** — `pg_dump --data-only public.scores` → truncate+restore
   into `agent_score` (idempotent).
6. **Routines + sequence bump.**
7. **Validation gate** — row counts + sampled rows + structure parity; aborts
   (nothing repointed) on mismatch.
8. **og-images copy** — prompts you to run `migrate-og-images.sh`.
9. **Vercel repoint** — prints the exact Vercel commands (see below).
10. **Post-cutover checks** — points you at `monitor.sh`.

### 4. Copy og-images (when cutover.sh prompts)

```bash
DEPLOY_ENV=prod ./migrate-og-images.sh
```

### 5. Repoint Vercel (VERCEL, not AWS) — when cutover.sh prompts

```bash
vercel link --project fern-agent-score --scope buildwithfern

# add new prod env vars
printf '%s' "<AGENT_SCORE_DATABASE_URL>" | vercel env add AGENT_SCORE_DATABASE_URL production
printf '%s' "agent-score-prod-og-images" | vercel env add OG_S3_BUCKET production
printf '%s' "us-east-1"                   | vercel env add OG_S3_REGION production

# remove retired Supabase vars
vercel env rm SUPABASE_URL production
vercel env rm SUPABASE_SECRET_KEY production

# redeploy production and promote
vercel redeploy --prod
```

`AGENT_SCORE_DATABASE_URL` =
`postgres://<user>:<pw>@fern-prod-enc.cihbconq6tcp.us-east-1.rds.amazonaws.com:5432/agent_score?sslmode=require`

### 6. Validate

```bash
DEPLOY_ENV=prod ./monitor.sh
```

Confirms RDS row count + freshness, samples top rows, and smoke-tests the
public site. Then run one real score-generation job and re-run `monitor.sh` to
confirm the write landed on RDS.

---

## Expected audit findings (`00_audit.sh`)

The audit needs a live Supabase connection, so run it during the cutover (it's
step 1 of `cutover.sh`). For agent-score's single `public.scores` table the
blockers should be minimal:

- **Extensions** — `DUMP_SCHEMAS=public` excludes Supabase-only extensions
  (they live in the `extensions` schema), so the extension diff should be
  empty/benign. `sync_schema` also strips `pg_graphql`/`pgsodium`/`supabase_vault`/`pg_net`/`pgjwt` defensively.
- **RLS roles** — if `scores` has RLS policies referencing `anon` /
  `authenticated` / `service_role`, `ensure_supabase_roles` pre-creates them as
  NOLOGIN roles on RDS before the schema restore. No action needed.
- **FKs into internal schemas** — `scores` is standalone; none expected.
- **Functions/triggers** — `00_sync_routines.sh` copies any user routines;
  none expected for a single table.

If the audit flags anything else, resolve it before proceeding past the gate.

## Rollback

Until you delete the Supabase project, rollback is just reverting the Vercel
env (restore `SUPABASE_URL` / `SUPABASE_SECRET_KEY`, remove
`AGENT_SCORE_DATABASE_URL`) and redeploying — the app code path is selected
entirely by which env vars are present. The pre-cutover RDS snapshot from
step 3 is the instance-level safety net. Keep Supabase live for a soak window
before decommissioning.

## Files

| File | Purpose |
|---|---|
| `cutover.sh` | Source of truth for the DB cutover (maintenance window). |
| `migrate-og-images.sh` | Idempotent Supabase Storage `og-images` → S3 copy. |
| `monitor.sh` | Read-only post-cutover health check. |
| `00_audit.sh` | Read-only pre-migration audit (extensions / RLS roles / FKs). |
| `00_sync_routines.sh` | Copies functions/procedures + triggers Supabase → RDS. |
| `06_refresh_matviews.sh` | Refreshes materialized views (none expected for agent-score). |
| `lib.sh` | Shared helpers + reserved-DB guard (postgres/fdr/**dashboard**/…). |
| `config.prod.sh.example` | Config template (gitignored real copy: `config.prod.sh`). |
