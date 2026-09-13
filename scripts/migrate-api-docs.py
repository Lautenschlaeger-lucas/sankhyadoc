"""Build the public documentation from local OpenAPI, Postman and guide exports.
The source collection is never modified or copied as-is. No API requests are executed.
Usage: python3 scripts/migrate-api-docs.py OPENAPI COLLECTION GUIDES_DIR ASSETS_MANIFEST
"""
import sys, json, re, hashlib, shutil
from pathlib import Path
from urllib.parse import urlsplit, parse_qsl, urlencode, unquote

spec_path, collection_path, guides_dir, assets_manifest = map(Path, sys.argv[1:])
out = Path('public/api-data'); out.mkdir(parents=True, exist_ok=True)
spec = json.loads(spec_path.read_text()); collection = json.loads(collection_path.read_text())
HTTP = {'get','post','put','patch','delete','head','options'}
variables = {'url':'https://app.magis5.com.br','apiKey':'','completeOrderNumber':'PEDIDO_EXEMPLO','sku':'SKU_EXEMPLO','channel':'CANAL_EXEMPLO','start':'20260101','end':'20260131','userEmail':'usuario@example.com','invoiceXml':'COLE_AQUI_O_XML_COMPLETO_DA_NFE'}
secrets = set()

# Replace customer examples while retaining field names, types and business enums.
semantic = {'status','queuestatus','condition','type','doctype','doc_type','logistictype','logistic_type','integrationtype','orderchanneltype','operationtype','shipment_type','shipping_mode','unitmeasurement','currency','currency_id','cause','error','message','method','protocol','description','origin','ncm','cest'}
example_text = {'title':'Produto de exemplo','description':'Descrição de exemplo','plaintextdescription':'Descrição de exemplo','technicalspecification':'Especificação de exemplo','fullname':'Cliente Exemplo','full_name':'Cliente Exemplo','nickname':'cliente_exemplo','name':'Exemplo','brand':'Marca exemplo','model':'Modelo exemplo','business':'Fornecedor exemplo','channelname':'Loja exemplo','street_name':'Rua Exemplo','street_number':'100','address_line':'Rua Exemplo, 100','comment':'Complemento exemplo','salesname':'Canal exemplo','location':'A1','additionalnoteinvoice':'Observação de exemplo'}
def sample(value, key=''):
 k=key.lower()
 if isinstance(value,dict): return {a:sample(b,a) for a,b in value.items()}
 if isinstance(value,list): return [sample(v,key) for v in value]
 if value is None or isinstance(value,bool): return value
 if isinstance(value,(int,float)):
  return 1001 if k in {'id','storeid','externalid'} else value
 if not isinstance(value,str):return value
 if not value:return value
 if k in {'password','senha','token','apikey','access_token','authorization'}:return 'SEU_TOKEN' if k!='password' else 'SUA_SENHA'
 if 'email' in k or re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',value):return 'usuario@example.com'
 if k in {'doc_number','document','salesdocument','cpf','cnpj','ean','eaninvoice','zipcode','zip_code','ie','key'}:return '0'* (44 if k=='key' else 14 if k in {'cnpj','salesdocument'} else 11 if k in {'cpf','doc_number'} else 8 if k in {'zipcode','zip_code'} else 13)
 if value.startswith(('http://','https://')):return 'https://example.com/arquivo-exemplo'
 if k in {'number','phone','telephone'} and len(re.sub(r'\D','',value))>=8:return '00000000000'
 if k in example_text:return example_text[k]
 if k in semantic or 'date' in k or k in {'warranty','warrantyprovider'}:return value
 if k in {'id','externalid','external_id','sku','seller_custom_field','erpId'.lower()}:return 'SKU_EXEMPLO' if k in {'sku','seller_custom_field'} else 'ID_EXEMPLO'
 if re.search(r'[a-f0-9]{24,}',value,re.I) or re.fullmatch(r'\d{7,}',value):return 'ID_EXEMPLO'
 # Non-enum string values are illustrative, not customer data.
 return 'exemplo'

def clean_spec(node):
 if isinstance(node,list):return [clean_spec(x) for x in node]
 if not isinstance(node,dict):return node
 result={}
 for k,v in node.items():
  if k=='example':result[k]=sample(v) if isinstance(v,(dict,list)) else v
  elif k=='examples' and isinstance(v,dict):
   result[k]={n:{**e,'value':sample(e['value']) if isinstance(e['value'],(dict,list)) else e['value']} if isinstance(e,dict) and 'value' in e else clean_spec(e) for n,e in v.items()}
  else:result[k]=clean_spec(v)
 return result
spec=clean_spec(spec)

def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
operations=[]
for path,item in spec['paths'].items():
 for method,operation in item.items():
  if method not in HTTP:continue
  operations.append({'id':slug(method+'-'+path),'method':method.upper(),'path':'/v1'+path,'group':operation.get('tags',['Outros'])[0],**operation,'parameters':item.get('parameters',[])+operation.get('parameters',[])})

# Match exact fixed path parts before variable paths.
paths=sorted(spec['paths'],key=lambda p:(p.count('{'),-len(p)))
def normalize_path(path):
 for template in paths:
  names=re.findall(r'\{([^}]+)\}',template)
  pattern=re.sub(r'\\\{[^}]+\\\}',r'([^/]+)',re.escape('/v1'+template))
  if re.fullmatch(pattern,path):
   for n in names:variables.setdefault(n,n.upper()+'_EXEMPLO')
   return '/v1'+re.sub(r'\{([^}]+)\}',r'{{\1}}',template)
 return path

def parse_body(raw):
 # Remove JSONC comments without touching // within strings.
 cleaned=re.sub(r'("(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/)',lambda m:m[0] if m[0].startswith('"') else '',raw)
 cleaned=re.sub(r',\s*([}\]])',r'\1',cleaned)
 return json.loads(cleaned)

requests=[]
def convert(items,groups=[]):
 result=[]
 for item in items:
  if 'item' in item:result.append({'name':item['name'],'item':convert(item['item'],groups+[item['name']])});continue
  if 'request' not in item:continue
  r=item['request'];u=r.get('url',{});raw=u.get('raw','') if isinstance(u,dict) else u
  raw=raw.replace('{{url}}','https://app.magis5.com.br')
  parsed=urlsplit(raw);path=normalize_path(parsed.path)
  queries=[]
  for q in (u.get('query',[]) if isinstance(u,dict) and 'query' in u else [{'key':k,'value':v} for k,v in parse_qsl(parsed.query)]):
   q={k:v for k,v in q.items() if k in {'key','value','disabled','description'}}
   if q.get('key')=='userId':q['value']='{{userEmail}}'
   elif q.get('key') in {'storeId','channel'}:q['value']='{{'+q['key']+'}}';variables.setdefault(q['key'],q['key'].upper()+'_EXEMPLO')
   queries.append(q)
  headers=[]
  for h in r.get('header',[]):
   k=h.get('key','').strip()
   if not k:continue
   if k.lower() in {'x-magis5-apikey','authorization'}:
    if h.get('value') and not h['value'].startswith('{{'):secrets.add(h['value'])
    continue
   headers.append({'key':k,'value':h.get('value',''),'type':'text',**({'disabled':True} if h.get('disabled') else {})})
  headers.insert(0,{'key':'X-MAGIS5-APIKEY','value':'{{apiKey}}','type':'text'})
  query_string='&'.join(q['key']+'='+str(q.get('value','')) for q in queries if not q.get('disabled'))
  url='{{url}}'+path+('?' +query_string if query_string else '')
  body=r.get('body',{});cleanbody=None;body_note=None
  if body.get('raw'):
   if body['raw'].lstrip().startswith('<'):
    cleanbody={'mode':'raw','raw':'{{invoiceXml}}','options':{'raw':{'language':'xml'}}};body_note='Substitua invoiceXml pelo XML completo autorizado da NF-e. O documento original foi removido do exemplo.'
   else:
    try:parsed_body=parse_body(body['raw'])
    except json.JSONDecodeError as e:raise ValueError('Corpo não interpretado: '+item['name']) from e
    cleanbody={'mode':'raw','raw':json.dumps(sample(parsed_body),ensure_ascii=False,indent=2),'options':{'raw':{'language':'json'}}}
  request={'method':r['method'],'header':headers,'url':{'raw':url,'host':['{{url}}'],'path':path.lstrip('/').split('/'),**({'query':queries} if queries else {})}}
  if cleanbody:request['body']=cleanbody
  idx='postman-'+str(len(requests)+1).zfill(2)
  canonical=re.sub(r'\{\{([^}]+)\}\}',r'{\1}',path)
  matching=next((o['id'] for o in operations if o['method']==r['method'] and o['path']==canonical),None)
  requests.append({'id':idx,'name':item['name'],'group':' / '.join(groups),'method':r['method'],'path':path,'url':url,'query':queries,'headers':headers,'body':cleanbody['raw'] if cleanbody else None,'language':cleanbody.get('options',{}).get('raw',{}).get('language') if cleanbody else None,'note':body_note,'operationId':matching})
  result.append({'name':item['name'],'request':request,'response':[]})
 return result
clean_collection={'info':{'name':'Magis5 API 1.0 — Exemplos públicos','schema':collection['info']['schema'],'description':'Collection com 51 exemplos. Configure apiKey e os identificadores antes de usar. Documentos fiscais e dados de clientes foram substituídos por exemplos. Requisições de escrita alteram o ambiente configurado.'},'item':convert(collection['item'])}
clean_collection['variable']=[{'key':k,'value':v,'type':'string'} for k,v in variables.items()]

# Import all articles and keep their source content, with local links and assets.
guides=[json.loads(p.read_text()) for p in sorted(guides_dir.glob('*.json'))]
guide_ids={d['id'] for d in guides}
assets=json.loads(assets_manifest.read_text());asset_map={u:'/api-assets/'+n for u,n,size in assets}
assets=[entry for entry in assets if entry[1]!='image-8.png']
Path('public/api-assets/image-8.png').unlink(missing_ok=True)
for u,n,size in assets:shutil.copyfile(Path('/tmp/magis-assets')/n,Path('public/api-assets')/n)
# Stable old slugs are mapped by operation titles as well as known historical IDs.
known={
 'fohcqqiqzsf7l':None,'12dab89109ded':None,
 '8ed05ic3qcxqe':'post-products','hr60m7vrgo4ym':'post-products','d3i32i42dt76v':'patch-products-sku',
 'mmw8t015lptvf':'post-invoices-completeordernumber','8kc8kcrjhqix4':'get-orders-completeordernumber','utz7lcfn735u2':'put-callbacks-stocks',
}
def local_link(url):
 url=url.strip('<>');segment=urlsplit(url).path.rsplit('/',1)[-1];node=segment.split('-')[0]
 if node in guide_ids:return '#api/api-docs?view=guides&item='+node
 for op in operations:
  title=slug(op.get('summary',''))
  # Accent-insensitive matching happens in the UI link resolver; common historical links here.
  if segment.endswith(title) or slug(segment.split('-',1)[-1])==title:return '#api/api-docs?view=reference&item='+op['id']
 mapping=[('atualizar-preco','put-ads-prices-sku'),('atualizar-o-preco','put-ads-prices-sku'),('obter-lista-de-anuncios','get-ads-sku'),('callback-de-estoque','put-callbacks-stocks'),('atualizar-alguns-campos-do-produto','patch-products-sku'),('criar-um-produto','post-products'),('informar-lista-de-pedidos-que-ja-foram-consumidos','post-invoices-queues-read'),('informar-que-o-pedido','post-invoices-queues-read-completeordernumber'),('obter-lista-de-pedidos-que-possuem','get-invoices-queues')]
 opid=known.get(node)
 for word,value in mapping:
  if word in segment:opid=value
 return '#api/api-docs?view=reference'+('&item='+opid if opid else '')
articles=[]
for d in guides:
 md=re.sub(r'^---\s*\n.*?\n---\s*\n','',d['data'],flags=re.S)
 for remote,local in asset_map.items():md=md.replace(remote,local)
 md=re.sub(r'https://(?:developers\.magis5\.com\.br|magis5\.stoplight\.io)/docs/[^\s)<>]+',lambda m:local_link(m[0]),md)
 md=re.sub(r'!\[[^\]]*\]\(/api-assets/image-8\.png\)', '> Na aba Integração, selecione **Integração via API**, confira a opção **ERP principal** e use o token da sua conta. A captura que exibia um token foi substituída por esta orientação.', md)
 if d['id'] in {'0tuseuqodyu2x','i87zr6s470z28'}:md='> **Método atual de envio da NF-e:** use `POST /v1/invoices/{completeOrderNumber}`. O diagrama original abaixo contém rótulos antigos (PUT / XML); consulte o contrato local para a implementação.\n\n'+md
 md=md.replace('https://developers.magis5.com.br', '#api/api-docs?view=guides')
 if d['id']=='qcp542xdwv194':md=md.replace('[products/{sku}](#api/api-docs?view=reference&item=post-products)', '[products/{sku}](#api/api-docs?view=reference&item=get-products-sku)')
 md=md.replace('https://app.magis5.com.br/v1/ui/index.html','#api/api-docs?view=reference')
 # Strip Stoplight formatting metadata; code remains escaped by the Markdown renderer.
 md=re.sub(r'<!--.*?-->','',md,flags=re.S)
 # PII in the original development guide's commented payload becomes illustrative.
 if d['id']=='apjw4t1q0jms3':
  md=re.sub(r'"(full_name|nickname|address_line|street_name|street_number|zip_code|comment|salesName|channel|storeId|externalId|key|urlXml|defaultPicture|url|name|id|doc_number|salesDocument|number)"\s*:\s*"[^"\n]*"',lambda m:'"'+m[1]+'": "'+('Cliente Exemplo' if m[1] in {'name','full_name'} else 'EXEMPLO')+'"',md)
  md=re.sub(r'https?://(?:storage\.googleapis\.com|bling\.com\.br|mlb-s1-p\.mlstatic\.com)/[^\s"<>]+','https://example.com/arquivo-exemplo',md)
 articles.append({'id':d['id'],'title':d['navTitle'],'heading':d['title'],'group':d['group'],'content':md,'sourceSlug':d['slug']})

report={'operations':len(operations),'schemas':len(spec['components']['schemas']),'postmanRequests':len(requests),'guides':len(articles),'assets':len(assets),'credentialScreenshotReplaced':1,'collectionOnly':[{ 'id':r['id'],'name':r['name'],'path':r['path']} for r in requests if not r['operationId']], 'sources':{'openapiSha256':hashlib.sha256(spec_path.read_bytes()).hexdigest(),'collectionSha256':hashlib.sha256(collection_path.read_bytes()).hexdigest()},'credentialsReplaced':len(secrets),'notes':['Respostas e schemas vêm da especificação OpenAPI. A collection original não possui respostas salvas.','Dados de clientes, tokens e XMLs reais da collection foram substituídos por exemplos.','Links internos dos guias foram migrados para a navegação local.']}
artifacts={'openapi.json':spec,'magis5.postman_collection.json':clean_collection,'catalog.json':{'operations':operations,'schemas':spec['components']['schemas'],'securitySchemes':spec['components'].get('securitySchemes',{}),'requests':requests,'guides':articles,'report':report},'migration-report.json':report}
for filename,data in artifacts.items():
 text=json.dumps(data,ensure_ascii=False,indent=2)
 assert not any(secret in text for secret in secrets if len(secret)>8), 'Credential leak in '+filename
 (out/filename).write_text(text)
print(json.dumps({k:v for k,v in report.items() if k not in {'sources'}},ensure_ascii=False,indent=2))
