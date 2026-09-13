#!/usr/bin/env node
// Downloads the raw OpenAPI spec (Swagger) and validates it before the migration.
import {writeFile} from 'node:fs/promises';
import {mkdir, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const defaultUrl = 'https://app.magis5.com.br/v1/v3/api-docs';

const [urlArg, outArg] = process.argv.slice(2);
const url = urlArg || process.env.MAGIS5_OPENAPI_URL || defaultUrl;
const out = resolve(repoRoot, outArg || '.cache/openapi.json');

mkdirSync(dirname(out), {recursive: true});

const res = await fetch(url, {headers: {Accept: 'application/json'}});
if (!res.ok) {
  console.error(`Falha ao baixar o Swagger (HTTP ${res.status}): ${url}`);
  process.exit(1);
}

const spec = await res.json();
if (!spec || spec.openapi !== '3.0.1' && !String(spec.openapi || '').startsWith('3.0')) {
  console.error('Resposta inválida: o URI não aponta para uma especificação OpenAPI.');
  process.exit(1);
}

await writeFile(out, JSON.stringify(spec, null, 2));
const operations = Object.keys(spec.paths || {}).length;
const schemas = Object.keys(spec.components?.schemas || {}).length;
console.log(`OpenAPI baixado: ${out} (${operations} paths, ${schemas} schemas)`);