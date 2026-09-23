import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(`public/api-data/${name}`,'utf8'));
const catalog=read('catalog.json'),spec=read('openapi.json'),collection=read('magis5.postman_collection.json');
const operations=Object.entries(spec.paths).flatMap(([path,item])=>Object.keys(item).filter(method=>['get','post','put','patch','delete','options','head'].includes(method)).map(method=>`${method.toUpperCase()} /v1${path}`));
assert.ok(catalog.operations.length > 0);
assert.deepEqual(catalog.operations.map(o=>`${o.method} ${o.path}`).sort(),operations.sort());
assert.ok(Object.keys(catalog.schemas).length > 0);
assert.deepEqual(Object.keys(catalog.schemas).sort(),Object.keys(spec.components.schemas).sort());
function checkRefs(value){if(Array.isArray(value))return value.forEach(checkRefs);if(!value||typeof value!=='object')return;if(value.$ref){assert.ok(value.$ref.startsWith('#/'),'External schema reference');let target=spec;for(const part of value.$ref.slice(2).split('/'))target=target?.[part.replace(/~1/g,'/').replace(/~0/g,'~')];assert.ok(target,`Unresolved ${value.$ref}`);}Object.values(value).forEach(checkRefs);}
checkRefs(spec);
const requests=[];function flatten(items){for(const item of items){assert.ok(!item.event,'Unexpected script');if(item.item)flatten(item.item);else requests.push(item.request);}}
flatten(collection.item);assert.equal(requests.length,51);assert.equal(catalog.requests.length,51);
const variables=new Map(collection.variable.map(v=>[v.key,v.value]));assert.equal(variables.get('apiKey'),'');
for(const request of requests){assert.equal(request.header.find(h=>h.key==='X-MAGIS5-APIKEY')?.value,'{{apiKey}}');assert.ok(request.url.raw.startsWith('{{url}}/v1/'));for(const match of JSON.stringify(request).matchAll(/\{\{([^{}]+)\}\}/g))assert.ok(variables.has(match[1]),`Missing variable ${match[1]}`);if(request.body?.raw){if(request.body.options.raw.language==='xml')assert.equal(request.body.raw,'{{invoiceXml}}');else JSON.parse(request.body.raw);}}
assert.ok(!JSON.stringify(collection).includes('<nfeProc'));
assert.ok(!/[\w.+-]+@(?!example\.com)[\w.-]+\.[a-z]{2,}/i.test(JSON.stringify(collection)),'Non-example email in public collection');
const ids=new Set(catalog.operations.map(o=>o.id)),guideIds=new Set(catalog.guides.map(g=>g.id));assert.equal(catalog.guides.length,14);
for(const guide of catalog.guides){assert.ok(guide.content.length>100);assert.ok(!/https?:\/\/(?:stoplight\.io|magis5\.stoplight\.io|developers\.magis5\.com\.br)/.test(guide.content),'Legacy dependency in guide');for(const [,view,id] of guide.content.matchAll(/#api\/api-docs\?view=(\w+)&item=([^\s)]+)/g))(view==='reference'&&!ids.has(id)?console.warn(`Editorial guide references removed operation: ${id}`):assert.ok((view==='reference'?ids:guideIds).has(id),`Broken guide link ${id}`));for(const [,asset] of guide.content.matchAll(/!\[[^\]]*\]\((\/api-assets\/[^)]+)\)/g))assert.ok(existsSync('public'+asset),`Missing ${asset}`);}
assert.ok(!existsSync('public/api-assets/image-8.png'),'Credential screenshot must not be published');

assert.ok(catalog.requests.every(r=>r.operationId===null||ids.has(r.operationId)),'Stale request operationId');
console.log(`Verified: ${catalog.operations.length} operations, ${Object.keys(catalog.schemas).length} schemas, collection, guides, references and assets.`);
