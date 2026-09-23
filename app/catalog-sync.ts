// Public, sanitized documentation only. No API credentials are sent.
export const CATALOG_URL = 'https://raw.githubusercontent.com/Lautenschlaeger-lucas/sankhyadoc/main/public/api-data/catalog.json';
export function validateCatalog(data: any) {
  if (!data || !Array.isArray(data.operations) || !data.operations.length || !data.schemas || typeof data.schemas !== 'object' || Array.isArray(data.schemas)) throw Error('Invalid catalog');
  if (!Array.isArray(data.guides) || !data.guides.every((g: any) => typeof g.content === 'string') || !Array.isArray(data.requests) || !data.securitySchemes || !data.report) throw Error('Invalid catalog metadata');
  const ids = new Set();
  for (const op of data.operations) {
    if (!op || typeof op.id !== 'string' || ids.has(op.id) || !['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS','TRACE'].includes(op.method) || typeof op.path !== 'string' || !op.path.startsWith('/')) throw Error('Invalid operation');
    ids.add(op.id);
  }
  return data;
}
export async function fetchCatalog(url: string, signal: AbortSignal) {
  const timeout = new AbortController();
  const abort = () => timeout.abort();
  signal.addEventListener('abort', abort, {once: true});
  if (signal.aborted) abort();
  const timer = setTimeout(abort, 12000);
  try {
    const response = await fetch(url, {signal: timeout.signal, credentials: 'omit', cache: 'no-cache'});
    if (!response.ok) throw Error('Catalog unavailable');
    return validateCatalog(await response.json());
  } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); }
}
