import {readFile, writeFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const catalog = JSON.parse(await read('public/api-data/catalog.json'));
const instructions = await read('content/ai-integration-prompt.txt');
const guideIds = ['apjw4t1q0jms3', '802bo3bosw7wq', 'q17yyrkruxtew'];
const guides = guideIds.map(id => {
  const guide = catalog.guides.find(g => g.id === id);
  if (!guide) throw Error(`Guia obrigatório ausente: ${id}`);
  return `\n===== ${guide.title} =====\n${guide.content}`;
});
// Select by normalized parameter names too: Swagger may rename path parameters.
const paths = new Set(['POST /v1/products','PATCH /v1/products/{}','PUT /v1/callbacks/stocks','GET /v1/orders','PATCH /v1/orders/{}','GET /v1/orders/{}','POST /v1/invoices/{}']);
const selected = catalog.operations.filter(op => paths.has(`${op.method} ${op.path.replace(/\{[^}]+\}/g,'{}')}`));
if (selected.length !== paths.size) throw Error('Contratos de integração ausentes');
const schemas = {};
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string' && value.$ref.startsWith('#/components/schemas/')) {
    const name = value.$ref.slice('#/components/schemas/'.length).replace(/~1/g,'/').replace(/~0/g,'~');
    if (!(name in schemas)) {
      if (!catalog.schemas[name]) throw Error(`Schema ausente: ${name}`);
      schemas[name] = catalog.schemas[name]; collect(schemas[name]);
    }
  }
  Object.values(value).forEach(collect);
}
selected.forEach(collect);
const contracts = {operations:selected, components:{schemas,securitySchemes:catalog.securitySchemes}};
const result = `${instructions}\nGerado em: ${new Date().toISOString()}\n${guides.join('\n')}\n\n===== CONTRATOS E SCHEMAS DO CATÁLOGO =====\n${JSON.stringify(contracts,null,2)}\n`;
await writeFile(new URL('public/api-data/magis5-guia-para-ia.txt', root), result);
console.log(`Briefing IA: ${selected.length} operações, ${Object.keys(schemas).length} schemas, ${Buffer.byteLength(result)} bytes.`);
