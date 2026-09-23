import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fetchCatalog, validateCatalog} from '../app/catalog-sync.ts';
const catalog=JSON.parse(readFileSync('public/api-data/catalog.json','utf8'));
validateCatalog(catalog);
const added=structuredClone(catalog);
added.operations.push({id:'get-new-example',method:'GET',path:'/v1/new-example'});
validateCatalog(added);
added.operations.pop();added.operations.pop();validateCatalog(added);
assert.throws(()=>validateCatalog({operations:[],schemas:{}}));
assert.throws(()=>validateCatalog({...catalog,operations:[catalog.operations[0],catalog.operations[0]]}));
const original=globalThis.fetch;
try {
 globalThis.fetch=async (_url,options)=>{assert.equal(options.credentials,'omit');return new Response(JSON.stringify(catalog));};
 assert.equal((await fetchCatalog('https://example.com/catalog',new AbortController().signal)).operations.length,catalog.operations.length);
 globalThis.fetch=async()=>new Response('Unavailable',{status:503});
 await assert.rejects(fetchCatalog('https://example.com/catalog',new AbortController().signal));
 globalThis.fetch=async()=>new Response('{bad json');
 await assert.rejects(fetchCatalog('https://example.com/catalog',new AbortController().signal));
 globalThis.fetch=async (_url,{signal})=>{if(signal.aborted)throw new DOMException('Aborted','AbortError');return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));};
 const controller=new AbortController();controller.abort();
 await assert.rejects(fetchCatalog('https://example.com/catalog',controller.signal));
} finally {globalThis.fetch=original;}
console.log('Catalog sync: additions, removals, malformed data, HTTP errors and cancellation verified.');
