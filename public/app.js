const SPEC_URL = './api-data/openapi.json';
const SERVER_URL_SELECTOR = 0;

const tpl = document.getElementById('endpoint-tpl');
const grid = document.getElementById('grid');
const tagPills = document.getElementById('tag-pills');
const resetBtn = document.getElementById('reset-tags');
const searchInput = document.getElementById('search');
const refreshBtn = document.getElementById('refresh');
const countBadge = document.getElementById('count-badge');
const specSource = document.getElementById('spec-source');
const toastEl = document.getElementById('toast');

let all = [];
let activeTag = null;

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), 2000);
}

function esc(text){
  return String(text == null ? '' : text)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function methodClass(m){return (m||'get').toLowerCase();}

function paramType(p){
  const schema = p.schema || {};
  return schema.type || (schema.$ref ? schema.$ref.split('/').pop() : 'any');
}

function renderItem(op){
  const clone = tpl.content.cloneNode(true);
  const card = clone.querySelector('.card');
  const method = (op.method||'get').toUpperCase();
  const path = op.path||'';
  const summary = op.summary||'Sem t\u00edtulo';
  const description = op.description||'';

  card.dataset.method = method;
  card.dataset.tag = (op.tags&&op.tags[0])||'Outros';
  card.dataset.path = path;

  const badge = card.querySelector('.method-badge');
  badge.textContent = method;
  badge.className = 'method-badge ' + methodClass(op.method);

  const pathEl = card.querySelector('.path');
  pathEl.textContent = path;

  const link = card.querySelector('.link');
  link.href = op.path||'#';

  card.querySelector('.title').textContent = summary;
  card.querySelector('.desc').textContent = description;

  const tag = card.querySelector('.tag');
  tag.textContent = card.dataset.tag;

  const opId = card.querySelector('.op-id');
  opId.textContent = op.operationId||'';

  const paramsSection = card.querySelector('.params');
  const paramsTbody = paramsSection.querySelector('tbody');
  const params = op.parameters||[];
  if(params.length){
    paramsSection.style.display = '';
    paramsTbody.innerHTML = '';
    for(const p of params){
      const tr = document.createElement('tr');
      const req = p.required;
      tr.innerHTML = `
        <td><code>${esc(p.name)}</code></td>
        <td>${esc(p.in||'query')}</td>
        <td class="${req?'req-yes':'req-no'}">${req?'Sim':'N\u00e3o'}</td>
        <td>${esc(paramType(p))}</td>
        <td>${esc(p.description||'')}</td>
      `;
      paramsTbody.appendChild(tr);
    }
  } else {
    paramsSection.style.display = 'none';
  }

  const responsesSection = card.querySelector('.responses');
  const responsesUl = responsesSection.querySelector('ul');
  const responses = op.responses||{};
  const codes = Object.keys(responses);
  if(codes.length){
    responsesSection.style.display = '';
    responsesUl.innerHTML = codes.map(c=>{
      const r = responses[c];
      let desc = (r&&r.description)||'';
      const content = r&&r.content;
      if(content){
        const ct = Object.keys(content)[0];
        desc += ct ? ` (${ct})` : '';
      }
      return `<li><strong>${esc(c)}</strong> ${esc(desc)}</li>`;
    }).join('');
  } else {
    responsesSection.style.display = 'none';
  }

  return card;
}

function render(){
  const q = searchInput.value.toLowerCase().trim();
  grid.innerHTML = '';
  let count = 0;
  const frag = document.createDocumentFragment();
  for(const op of all){
    const tag = (op.tags&&op.tags[0])||'Outros';
    if(activeTag && tag!==activeTag) continue;
    const haystack = (op.path||'')+' '+(op.summary||'')+' '+(op.description||'')+' '+(op.operationId||'')+' '+methodClass(op.method);
    if(q && !haystack.toLowerCase().includes(q)) continue;
    count++;
    frag.appendChild(renderItem(op));
  }
  if(count===0){
    grid.innerHTML = '<div class="empty">Nenhum endpoint encontrado.</div>';
  } else {
    grid.appendChild(frag);
  }
  countBadge.textContent = count + ' endpoint' + (count!==1?'s':'') + ' exibido' + (count!==1?'s':'');
}

function buildPills(){
  const tags = [];
  const seen = new Set();
  for(const op of all){
    const t = (op.tags&&op.tags[0])||'Outros';
    if(!seen.has(t)){seen.add(t);tags.push(t);}
  }
  tags.sort((a,b)=>a.localeCompare(b));
  tagPills.innerHTML = '';
  const allPill = document.createElement('button');
  allPill.className = 'tag-pill active' + (activeTag?'':'');
  allPill.textContent = 'Todos';
    allPill.onclick = ()=>{setActiveTag(null);};
  tagPills.appendChild(allPill);
  for(const t of tags){
    const b = document.createElement('button');
    b.className = 'tag-pill' + (activeTag===t?' active':'');
    b.textContent = t;
    b.onclick = ()=>{setActiveTag(t);};
    tagPills.appendChild(b);
  }
}

function setActiveTag(tag){
  activeTag = tag;
  for(const b of tagPills.querySelectorAll('.tag-pill')){
    b.classList.toggle('active', (tag===null && b.textContent==='Todos') || (tag!==null && b.textContent===tag));
  }
  if(resetBtn) resetBtn.style.display = activeTag ? '' : 'none';
  render();
}

function resetFilters(){
  searchInput.value = '';
  setActiveTag(null);
}

function parseSpec(spec){
  const servers = spec.servers||[];
  const baseUrl = servers[SERVER_URL_SELECTOR]?.url||'';
  const out = [];
  const paths = spec.paths||{};
  for(const [rawPath, item] of Object.entries(paths)){
    if(!item||typeof item!=='object') continue;
    for(const [method, op] of Object.entries(item)){
      const m = method.toLowerCase();
      if(!['get','post','put','patch','delete','head','options'].includes(m)) continue;
      const parameters = (op.parameters||[]).map(p=>{
        const ref = p.$ref;
        let resolved = p;
        if(ref){
          // resolve simple #/components/parameters/X refs
          const parts = ref.replace(/^#\/components\/parameters\//,'');
          resolved = (spec.components&&spec.components.parameters&&spec.components.parameters[parts])||p;
        }
        return resolved;
      });
      out.push({
        method: m,
        path: baseUrl + rawPath,
        rawPath,
        summary: op.summary,
        description: op.description,
        operationId: op.operationId,
        tags: op.tags,
        parameters,
        responses: op.responses,
      });
    }
  }
  // stable order: group by tag, then method, then path
  out.sort((a,b)=>{
    const ta=(a.tags&&a.tags[0])||'', tb=(b.tags&&b.tags[0])||'';
    if(ta!==tb) return ta.localeCompare(tb);
    const om={'get':0,'post':1,'put':2,'patch':3,'delete':4,'head':5,'options':6};
    const d = (om[a.method]||99)-(om[b.method]||99);
    if(d!==0) return d;
    return a.rawPath.localeCompare(b.rawPath);
  });
  return out;
}

async function load(){
  try{
    specSource.textContent = 'Carregando especi\u00e7\u00e3o...';
    const res = await fetch(SPEC_URL, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const spec = await res.json();
    if(!spec||!spec.openapi) throw new Error('Especifica\u00e7\u00e3o inv\u00e1da');
    const server = (spec.servers||[])[0];
    if(server&&server.url){
      specSource.innerHTML = 'Fonte: <a href="'+esc(server.url)+'" target="_blank" rel="noopener">'+esc(server.url)+'</a>';
    } else {
      specSource.textContent = 'Fonte: especi\u00e7\u00e3o local';
    }
    all = parseSpec(spec);
    buildPills();
    render();
    showToast('Especifica\u00e7\u00e3o carregada ('+all.length+' endpoints)');
  } catch(err){
    console.error(err);
    specSource.textContent = 'Erro ao carregar especi\u00e7\u00e3o';
    grid.innerHTML = '<div class="empty">N\u00e3o foi poss\u00edvel carregar a especifica\u00e7\u00e3o OpenAPI.</div>';
    showToast('Falha ao carregar: '+err.message);
  }
}

searchInput.addEventListener('input', render);
refreshBtn.addEventListener('click', load);
if(resetBtn) resetBtn.addEventListener('click', resetFilters);

void load();
