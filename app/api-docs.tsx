'use client';
import {useEffect, useRef, useState, useMemo} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Search, Download, Copy, Check, BookOpen, Code2, Layers, ShieldCheck, ChevronDown, ChevronRight, X} from 'lucide-react';

type Json = Record<string, any>;
type Catalog = {operations: Json[]; schemas: Record<string, Json>; securitySchemes: Json; requests: Json[]; guides: Json[]; report: Json};
type View = 'reference' | 'schemas' | 'guides';

const views: {id: View; label: string; icon: typeof Code2}[] = [
  {id: 'reference', label: 'Endpoints', icon: Code2},
  {id: 'schemas', label: 'Schemas', icon: Layers},
  {id: 'guides', label: 'Guias e tutoriais', icon: BookOpen},
];

const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const local = (view: View, item = '') => '#api/api-docs?view=' + view + (item ? '&item=' + encodeURIComponent(item) : '');

function readSelection(): {view: View; item: string} {
  const p = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const v = p.get('view');
  return {
    view: (views.some(x => x.id === v) ? v : 'reference') as View,
    item: p.get('item') ?? ''
  };
}

function resolve(s: Json | undefined, schemas: Record<string, Json>): Json {
  if (!s) return {};
  if (s.$ref) {
    const name = s.$ref.split('/').pop();
    return schemas[name] ?? s;
  }
  return s;
}

/**
 * Stoplight-compatible example generator.
 * Follows $ref without burning data depth, limits array item recursion, and produces clean mock payloads.
 */
function generateExample(s: Json | undefined, schemas: Record<string, Json>, depth = 0, seen = new Set<string>()): any {
  if (!s) return {};
  if (s.example !== undefined) return s.example;

  if (s.$ref) {
    const ref = s.$ref;
    if (seen.has(ref)) return {};
    const nextSeen = new Set(seen);
    nextSeen.add(ref);
    const resolved = resolve(s, schemas);
    return generateExample(resolved, schemas, depth, nextSeen);
  }

  if (s.default !== undefined && s.default !== '##default') return s.default;
  if (s.enum && s.enum.length > 0) return s.enum[0];

  if (s.allOf) {
    return Object.assign({}, ...s.allOf.map((x: Json) => generateExample(x, schemas, depth + 1, seen)));
  }
  if (s.oneOf || s.anyOf) {
    return generateExample((s.oneOf || s.anyOf)[0], schemas, depth + 1, seen);
  }

  const type = s.type || (s.properties ? 'object' : s.items ? 'array' : 'string');

  if (type === 'string') {
    if (s.format === 'date-time') return '2026-01-01T00:00:00Z';
    if (s.format === 'date') return '2026-01-01';
    if (s.format === 'email') return 'usuario@example.com';
    return 'string';
  }
  if (type === 'integer' || type === 'number') return 0;
  if (type === 'boolean') return false;

  if (type === 'array') {
    if (depth >= 4) return [];
    return [generateExample(s.items || {}, schemas, depth + 1, seen)];
  }

  if (type === 'object') {
    if (depth >= 3) return {};
    if (!s.properties) return {};
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(s.properties)) {
      res[k] = generateExample(v as Json, schemas, depth + 1, seen);
    }
    return res;
  }

  return {};
}

const stringify = (x: any) => JSON.stringify(x, null, 2);

function CopyBlock({value, label = 'JSON'}: {value: string; label?: string}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback handled by user selection
    }
  }

  return (
    <figure className="docs-code-card">
      <figcaption>
        <span>{label}</span>
        <button type="button" onClick={copy} aria-label={'Copiar ' + label}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </figcaption>
      <pre tabIndex={0}><code>{value}</code></pre>
    </figure>
  );
}

function Description({text}: {text?: string}) {
  if (!text) return null;
  return (
    <div className="docs-markdown-text">
      <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
    </div>
  );
}

function ParameterTable({parameters}: {parameters: Json[]}) {
  if (!parameters || parameters.length === 0) return null;
  return (
    <div className="clean-table-wrap">
      <table className="clean-table">
        <thead>
          <tr>
            <th>Parâmetro</th>
            <th>Origem / Tipo</th>
            <th>Descrição e regras</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p, i) => (
            <tr key={(p.name || '') + i}>
              <td>
                <div className="param-name-wrap">
                  <code>{p.name}</code>
                  {p.required && <span className="pill-required">Obrigatório</span>}
                </div>
              </td>
              <td>
                <span className="pill-loc">{p.in}</span>
                <span className="param-type">{p.schema?.type ?? 'string'}{p.schema?.format ? ` (${p.schema.format})` : ''}</span>
              </td>
              <td>
                <Description text={p.description} />
                {p.schema?.enum && (
                  <p className="param-meta">Valores: <code>{JSON.stringify(p.schema.enum)}</code></p>
                )}
                {p.schema?.default !== undefined && p.schema.default !== '##default' && (
                  <p className="param-meta">Padrão: <code>{String(p.schema.default)}</code></p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchemaFields({schema, schemas, depth = 0, seen = []}: {schema: Json; schemas: Record<string, Json>; depth?: number; seen?: string[]}) {
  const ref = schema.$ref;
  const name = ref?.split('/').pop();
  const s = resolve(schema, schemas);
  const cycle = ref && seen.includes(ref);

  if (cycle) return <p className="schema-cycle-notice">Referência recursiva para <code>{name}</code>.</p>;
  if (depth > 6) return <p className="schema-depth-notice">Consulte o modelo <a href={local('schemas', name)}>{name}</a> para a estrutura completa.</p>;

  if (s.type === 'array') {
    const itemRef = s.items?.$ref?.split('/').pop();
    return (
      <div className="schema-array-block">
        <p className="schema-array-title">Array de itens {itemRef ? <>do modelo <a href={local('schemas', itemRef)}>{itemRef}</a></> : <code>{s.items?.type ?? 'object'}</code>}:</p>
        <SchemaFields schema={s.items ?? {}} schemas={schemas} depth={depth + 1} seen={ref ? [...seen, ref] : seen} />
      </div>
    );
  }

  if (s.properties) {
    const requiredList = s.required || [];
    return (
      <div className="clean-table-wrap">
        <table className="clean-table schema-props-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Tipo</th>
              <th>Descrição e regras</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(s.properties).map(([field, rawVal]) => {
              const raw = rawVal as Json;
              const propRef = raw.$ref?.split('/').pop();
              const v = resolve(raw, schemas);
              const isRequired = requiredList.includes(field);
              const typeStr = v.type || (v.properties ? 'object' : propRef ? 'schema' : 'any');
              const hasNested = !!(v.properties || (v.type === 'array' && (v.items?.properties || v.items?.$ref)));

              return (
                <tr key={field}>
                  <td>
                    <div className="param-name-wrap">
                      <code>{field}</code>
                      {isRequired && <span className="pill-required">obrigatório</span>}
                      {v.readOnly && <span className="pill-muted">somente leitura</span>}
                      {v.nullable && <span className="pill-muted">aceita null</span>}
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">{typeStr}{v.format ? ` (${v.format})` : ''}</span>
                    {propRef && <a className="ref-link-pill" href={local('schemas', propRef)}>{propRef}</a>}
                  </td>
                  <td>
                    {v.description && <Description text={v.description} />}
                    {v.enum && <p className="param-meta">Valores: <code>{JSON.stringify(v.enum)}</code></p>}
                    {v.default !== undefined && v.default !== '##default' && (
                      <p className="param-meta">Padrão: <code>{JSON.stringify(v.default)}</code></p>
                    )}
                    {['minimum', 'maximum', 'minLength', 'maxLength', 'pattern'].filter(k => v[k] !== undefined).map(k => (
                      <span className="constraint-badge" key={k}>{k}: {String(v[k])}</span>
                    ))}
                    {hasNested && (
                      <details className="nested-schema-disclosure">
                        <summary>Ver campos de {field}</summary>
                        <SchemaFields schema={raw} schemas={schemas} depth={depth + 1} seen={ref ? [...seen, ref] : seen} />
                      </details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (s.allOf || s.oneOf || s.anyOf) {
    const key = (['allOf', 'oneOf', 'anyOf'] as const).find(k => s[k]);
    if (!key) return null;
    return (
      <div className="schema-variants">
        {s[key].map((part: Json, idx: number) => (
          <details key={key + idx} className="nested-schema-disclosure" open={idx === 0}>
            <summary>{key} · Opção {idx + 1}</summary>
            <SchemaFields schema={part} schemas={schemas} depth={depth + 1} seen={ref ? [...seen, ref] : seen} />
          </details>
        ))}
      </div>
    );
  }

  return <p className="schema-scalar-type">Tipo: <code>{s.type ?? 'string'}</code>{s.enum ? ` · ${JSON.stringify(s.enum)}` : ''}</p>;
}

function SchemaDetail({name, schema, schemas}: {name: string; schema: Json; schemas: Record<string, Json>}) {
  const [tab, setTab] = useState<'example' | 'fields' | 'openapi'>('example');
  const sampleJson = useMemo(() => stringify(generateExample(schema, schemas)), [schema, schemas]);
  const rawOpenApi = useMemo(() => stringify(schema), [schema]);

  return (
    <div className="schema-view-container">
      <div className="schema-view-header">
        <div className="schema-header-top">
          <span className="model-tag">Modelo de dados</span>
          <span className="type-badge large">{schema.type || 'object'}</span>
        </div>
        <h2>{name}</h2>
        {schema.description && <Description text={schema.description} />}
      </div>

      <div className="clean-segmented-tabs" role="tablist" aria-label="Visualização do modelo">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'example'}
          className={tab === 'example' ? 'tab-item active' : 'tab-item'}
          onClick={() => setTab('example')}
        >
          Exemplo JSON
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'fields'}
          className={tab === 'fields' ? 'tab-item active' : 'tab-item'}
          onClick={() => setTab('fields')}
        >
          Estrutura (Campos)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'openapi'}
          className={tab === 'openapi' ? 'tab-item active' : 'tab-item'}
          onClick={() => setTab('openapi')}
        >
          OpenAPI (Bruto)
        </button>
      </div>

      <div className="tab-body-area">
        {tab === 'example' && (
          <div>
            <p className="tab-hint-text">Exemplo de dados representativo gerado a partir do contrato OpenAPI deste modelo.</p>
            <CopyBlock value={sampleJson} label={`${name} · Exemplo JSON`} />
          </div>
        )}
        {tab === 'fields' && (
          <div>
            <p className="tab-hint-text">Campos disponíveis, tipos de dados e regras de validação.</p>
            <SchemaFields schema={schema} schemas={schemas} />
          </div>
        )}
        {tab === 'openapi' && (
          <div>
            <p className="tab-hint-text">Definição original do esquema no padrão OpenAPI 3.0.</p>
            <CopyBlock value={rawOpenApi} label={`${name} · Especificação OpenAPI`} />
          </div>
        )}
      </div>
    </div>
  );
}

function curlFor(op: Json) {
  const query = (op.parameters ?? []).filter((p: Json) => p.in === 'query' && p.required).map((p: Json) => p.name + '=SEU_' + p.name.toUpperCase()).join('&');
  const mime = Object.keys(op.requestBody?.content ?? {})[0];
  return `curl --request ${op.method} \\\n  --url 'https://app.magis5.com.br${op.path}${query ? '?' + query : ''}' \\\n  --header 'X-MAGIS5-APIKEY: SEU_TOKEN'${mime ? ` \\\n  --header 'Content-Type: ${mime}' \\\n  --data-binary '@corpo-da-requisicao.${mime.includes('xml') ? 'xml' : 'json'}'` : ''}`;
}

function OperationDetail({op, catalog}: {op: Json; catalog: Catalog}) {
  const responses = op.responses ?? {};
  const statusKeys = Object.keys(responses);
  const defaultStatus = statusKeys.find(s => s.startsWith('2')) || statusKeys[0] || '200';

  const [activeStatus, setActiveStatus] = useState<string>(defaultStatus);
  const [reqTab, setReqTab] = useState<'example' | 'fields'>('example');
  const [respTab, setRespTab] = useState<'example' | 'fields'>('example');

  // Sync activeStatus if op changes
  useEffect(() => {
    setActiveStatus(defaultStatus);
    setReqTab('example');
    setRespTab('example');
  }, [op.id, defaultStatus]);

  const reqBody = op.requestBody;
  const reqContent = reqBody?.content?.['application/json'] ?? Object.values(reqBody?.content ?? {})[0] as Json | undefined;
  const currentResp = responses[activeStatus] as Json | undefined;
  const respContent = currentResp?.content?.['application/json'] ?? Object.values(currentResp?.content ?? {})[0] as Json | undefined;

  const reqSample = useMemo(() => {
    if (!reqContent) return '';
    return stringify(reqContent.example ?? generateExample(reqContent.schema, catalog.schemas));
  }, [reqContent, catalog.schemas]);

  const respSample = useMemo(() => {
    if (!respContent) return '';
    return stringify(respContent.example ?? generateExample(respContent.schema, catalog.schemas));
  }, [respContent, catalog.schemas]);

  return (
    <div className="operation-view-container">
      <div className="endpoint-hero">
        <div className="endpoint-badges-bar">
          <span className={`http-badge ${op.method.toLowerCase()}`}>{op.method}</span>
          <code className="endpoint-path-code">{op.path}</code>
          {op.deprecated && <span className="pill-deprecated">Descontinuado</span>}
        </div>
        <h2>{op.summary}</h2>
        {op.description && <Description text={op.description} />}
      </div>

      <div className="auth-strip">
        <div className="auth-icon-circle"><ShieldCheck size={18} /></div>
        <div className="auth-text">
          <strong>Autenticação da API</strong>
          <p>{(op.security ?? []).length === 0 ? 'Não declarada nesta operação. Utilize a chave no cabeçalho padrão.' : 'Envie a chave de API no cabeçalho: X-MAGIS5-APIKEY: SEU_TOKEN'}</p>
        </div>
      </div>

      {op.parameters?.length > 0 && (
        <section className="endpoint-section">
          <h3>Parâmetros da requisição</h3>
          <ParameterTable parameters={op.parameters} />
        </section>
      )}

      {reqBody && (
        <section className="endpoint-section">
          <div className="section-head-bar">
            <h3>Corpo da requisição</h3>
            {reqBody.required && <span className="pill-required">Obrigatório</span>}
          </div>
          {reqBody.description && <Description text={reqBody.description} />}

          {reqContent?.schema && (
            <div className="endpoint-card-box">
              <div className="box-tab-bar">
                <button
                  type="button"
                  className={reqTab === 'example' ? 'sub-tab active' : 'sub-tab'}
                  onClick={() => setReqTab('example')}
                >
                  Exemplo JSON
                </button>
                <button
                  type="button"
                  className={reqTab === 'fields' ? 'sub-tab active' : 'sub-tab'}
                  onClick={() => setReqTab('fields')}
                >
                  Estrutura (Campos)
                </button>
              </div>
              <div className="box-tab-content">
                {reqTab === 'example' ? (
                  <CopyBlock value={reqSample} label="Corpo da requisição · Exemplo JSON" />
                ) : (
                  <SchemaFields schema={reqContent.schema} schemas={catalog.schemas} />
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="endpoint-section">
        <h3>Respostas</h3>
        {statusKeys.length > 0 ? (
          <div className="responses-container">
            <div className="status-selector-row" role="tablist" aria-label="Status HTTP da resposta">
              {statusKeys.map(status => {
                const is2xx = status.startsWith('2');
                const is4xx = status.startsWith('4');
                const is5xx = status.startsWith('5');
                const tone = is2xx ? 'success' : is4xx ? 'warning' : is5xx ? 'danger' : 'neutral';
                return (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={activeStatus === status}
                    className={`status-chip ${tone} ${activeStatus === status ? 'active' : ''}`}
                    onClick={() => { setActiveStatus(status); setRespTab('example'); }}
                  >
                    <span className="status-code">{status}</span>
                    <span className="status-label">{(responses[status] as Json)?.description?.slice(0, 20) || (is2xx ? 'OK' : 'Erro')}</span>
                  </button>
                );
              })}
            </div>

            {currentResp && (
              <div className="active-response-wrapper">
                <div className="response-description-bar">
                  <span className={`status-badge-mini ${activeStatus.startsWith('2') ? 'success' : 'error'}`}>{activeStatus}</span>
                  <p>{currentResp.description || 'Sem descrição.'}</p>
                </div>

                {respContent?.schema ? (
                  <div className="endpoint-card-box">
                    <div className="box-tab-bar">
                      <button
                        type="button"
                        className={respTab === 'example' ? 'sub-tab active' : 'sub-tab'}
                        onClick={() => setRespTab('example')}
                      >
                        Exemplo JSON
                      </button>
                      <button
                        type="button"
                        className={respTab === 'fields' ? 'sub-tab active' : 'sub-tab'}
                        onClick={() => setRespTab('fields')}
                      >
                        Estrutura (Campos)
                      </button>
                    </div>
                    <div className="box-tab-content">
                      {respTab === 'example' ? (
                        <CopyBlock value={respSample} label={`Resposta ${activeStatus} · Exemplo JSON`} />
                      ) : (
                        <SchemaFields schema={respContent.schema} schemas={catalog.schemas} />
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="no-body-notice">Esta resposta não possui corpo retornado.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="no-body-notice">Nenhuma resposta documentada nesta operação.</p>
        )}
      </section>

      <section className="endpoint-section">
        <details className="curl-disclosure-card">
          <summary>Exemplo de requisição via terminal (cURL)</summary>
          <div className="curl-box">
            <CopyBlock value={curlFor(op)} label="cURL · linha de comando" />
          </div>
        </details>
      </section>
    </div>
  );
}

function GuideDetail({guide}: {guide: Json}) {
  const heading = String(guide.heading || guide.title);
  const content = guide.content.replace(new RegExp('^#{1,6}\\s+' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[ \\t]*\\n', 'm'), '');
  return (
    <div className="guide-view-container">
      <div className="guide-header">
        <span className="guide-meta-tag">{guide.group} · Guia oficial</span>
        <h2>{heading}</h2>
      </div>
      <div className="docs-markdown-text guide-content-body">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children, ...props}) => <h2 {...props}>{children}</h2>,
            a: ({href, children}) => (
              <a href={href} {...(href?.startsWith('http') ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
                {children}
              </a>
            ),
            img: ({src, alt}) => (
              <a href={typeof src === 'string' ? src : undefined} target="_blank" rel="noopener noreferrer">
                <img src={src} alt={alt ?? 'Ilustração do guia'} loading="lazy" />
              </a>
            ),
            pre: ({children}) => <pre tabIndex={0}>{children}</pre>,
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}

export function ApiDocs() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);
  const [selection, setSelection] = useState<{view: View; item: string}>({view: 'reference', item: ''});
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const previousView = useRef<View>('reference');

  useEffect(() => {
    const read = () => {
      const next = readSelection();
      setSelection(next);
      if (previousView.current !== next.view) {
        setQuery('');
      }
      previousView.current = next.view;
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('api-data/catalog.json', {signal: controller.signal})
      .then(r => {
        if (!r.ok) throw Error('catalog');
        return r.json();
      })
      .then(data => setCatalog({...(data as Catalog), guides: (data as Catalog).guides.map(g => ({...g, content: g.content.replace(/\/api-assets\//g, 'api-assets/')}))}))
      .catch(e => {
        if (e.name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, [attempt]);

  if (error) {
    return (
      <div className="article">
        <p>Não foi possível carregar a documentação da API.</p>
        <button className="docs-button" onClick={() => setAttempt(x => x + 1)}>Tentar novamente</button>
      </div>
    );
  }

  if (!catalog) return <p role="status">Carregando documentação…</p>;

  const {view, item} = selection;

  // Build the list of items for the active view
  const list: Json[] = view === 'reference'
    ? catalog.operations
    : view === 'guides'
    ? catalog.guides
    : Object.entries(catalog.schemas).map(([name, schema]) => ({id: name, name, group: 'Modelos', schema}));

  // Filtering
  const q = normalize(query.trim());
  const filtered = list.filter(x => {
    if (!q) return true;
    const searchable = normalize([
      x.summary,
      x.name,
      x.title,
      x.path,
      x.group,
      x.method,
      view === 'schemas' ? stringify(x.schema) : '',
      view === 'guides' ? x.content : ''
    ].filter(Boolean).join(' '));
    return searchable.includes(q);
  });

  const selected = filtered.find(x => x.id === item) ?? filtered[0];

  // Grouping for endpoints and guides
  const groupedList: Record<string, Json[]> = {};
  for (const item of filtered) {
    const g = item.group || 'Geral';
    if (!groupedList[g]) groupedList[g] = [];
    groupedList[g].push(item);
  }

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  };

  return (
    <div className="article docs-redesign-root">
      {/* Top Header & Single Postman Download */}
      <div className="docs-top-bar">
        <div className="docs-top-text">
          <p className="docs-lead">Consulte a especificação completa da API pública Magis5: endpoints, modelos de dados e guias práticos.</p>
        </div>
        <div className="docs-downloads-wrap">
          <a className="docs-button postman-cta" href="api-data/magis5.postman_collection.json" download>
            <Download size={16} />
            <span>Collection Postman</span>
            <span className="download-badge">51 requisições</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="docs-main-tabs" role="tablist" aria-label="Seções da documentação">
        {views.map(({id, label, icon: Icon}) => {
          const count = id === 'reference'
            ? catalog.operations.length
            : id === 'schemas'
            ? Object.keys(catalog.schemas).length
            : catalog.guides.length;
          const isActive = view === id;
          return (
            <a
              key={id}
              href={local(id)}
              role="tab"
              aria-selected={isActive}
              className={isActive ? 'main-tab-link active' : 'main-tab-link'}
            >
              <Icon size={16} />
              <span>{label}</span>
              <span className="tab-count-pill">{count}</span>
            </a>
          );
        })}
      </nav>

      {/* Two-Column Docs Workspace */}
      <div className="docs-split-workspace">
        {/* Left Sidebar Index */}
        <aside className="docs-sidebar-index" aria-label="Índice da documentação">
          <div className="sidebar-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={view === 'reference' ? 'Buscar endpoint ou caminho...' : view === 'schemas' ? 'Buscar schema...' : 'Buscar guia...'}
              aria-label="Buscar na documentação"
            />
            {query && (
              <button type="button" className="clear-search-btn" onClick={() => setQuery('')} aria-label="Limpar busca">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="sidebar-items-count">
            {filtered.length} {filtered.length === 1 ? 'item' : 'itens'} {query && `para "${query}"`}
          </div>

          <div className="sidebar-items-scroll">
            {view === 'reference' ? (
              // Grouped endpoints
              Object.entries(groupedList).map(([groupName, items]) => {
                const isCollapsed = !query && !!collapsedGroups[groupName];
                return (
                  <div key={groupName} className="sidebar-group-section">
                    <button
                      type="button"
                      className="group-section-header"
                      onClick={() => toggleGroup(groupName)}
                      aria-expanded={!isCollapsed}
                    >
                      <span className="group-name">{groupName}</span>
                      <span className="group-count">{items.length}</span>
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {!isCollapsed && (
                      <div className="group-items-list">
                        {items.map(x => {
                          const isSelected = selected?.id === x.id;
                          return (
                            <a
                              key={x.id}
                              href={local(view, x.id)}
                              className={`sidebar-nav-item ${isSelected ? 'selected' : ''}`}
                              aria-current={isSelected ? 'page' : undefined}
                            >
                              <span className={`method-tag ${x.method?.toLowerCase()}`}>{x.method}</span>
                              <span className="nav-item-title">{x.summary || x.name || x.path}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : view === 'schemas' ? (
              // Flat alphabetized schemas list
              <div className="schemas-flat-list">
                {filtered.map(x => {
                  const isSelected = selected?.id === x.id;
                  return (
                    <a
                      key={x.id}
                      href={local(view, x.id)}
                      className={`sidebar-nav-item schema-item ${isSelected ? 'selected' : ''}`}
                      aria-current={isSelected ? 'page' : undefined}
                    >
                      <span className="schema-name-label">{x.name}</span>
                      <span className="schema-type-tiny">{x.schema?.type || 'object'}</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              // Guides list
              <div className="guides-flat-list">
                {filtered.map(x => {
                  const isSelected = selected?.id === x.id;
                  return (
                    <a
                      key={x.id}
                      href={local(view, x.id)}
                      className={`sidebar-nav-item guide-item ${isSelected ? 'selected' : ''}`}
                      aria-current={isSelected ? 'page' : undefined}
                    >
                      <span className="guide-title-label">{x.title || x.heading}</span>
                      <small className="guide-sub-label">{x.group}</small>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Detail Pane */}
        <main className="docs-detail-pane" key={view + (selected?.id ?? '')}>
          {!selected ? (
            <div className="docs-empty-state">
              <Search size={32} />
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente buscar por outro termo ou limpe o campo de busca.</p>
              <button type="button" className="docs-button secondary" onClick={() => setQuery('')}>
                Limpar busca
              </button>
            </div>
          ) : (
            <>
              <div className="detail-top-nav">
                <span className="detail-section-breadcrumb">
                  {view === 'reference' ? `Endpoints / ${selected.group}` : view === 'schemas' ? 'Modelos de dados (Schemas)' : `Guias / ${selected.group}`}
                </span>
              </div>

              {view === 'reference' ? (
                <OperationDetail op={selected} catalog={catalog} />
              ) : view === 'guides' ? (
                <GuideDetail guide={selected} />
              ) : (
                <SchemaDetail name={selected.name} schema={selected.schema} schemas={catalog.schemas} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
