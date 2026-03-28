const API_URL = 'https://functions.poehali.dev/2449e2d8-177c-4a8d-a469-0cbab180de83';

async function call(action: string, sql: string, params?: unknown[]) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, sql, params: params || [] }),
  });
  if (!res.ok) throw new Error(`DB error: ${res.status}`);
  return res.json();
}

export const db = {
  query: (sql: string, params?: unknown[]) => call('query', sql, params).then(r => r.data as Record<string, unknown>[]),
  execute: (sql: string, params?: unknown[]) => call('execute', sql, params).then(r => r.affected as number),
  returning: (sql: string, params?: unknown[]) => call('execute_returning', sql, params).then(r => r.data as Record<string, unknown> | null),
};
