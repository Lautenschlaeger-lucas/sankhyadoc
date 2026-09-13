import {ArrowUpRight, ArrowRight, Code2} from 'lucide-react';

const guide = '#api/api-docs?view=guides&item=apjw4t1q0jms3';
const reference = '#api/api-docs?view=reference';
const tokenGuide = '#api/api-docs?view=guides&item=802bo3bosw7wq';
const limitsGuide = '#api/api-docs?view=guides&item=q17yyrkruxtew';
const adsGuide = '#api/api-docs?view=reference&item=get-ads-sku';
const pricesGuide = '#api/api-docs?view=reference&item=put-ads-prices-sku';
const stockGuide = '#api/api-docs?view=reference&item=put-callbacks-stocks';

type Endpoint = [string, string, string];
const endpoints: Endpoint[] = [
  ['POST', '/v1/products', 'Cadastrar um produto; o campo id identifica o SKU.'],
  ['PATCH', '/v1/products/{SKU}', 'Atualizar somente os campos gerenciados pelo ERP.'],
  ['PUT', '/v1/callbacks/stocks', 'Enviar os saldos de estoque por SKU e depósito.'],
  ['GET', '/v1/orders?status=ready_to_print&queueStatus=blank', 'Buscar os pedidos prontos para integrar ao ERP.'],
  ['PATCH', '/v1/orders/{order.id}', 'Registrar o controle de integração no campo queueStatus.'],
  ['POST', '/v1/invoices/{completeOrderNumber}', 'Enviar o XML da NF-e; definir releaseOrder conforme a expedição.'],
  ['GET', '/v1/orders/{completeOrderNumber}', 'Consultar o pedido e as etiquetas disponibilizadas em tags[].'],
  ['GET', '/v1/ads/{sku}', 'Consultar os anúncios associados ao SKU.'],
  ['PUT', '/v1/ads/prices/{sku}', 'Atualizar os preços dos anúncios do SKU.'],
];
function Source({href,children}:{href:string;children:React.ReactNode}) {
  return <a className="api-source" href={href}>{children}<ArrowUpRight size={16} aria-hidden="true"/></a>;
}
function Sources() {
  return <div className="api-sources"><span>DOCUMENTAÇÃO OFICIAL</span><Source href={guide}>Desenvolvimento sugerido</Source><Source href={reference}>Endpoints e schemas</Source></div>;
}
function Code({children,label='Exemplo ilustrativo'}:{children:string;label?:string}) {
  return <figure className="api-code"><figcaption>{label}</figcaption><pre tabIndex={0}><code>{children}</code></pre></figure>;
}
function Endpoints({rows=endpoints}:{rows?:Endpoint[]}) {
  return <div className="table-wrap"><table className="api-endpoints"><thead><tr><th>Método</th><th>Endpoint</th><th>Finalidade</th></tr></thead><tbody>{rows.map(([method,path,desc])=><tr key={method+path}><td><span className="method">{method}</span></td><td><code>{path}</code></td><td>{desc}</td></tr>)}</tbody></table></div>;
}
const steps = [
  {title:'Aderência',items:['Defina quais produtos, depósitos, canais e empresas entram na integração.','Alinhe quem gerencia os dados do catálogo e onde ocorrerão faturamento e expedição.','Mapeie os campos do seu ERP para os contratos da API Magis5.']},
  {title:'Kick Off e desenvolvimento',items:['Ative o aplicativo API pública e obtenha o token seguindo as instruções do painel Magis5.','Implemente cadastro e atualização de produtos, envio de estoque e importação de pedidos.','Implemente o envio do XML e defina releaseOrder conforme o local de expedição.']},
  {title:'Testes e Go Live',items:['Valide o ciclo completo com SKUs e pedidos de teste definidos para a operação.','Confira a marcação de queueStatus e o comportamento em retentativas.','Valide os saldos por depósito, o XML e a obtenção da etiqueta antes de ativar a rotina.']},
  {title:'Acompanhamento',items:['Acompanhe falhas, pedidos pendentes e divergências de estoque.','Trate respostas HTTP 429 com espera progressiva entre tentativas.','Consulte o histórico da API para acompanhar mudanças que afetem a integração.']},
];
export function ApiTopic({id,selectedStage=0,onNavigate}:{id:string;selectedStage?:number;onNavigate:(id:string)=>void}) {
  return <div className="article api-article">
    {id==='overview'?<>
      <p>Conecte seu ERP ou sistema próprio ao Magis5 pela API pública. Use este guia para organizar o desenvolvimento de produtos, estoque, pedidos e faturamento.</p>
      <div className="api-intro"><Code2 size={30} aria-hidden="true"/><div><span className="api-kicker">INTEGRAÇÃO COM SEU SISTEMA</span><h2>Do catálogo à expedição.</h2><p>O ERP envia produtos e saldos. O Magis5 disponibiliza os pedidos dos canais. O envio da nota fiscal completa o fluxo de faturamento.</p><button className="light-button" onClick={()=>onNavigate('sankhya')}>Começar pela integração <ArrowRight size={17}/></button></div></div>
      <h2>O que você vai implementar</h2>
      <div className="api-flow">{[['01','Produtos','Cadastrar o SKU e atualizar os campos gerenciados pelo ERP.'],['02','Estoque','Enviar os saldos sempre que houver movimentação.'],['03','Pedidos','Consultar pedidos prontos e registrar a integração.'],['04','Faturamento','Enviar o XML e seguir o fluxo de expedição escolhido.']].map(([n,title,text])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      <div className="callout">A implementação deve seguir os contratos da API pública. A aba Sankhya reúne as configurações específicas do conector com esse ERP.</div>
    </>:id==='journey'?<>
      <p>Organize a implantação da API em quatro etapas. Este roteiro adapta o desenvolvimento sugerido pela Magis5 para orientar a equipe responsável pela integração.</p>
      {steps.map((step,i)=><details key={step.title} open={i===selectedStage}><summary>0{i+1} · {step.title}</summary><div><ul>{step.items.map(item=><li key={item}>{item}</li>)}</ul></div></details>)}
      <div className="callout">Defina responsáveis pelo desenvolvimento, pelos cadastros e pela validação operacional. Alinhe o cronograma à complexidade do seu ERP e aos fluxos escolhidos.</div>
    </>:id==='sankhya'?<>
      <p>Prepare o acesso à API pública e implemente o fluxo de comunicação entre seu sistema e o Magis5.</p>
      <h2>Passo 1 · Ative a API pública</h2>
      <ol className="numbered"><li>No painel inicial do Magis5, acesse <strong>Aplicativos</strong>.</li><li>Localize o aplicativo <strong>API pública</strong>, leia as instruções e clique para ativar.</li><li>Siga os procedimentos do aplicativo para obter o token de integração.</li></ol>
      <p>Se ainda não é cliente Magis5, solicite a integração ao time comercial pelo canal indicado na documentação.</p><Source href={tokenGuide}>Como obter o token</Source>
      <h2>Passo 2 · Configure a autenticação</h2>
      <div className="two-col"><div className="panel"><h2>URL base de produção</h2><p><code>https://app.magis5.com.br/v1</code></p></div><div className="panel"><h2>Cabeçalho obrigatório</h2><p><code>X-MAGIS5-APIKEY: SEU_TOKEN</code></p></div></div>
      <p>Inclua o token no cabeçalho de cada chamada. Os caminhos abaixo já incluem <code>/v1</code>; acrescente-os ao domínio <code>https://app.magis5.com.br</code>.</p>
      <Code label="Exemplo de consulta · substitua SEU_TOKEN">{`curl --request GET \\\n  --url 'https://app.magis5.com.br/v1/orders?status=ready_to_print&queueStatus=blank' \\\n  --header 'Accept: application/json' \\\n  --header 'X-MAGIS5-APIKEY: SEU_TOKEN'`}</Code>
      <h2>Passo 3 · Implemente os endpoints</h2><Endpoints/>
      <h2>Pedidos: consulta e confirmação</h2><ol className="numbered"><li>Consulte pedidos com <code>status=ready_to_print</code> e <code>queueStatus=blank</code>.</li><li>Crie o pedido no ERP e registre a correspondência com o <code>id</code> do Magis5.</li><li>Após a criação bem-sucedida, atualize o pedido por <code>PATCH</code> com o corpo abaixo.</li></ol>
      <Code label="Corpo do PATCH do pedido">{JSON.stringify({queueStatus:'INTEGRADO'},null,2)}</Code>
      <p>O campo <code>queueStatus</code> aceita texto livre. Ao preenchê-lo, o pedido deixa de aparecer na busca com <code>queueStatus=blank</code>. Como prática de implementação, confira o ID no ERP antes de repetir uma criação após falha de comunicação.</p>
      <h2>Limites de requisição</h2><p>A documentação informa até <strong>600 requisições por minuto</strong>, contabilizadas pela chave de API e pelo endereço IP. Ao receber <code>429 Too Many Requests</code>, pause as chamadas e retome com atraso progressivo.</p><Source href={limitsGuide}>Consultar limites e retentativas</Source>
    </>:id==='products'?<>
      <p>Sincronize os dados que o ERP gerencia e envie as alterações de estoque ao Magis5 a cada movimentação.</p>
      <h2>Cadastro de produtos</h2><Endpoints rows={[endpoints[0]]}/><p>O desenvolvimento sugerido recomenda cadastrar o produto no Magis5 assim que ele for criado no ERP. O SKU deve ser enviado no campo <code>id</code>, indicado como o único campo obrigatório para criação no guia.</p>
      <Code label="Exemplo de cadastro de produto">{JSON.stringify({id:'SKU-001',title:'Produto de exemplo',condition:'new',cost:49.9,brand:'Marca exemplo',height:10,width:15,depth:20,weight:0.5},null,2)}</Code>
      <p>Dimensões são informadas em centímetros e peso em quilogramas. Inclua os dados fiscais e cadastrais disponíveis no ERP, conforme o schema do endpoint.</p>
      <h2>Atualização parcial</h2><Endpoints rows={[endpoints[1]]}/><div className="callout">Use <strong>PATCH</strong> e envie apenas os campos sob responsabilidade do ERP. Isso evita apagar dados complementados posteriormente no Magis5.</div><Code label="Exemplo de atualização parcial">{JSON.stringify({title:'Produto com título atualizado',brand:'Marca exemplo'},null,2)}</Code>
      <h2>Estoque por SKU e depósito</h2><Endpoints rows={[endpoints[2]]}/><p>Envie o saldo após entradas, saídas e balanços no ERP. O guia recomenda lotes de <strong>no máximo 50 SKUs por requisição</strong> e permite tanto estoque único quanto múltiplos depósitos.</p>
      <Code label="Exemplo de saldo em um depósito">{JSON.stringify({stocks:[{sku:'SKU-001',totalStock:20,warehouses:[{id:'1',title:'Estoque principal',stock:20,consider:true,stockVirtual:20}]}]},null,2)}</Code><Source href={stockGuide}>Contrato do callback de estoque</Source>
      <h2>Responsabilidade pelos dados</h2><p>Defina quais campos serão mantidos pelo ERP. Fotos, descrições e informações comerciais podem ser complementadas no Magis5; preserve esses dados ao sincronizar o catálogo.</p>
    </>:id==='ads'?<>
      <p>Use o SKU como referência para consultar os anúncios de cada produto e acompanhar os dados dos canais de venda.</p>
      <h2>Consulte os anúncios vinculados</h2><Endpoints rows={[endpoints[7]]}/><p>O retorno inclui a lista <code>ads</code>, com canal, variação, preço, quantidade disponível, status e link do anúncio. O endpoint aceita os parâmetros <code>page</code>, <code>limit</code> e <code>enableLink</code>.</p><Source href={adsGuide}>Consultar anúncios por SKU</Source>
      <h2>Confira os vínculos antes de operar</h2><ol className="numbered"><li>Use o mesmo SKU enviado no campo <code>id</code> do produto.</li><li>Consulte os anúncios associados e confira os canais e as variações retornadas.</li><li>Valide os vínculos no Magis5 antes de sincronizar estoque e preços da operação.</li></ol>
      <h2>Atualize os preços dos anúncios</h2><Endpoints rows={[endpoints[8]]}/><Code label="Exemplo ilustrativo · use os identificadores do anúncio consultado">{JSON.stringify({ads:[{channel:'CANAL_DO_ANUNCIO',channelId:'ID_DO_CANAL',variationId:'ID_DA_VARIACAO',price:79.9}]},null,2)}</Code><Source href={pricesGuide}>Contrato de atualização de preços</Source>
      <div className="callout">Alinhe a responsabilidade pela precificação antes de automatizar alterações. O custo do produto e o preço do anúncio pertencem a fluxos distintos.</div>
    </>:id==='tests'?<>
      <p>Valide o ciclo completo, do cadastro do produto ao envio da nota fiscal, antes de liberar a integração para a operação.</p>
      <h2>Checklist de validação</h2><ul><li>Token aceito no cabeçalho <code>X-MAGIS5-APIKEY</code>.</li><li>Produto criado com o SKU correto e atualizado via PATCH sem perder dados complementares.</li><li>Saldo e depósitos conferidos após uma movimentação no ERP.</li><li>Pedido em <code>ready_to_print</code> importado e marcado em <code>queueStatus</code>.</li><li>Retentativa validada sem criar o mesmo pedido novamente no ERP.</li><li>XML enviado e comportamento da expedição conferido.</li><li>Paginação e respostas HTTP 429 tratadas pela integração.</li></ul>
      <h2>Envio da nota e local de expedição</h2><Endpoints rows={[endpoints[5]]}/><p>Envie o XML completo da NF-e no corpo da chamada e informe <code>releaseOrder</code> na URL, de acordo com o fluxo escolhido.</p>
      <div className="two-col"><div className="panel"><h2>Expedição no ERP / WMS</h2><p><code>releaseOrder=true</code></p><p>O pedido avança para <code>billed</code> e a NF-e é enviada ao canal de venda. Consulte o pedido para obter as etiquetas disponibilizadas em <code>tags[]</code>.</p></div><div className="panel"><h2>Expedição no Magis5</h2><p><code>releaseOrder=false</code></p><p>O pedido permanece em <code>ready_to_print</code> para ser expedido no módulo de Expedição do Magis5.</p></div></div>
      <h2>Liberação e acompanhamento</h2><p>Como roteiro de implantação, valide os cenários com os responsáveis pelo ERP, faturamento e expedição. Após a liberação, acompanhe pedidos pendentes, divergências de estoque e falhas nas chamadas.</p><Source href={guide}>Fluxo oficial de faturamento</Source>
    </>:<>
      <p>Mapeie os campos do seu sistema para os contratos da API pública. As tabelas e os campos adicionais de cada ERP devem ser tratados na implementação da integração.</p>
      <h2>Identificadores e controle</h2><div className="table-wrap"><table><thead><tr><th>Campo</th><th>Uso na integração</th></tr></thead><tbody>{[['Produto: id','Código / SKU enviado no cadastro do produto.'],['Pedido: id','Código do pedido no Magis5; use-o para manter a correspondência no ERP.'],['Pedido: externalId','Código do pedido no marketplace.'],['Pedido: queueStatus','Controle livre de integração; o guia usa INTEGRADO após criar o pedido no ERP.'],['Pedido: storeId','Identificador da filial para mapear operações com múltiplas empresas.'],['Pedido: channel e channelName','Identificação da loja / canal da venda.'],['Pedido: order_items[].item.seller_custom_field','SKU do item vendido.']].map(([field,desc])=><tr key={field}><td><code>{field}</code></td><td>{desc}</td></tr>)}</tbody></table></div>
      <h2>Dados do pedido</h2><p>O guia de desenvolvimento descreve comprador, endereço de entrega, itens, frete, descontos, comissão, notas fiscais e etiquetas. Use esse mapeamento junto ao schema atualizado para definir a gravação no seu ERP.</p>
      <h2>Planeje as customizações</h2><ol className="numbered"><li>Defina o sistema responsável por cada dado e a correspondência entre seus identificadores.</li><li>Confira se o campo e a operação estão previstos no endpoint utilizado.</li><li>Valide campos opcionais, valores ausentes e regras de cada canal.</li><li>Documente a transformação dos dados e teste as regras antes da ativação.</li></ol><div className="callout">Campos adicionais específicos do Sankhya, como os de TGFCAB, estão na aba Sankhya. Na API pública, envie os campos definidos pelo contrato de cada endpoint.</div>
    </>}
    <div className="api-library-cta"><div><strong>Documentação completa da API</strong><p>45 operações, 132 schemas, 51 exemplos Postman e todos os guias de integração.</p></div><button className="docs-button" onClick={()=>onNavigate('api-docs')}>Abrir documentação <ArrowRight size={17}/></button></div><Sources/>
  </div>;
}
