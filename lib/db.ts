import { Pool, type QueryResult, type QueryResultRow } from 'pg';

/**
 * Postgres connection pool for the agent-score RDS database (`agent_score`
 * namespace inside the fern-prod-enc instance). Replaces the Supabase /
 * PostgREST data path (FER-11415).
 *
 * Reads AGENT_SCORE_DATABASE_URL, e.g.
 *   postgres://<user>:<pw>@fern-prod-enc.<hash>.us-east-1.rds.amazonaws.com:5432/agent_score?sslmode=require
 *
 * A single pool is reused across warm Vercel invocations (cached on globalThis
 * so HMR / lambda reuse doesn't open a new pool each time). Pool is small per
 * function; RDS fans out connections.
 */
const globalForPg = globalThis as unknown as { _agentScorePool?: Pool };

function getPool(): Pool {
  if (!globalForPg._agentScorePool) {
    const connectionString = process.env.AGENT_SCORE_DATABASE_URL;
    if (!connectionString) {
      throw new Error('AGENT_SCORE_DATABASE_URL is not set');
    }
    globalForPg._agentScorePool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      // RDS enforces TLS (sslmode=require). We don't pin the RDS CA bundle, so
      // verify-full is not used; this matches `sslmode=require` semantics.
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalForPg._agentScorePool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as never[]);
}
