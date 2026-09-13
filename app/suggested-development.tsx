import {ArrowUpRight} from "lucide-react";
import {highlightJson} from './json-highlight';

function Source({href,children}:{href:string;children:React.ReactNode}) {
  return <a className="api-source" href={href}>{children}<ArrowUpRight size={16} aria-hidden="true"/></a>;
}

function Code({children,label="Exemplo ilustrativo"}:{children:string;label?:string}) {
  return <figure className="api-code"><figcaption>{label}</figcaption><pre tabIndex={0}><code dangerouslySetInnerHTML={{__html: highlightJson(children)}} /></pre></figure>;
}

type Endpoint = [string, string, string];
function Endpoints({rows}:{rows:Endpoint[]}) {
  return (
    <div className="table-wrap">
      <table className="api-endpoints">
        <thead>
          <tr>
            <th>Método</th>
            <th>Endpoint</th>
            <th>Finalidade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([method,path,desc])=>(
            <tr key={method+path}>
              <td><span className="method">{method}</span></td>
              <td><code>{path}</code></td>
              <td>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const productCreatePayload = `{
  "id": "EXEMPLO", // Código/SKU (único campo obrigatório para criação)
  "title": "string", // Título do produto
  "externalId": "EXEMPLO",
  "condition": "string", // Condição do produto: enviar "new" ou "used"
  "cost": 0, // Preço Base (compra, custo ou valor acordado com o cliente)
  "description": "string", // Descrição do produto
  "technicalSpecification": "string", // Descrição mais técnica do produto
  "warranty": "string", // Tempo de garantia em DIAS (exemplo: "90")
  "business": "string", // Fornecedor
  "ean": "string", // Código de barras
  "eanInvoice": "string", // Código de barras para nota fiscal
  "height": 0, // Altura, em cm
  "weight": 0, // Peso Líquido, em kg
  "weightGross": 0, // Peso Bruto, em kg
  "depth": 0, // Comprimento, em cm
  "width": 0, // Largura, em cm
  "brand": "string", // Marca
  "model": "string", // Modelo
  "ncm": "string", // NCM
  "origin": 0, // Origem da mercadoria
  "deadlineCrossdocking": 0, // Tempo de envio/fabricação do produto (em dias)
  "youtubeId": "string", // Código do vídeo no YouTube (se houver)
  "location": "string", // Localização de estoque deste produto
  "warrantyProvider": "string", // Tempo de garantia do fornecedor em DIAS (exemplo: "90")
  "quantityItemsSamePackaging": 1, // Enviar sempre 1
  "stockFixed": 0, // Estoque fixo infinito (geralmente gerenciado no Magis5; enviar 0)
  "operationalCost": 0, // Precificação automática (preencher se acordado com o cliente)
  "percentageProfit": 0, // Precificação automática (preencher se acordado com o cliente)
  "pictures": [ // Fotos geralmente são cadastradas no Magis5; se enviadas pelo ERP, usar URL pública HTTPS ou Base64
    {
      "url": "https://example.com/imagem.jpg"
    }
  ],
  "plainTextDescription": "string" // Descrição do produto em texto puro
}`;

const productPatchPayload = `{
  "title": "string",
  "brand": "string",
  "model": "string",
  "ean": "string",
  "eanInvoice": "string",
  "ncm": "string",
  "origin": 0,
  "cest": "string",
  "location": "string",
  "height": 0,
  "weight": 0,
  "weightGross": 0,
  "depth": 0,
  "width": 0,
  "description": "string",
  "plainTextDescription": "string"
}`;

const orderMappingPayload = `{
  "links": [],
  "id": "EXEMPLO", // Código do pedido no Magis5
  "buyer": { // Dados do comprador
    "nickname": "EXEMPLO", // Apelido do cliente
    "id": 1232350058, // Código do buyer (geralmente não é usado)
    "full_name": "Cliente Exemplo", // Nome completo
    "billing_info": { // Dados de faturamento
      "doc_number": "EXEMPLO", // Documento do comprador (CPF ou CNPJ)
      "doc_type": "CPF", // Tipo do documento: "CPF" ou "CNPJ"
      "ie": null // Inscrição Estadual (preenchida quando pessoa jurídica)
    },
    "phone": {
      "number": "EXEMPLO" // Número de telefone principal
    },
    "alternative_phone": {
      "number": "EXEMPLO" // Telefone secundário (pode ou não vir preenchido)
    }
  },
  "intermediary": { // Dados do intermediador: enviar na NF-e quando for venda online
    "salesDocument": "EXEMPLO", // CNPJ do intermediador
    "salesName": "EXEMPLO" // Marketplace que vendeu (ex: Mercado Livre, Shopee)
  },
  "shipping": { // Dados de envio (endereço de entrega, logística e frete)
    "receiver_address": { // Dados de envio da mercadoria
      "address_line": "EXEMPLO", // Endereço completo de envio
      "street_number": "EXEMPLO", // Número
      "zip_code": "EXEMPLO", // CEP
      "street_name": "EXEMPLO", // Nome da rua / logradouro
      "comment": "EXEMPLO", // Complemento
      "neighborhood": {
        "name": "Cliente Exemplo" // Bairro
      },
      "country": {
        "name": "Cliente Exemplo" // País
      },
      "city": {
        "name": "Cliente Exemplo" // Cidade
      },
      "state": {
        "name": "Cliente Exemplo" // Estado (UF)
      },
      "name": "Cliente Exemplo" // Nome do destinatário da NF-e
    },
    "date_created": "2024-10-07T20:06:20Z", // Data de criação do envio no marketplace
    "shipping_mode": "ShopeeXpress - ShopeeXpress", // Modo de envio
    "shipment_type": "ShopeeXpress", // Tipo de envio
    "logistic_type": "-", // Tipo da logística: "-", "normal", "self_service", "fulfillment"
    "shipping_option": {
      "list_cost": 0, // Valor do frete grátis
      "cost": 13.13, // Valor do frete que deverá ser informado na nota fiscal
      "comission": 0.00 // NÃO USAR
    },
    "deliveryMethodId": 0 // NÃO USAR
  },
  "order_items": [ // Produtos que foram vendidos
    {
      "quantity": 1, // Quantidade vendida
      "quantity_multiple": 1, // NÃO USAR
      "unit_price": 28.00, // Valor unitário de venda deste produto
      "cost": 18.85, // Valor de custo preenchido no Magis5 para o produto
      "discount": 0.00, // NÃO USAR
      "item": {
        "seller_custom_field": "13319", // Código / SKU do produto no ERP
        "id": "EXEMPLO", // ID interno do produto (geralmente não é usado)
        "title": "AMPOLA TERMICA P/REPOSICAO GARRAFAS 1,0 L - 50750", // Título do produto
        "ean": "7891023005201", // Código de barras do produto
        "eanInvoice": "7891023005201", // Código de barras da nota fiscal
        "defaultPicture": "https://example.com/arquivo-exemplo.jpg", // Foto principal no Magis5
        "location": "A1/32 - CD04 / A08-6" // Localização cadastrada no produto
      },
      "orderSpecifications": [], // NÃO USAR
      "quantityBarCodeValidated": 0, // NÃO USAR
      "unitMeasurement": "UN" // Unidade de medida (geralmente utilizada a do ERP)
    }
  ],
  "invoices": [
    {
      "id": "EXEMPLO", // ID da nota fiscal (geralmente não é usado)
      "key": "EXEMPLO", // Chave de acesso da NF-e (44 dígitos)
      "number": "EXEMPLO", // Número da nota fiscal
      "line": "1", // Série da nota fiscal
      "issue_date": "2024-10-11 09:53:02", // Data de emissão da nota fiscal
      "totalValue": 62.00, // Valor total da nota fiscal
      "urlXml": "https://example.com/arquivo-exemplo.xml" // URL do XML da nota
    }
  ],
  "status": "ready_to_print", // Status no Magis5 (ready_to_print = Ag. Separação)
  "subStatusExpedition": "in_expedition", // Status da expedição no Magis5
  "storeId": "EXEMPLO", // Código da filial (usado para operar com multi-empresa)
  "externalId": "EXEMPLO", // Código do pedido no marketplace
  "totalValue": 41.13, // Total do pedido
  "channel": "EXEMPLO", // Código interno Magis5 referente à loja
  "channelName": "Shopee - NOME LOJA", // Nome da loja no Magis5
  "discount": 0.00, // Desconto do pedido a aplicar na nota fiscal
  "totalTax": 0.00, // Juros/taxas para o campo "outras despesas" da nota fiscal
  "expeditionBlock": "Bloco_11-10-2022_11:01:50", // NÃO USAR
  "expeditionLevel": "mono", // NÃO USAR
  "dateCreated": "2024-10-07T20:06:20Z", // Data do pedido
  "dateApproved": "2024-10-07T20:06:20Z", // Data de aprovação do pedido
  "dateLastUpdated": "2024-10-11T16:51:42Z", // Última atualização no Magis5
  "saleFee": 3.92, // Comissão / tarifa cobrada pelo marketplace
  "tags": [
    {
      "url": "https://example.com/arquivo-exemplo.pdf" // URL da etiqueta de envio
    }
  ],
  "orderConciliation": { // Dados para conciliação e relatórios gerenciais (não usados para criar pedido no ERP)
    "freight": 13.13, // Valor do frete do pedido
    "freightToPay": 0.00, // Valor do frete grátis
    "totalTax": 0.00, // Total de juros
    "discount": 0.00, // Total de descontos
    "totalValueWithFreight": 41.13, // Total do pedido com frete
    "totalValueWithoutFreight": 28.00, // Total do pedido sem frete
    "totalCost": 18.85, // Total de custos do produto
    "unitCost": 18.85, // Custo unitário do produto
    "unitValueItem": 28.00, // Valor unitário só do produto de venda
    "totalValueItem": 28.00, // Valor total só do produto de venda
    "percentageComission": 14.00, // Percentual (%) de comissão cobrado
    "comissionValue": 3.92, // Valor em reais da comissão
    "totalNetWithoutCostProduct": 18.36, // Margem líquida deduzindo todos os custos
    "totalNet": 37.21, // Margem sem deduzir custo do produto
    "percentageNetWithoutProduct": 44.60 // Representação (%) de totalNetWithoutCostProduct
  }
}`;

const patchOrderPayload = `{
  "queueStatus": "INTEGRADO"
}`;

const invoiceXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe35..." versao="4.00">
      <!-- (XML COMPLETO DA NOTA FISCAL EMITIDA) -->
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <!-- Protocolo de autorização SEFAZ -->
    </infProt>
  </protNFe>
</nfeProc>`;

const singleStockPayload = `{
  "stocks": [
    {
      "sku": "5BL-M",
      "totalStock": 200,
      "warehouses": [
        {
          "id": 1,
          "title": "Estoque Único",
          "stock": 200,
          "consider": true,
          "stockVirtual": 200
        }
      ]
    }
  ]
}`;

const multiStockPayload = `{
  "stocks": [
    {
      "sku": "5BL-M",
      "totalStock": 200,
      "warehouses": [
        {
          "id": 1,
          "title": "Filial 1",
          "stock": 50,
          "consider": true,
          "stockVirtual": 50
        },
        {
          "id": 2,
          "title": "Filial 2",
          "stock": 100,
          "consider": true,
          "stockVirtual": 100
        },
        {
          "id": 3,
          "title": "Filial 3",
          "stock": 50,
          "consider": true,
          "stockVirtual": 50
        }
      ]
    }
  ]
}`;

export function SuggestedDevelopment() {
  return (
    <>
      <p>
        Documentação de integração focada no desenvolvimento das integrações. Essa documentação foi construída de uma forma mais enxuta para que seja feito o melhor proveito entre ERP e HUB.
      </p>

      <div className="callout">
        <strong>Objetivos:</strong> Os objetivos dessa integração são obter uma gestão organizada a nível de produtos, estoque e pedidos.
      </div>

      <h2>Integração de Produtos</h2>
      <h3>Cadastrar um produto no Magis5</h3>
      <ul>
        <li>O ideal no momento de criar um produto no Magis5 é que isso seja <strong>on-time</strong>, ou seja, sempre que for cadastrado um produto <strong>NOVO</strong> no ERP, também realizar este cadastro no Magis5.</li>
        <li>Para criar um produto no Magis5 será utilizado o endpoint <code>/v1/products</code>.</li>
        <li>Se tratando de uma integração com um ERP não é necessário preencher todos os campos, mas sim os campos que o ERP possui ou tem controle gerencial, como por exemplo: Código/Sku, Título, Marca, Modelo, EAN, EAN Tributável, NCM, Origem, Cest, Condição do produto, Localização, Dimensões (Altura, Largura, Comprimento, Peso), Descrição.</li>
        <li><strong>O único campo obrigatório para criação de um produto é o Código/Sku, preenchido no campo “id”.</strong></li>
      </ul>
      <Endpoints rows={[["POST", "/v1/products", "Cadastrar produto no Magis5. O campo id identifica o SKU."]]} />
      <Code label="Exemplo de payload dos dados · POST /v1/products">{productCreatePayload}</Code>
      <Source href="#api/api-docs?view=reference&item=post-products">Consultar documentação do endpoint POST /v1/products</Source>

      <h3>Atualizar um produto no Magis5</h3>
      <ul>
        <li>Para atualizar um produto no Magis5 é indicado a utilização do método <strong>PATCH</strong> (para que dados preenchidos posteriormente não sejam apagados).</li>
        <li>Se tratando de uma integração com um ERP não é necessário preencher todos os campos, mas sim os campos que o ERP possui ou tem controle gerencial, como por exemplo: Título, Marca, Modelo, EAN, EAN Tributável, NCM, Origem, Cest, Condição do produto, Localização, Dimensões (Altura, Largura, Comprimento, Peso), Descrição.</li>
        <li>Para atualizar um produto no Magis5 será utilizado o endpoint <code>/v1/products/{'{SKU}'}</code>.</li>
        <li>Este campo SKU é o mesmo enviado anteriormente na criação do produto no campo <strong>“id”</strong>.</li>
        <li>Seguindo a ideia de atualizar somente os campos que o ERP tem controle, essa atualização fica da seguinte forma:</li>
      </ul>
      <Endpoints rows={[["PATCH", "/v1/products/{SKU}", "Atualizar somente os campos sob controle do ERP."]]} />
      <Code label="Exemplo de payload de atualização · PATCH /v1/products/{SKU}">{productPatchPayload}</Code>
      <Source href="#api/api-docs?view=reference&item=patch-products-sku">Consultar documentação do endpoint PATCH /v1/products/{'{sku}'}</Source>

      <h2>Integração de Pedidos</h2>
      <h3>Mapeamento dos dados de um pedido</h3>
      <p>
        Abaixo segue a estrutura completa dos dados de um pedido retornado pela API, com anotações detalhadas de cada campo:
      </p>
      <Code label="Mapeamento completo dos dados de um pedido">{orderMappingPayload}</Code>

      <h3>Buscando os pedidos para serem criados no ERP</h3>
      <ul>
        <li>Os pedidos que devem ser criados no ERP devem ser somente os pedidos que estiverem no status de <strong>“Ag. Separação” (<code>ready_to_print</code>)</strong>, somente este status garante um pedido completo e já com todos os dados necessários para ser processado no ERP.</li>
        <li>Busca para buscar a lista de pedidos a serem criados no ERP: <code>/v1/orders?status=ready_to_print&queueStatus=blank</code></li>
        <li>O parâmetro <code>queueStatus</code> irá garantir que o mesmo pedido não se repita ao realizar a consulta acima novamente, mas para isso será necessário atualizar o campo <code>queueStatus</code> assim que o pedido for criado no ERP.</li>
        <li>Para isso, será necessário realizar um PATCH com os seguintes dados:</li>
      </ul>
      <Endpoints rows={[
        ["GET", "/v1/orders?status=ready_to_print&queueStatus=blank", "Buscar lista de pedidos a serem criados no ERP."],
        ["PATCH", "/v1/orders/{order.id}", "Atualizar queueStatus do pedido no Magis5."]
      ]} />
      <Code label="Body do PATCH · /v1/orders/{order.id}">{patchOrderPayload}</Code>
      <div className="callout">
        O valor <strong>“INTEGRADO”</strong> pode ser substituído por qualquer outra informação, o campo <code>queueStatus</code> é livre e pode ser colocado qualquer informação.<br/>
        Como a consulta constante aos pedidos <code>ready_to_print</code> será passado por parâmetro o <code>queueStatus=blank</code>, isso faz com que os pedidos não se repitam mais neste processo de criação de pedido.
      </div>
      <Source href="#api/api-docs?view=reference&item=get-orders">Consultar documentação do endpoint GET /v1/orders</Source>

      <h3>Enviando os dados de faturamento</h3>
      <p>
        Após subir o pedido para o ERP e atualizar o <code>queueStatus</code>, seguimos para a próxima etapa que é o faturamento, emissão de nota fiscal e envio do XML para o pedido no Magis5.
      </p>
      <p>Para isso, será necessário realizar um POST com os seguintes dados:</p>
      <div className="two-col">
        <div className="panel">
          <h2>Expedição no ERP / WMS</h2>
          <p><code>/v1/invoices/{'{completeOrderNumber}'}?releaseOrder=true</code></p>
          <p>
            Com valor <strong>true</strong>, o pedido avançará para Faturado (<code>billed</code>), e terá essa NF-e enviada ao canal de venda, simulando a expedição realizada no painel Magis5, para que a etiqueta de envio possa ser coletada via <code>GET /v1/orders/{'{completeOrderNumber}'}</code>, na estrutura <code>tags[]</code> do pedido.
          </p>
        </div>
        <div className="panel">
          <h2>Expedição no Magis5</h2>
          <p><code>/v1/invoices/{'{completeOrderNumber}'}?releaseOrder=false</code></p>
          <p>
            Com valor <strong>false</strong>, o pedido permanecerá em Ag. Separação (<code>ready_to_print</code>), para que seja exibido em nosso módulo de Expedição e possa ser expedido efetivamente pelo painel do HUB Magis5.
          </p>
        </div>
      </div>
      <Endpoints rows={[["POST", "/v1/invoices/{completeOrderNumber}", "Enviar o XML da NF-e para o pedido."]]} />
      <Code label="Body da requisição · XML completo da nota fiscal">{invoiceXmlPayload}</Code>
      <div className="callout">
        <strong>Atenção:</strong> Só será aceito XMLs que tenham a tag <code>{"<?xml"}</code> e <code>{"<nfeProc>"}</code>.<br/>
        Geralmente uma nota fiscal que não tem <code>{"<nfeProc>"}</code> significa que a nota fiscal ainda não foi emitida e autorizada 100%.
      </div>
      <Source href="#api/api-docs?view=reference&item=post-invoices-completeordernumber">Consultar documentação do endpoint POST /v1/invoices/{'{completeOrderNumber}'}</Source>

      <h2>Integração Estoques</h2>
      <h3>Sincronizar estoque com o Magis5</h3>
      <ul>
        <li>Para termos uma integração ágil e de qualidade devemos atualizar estoque no Magis5 sempre quando houver alguma movimentação dentro do ERP. Ou seja, <strong>SEMPRE</strong> que tivermos uma saída, entrada, balanço, o mesmo deve ser enviado ao Magis5.</li>
        <li>A atualização pode ser realizada em lote, enviando múltiplos SKUs para atualização no array “stocks”, recomendando-se o envio de, no máximo, 50 SKUs por requisição.</li>
        <li>É possível realizar a sincronização de estoque no Magis5 de forma mais simples, ou seja, sem a necessidade de especificar múltiplos estoques por depósito, mas também é possível sincronizar os estoques por pontos de estoque.</li>
        <li>Para atualizar estoque no Magis5 será utilizado o endpoint <code>/v1/callbacks/stocks</code>.</li>
      </ul>
      <Endpoints rows={[["PUT", "/v1/callbacks/stocks", "Sincronizar estoque com o Magis5."]]} />
      <Code label="Exemplo de payload dos dados para atualização sem a necessidade de informar múltiplos depósitos">{singleStockPayload}</Code>
      <Code label="Exemplo de payload dos dados para atualização dos estoques por depósito">{multiStockPayload}</Code>
      <Source href="#api/api-docs?view=reference&item=put-callbacks-stocks">Consultar documentação do endpoint PUT /v1/callbacks/stocks</Source>
    </>
  );
}
