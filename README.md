# Jornada de Implantação Magis5 + Sankhya

Guia responsivo em português com sete tópicos e abas para integração Sankhya e API pública Magis5. A seleção da integração é mantida durante a navegação entre os tópicos.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Validação

```sh
npm run build:vercel
npx tsc --noEmit
node scripts/verify-api-docs.mjs
```

## Conteúdo e imagens

O conteúdo Sankhya e a navegação estão em `app/page.tsx`; os resumos da API estão em `app/api-topic.tsx` e o portal completo em `app/api-docs.tsx`; o estilo está em `app/globals.css`.

A aba API reúne os tópicos de implantação e uma documentação completa com 49 operações, 142 schemas, 51 exemplos Postman e 14 guias e tutoriais. Busca, navegação por grupos, links diretos, exemplos copiáveis e download da collection Postman funcionam no próprio site. Os dados ficam em `public/api-data/` e as 14 imagens em `public/api-assets/`, sem depender do Stoplight para carregar.

A migração preserva os contratos e textos das fontes. Exemplos gerados de schemas são identificados como ilustrativos. Todas as 51 requisições Postman possuem contrato correspondente no OpenAPI público. Diagramas antigos de faturamento receberam uma observação sobre o método atual.

Tokens, dados pessoais e XML fiscal reais foram substituídos por variáveis ou exemplos. Uma captura que expunha token foi substituída por instruções textuais. O arquivo Postman original não foi modificado. O site não executa requisições à API nem coleta credenciais.

O script `scripts/migrate-api-docs.py` recebe, nesta ordem, o OpenAPI exportado, a collection original, a pasta com os 14 artigos JSON e o manifesto de imagens. Ele gera os arquivos públicos e `migration-report.json`. Para atualizar apenas o Swagger, sem reexportar os artefatos do Stoplight, execute: `python3 scripts/migrate-api-docs.py .cache/openapi.json` — assim requisições e guias do catálogo anterior são preservados e apenas o OpenAPI é substituído. O verificador confere contagens, referências de schemas, links locais, imagens e variáveis da collection.

## Sincronização automática

`npm run sync:api` baixa o Swagger público (`scripts/fetch-openapi.mjs`), roda a migração em modo preservado e valida o resultado. O workflow `.github/workflows/api-sync.yml` executa essa rotina semanalmente (e sob demanda via *workflow_dispatch*); se o `public/api-data/` ou o `.cache/openapi.json` mudarem, ele valida o build, commita e publica, disparamando o deploy na Vercel.

Os componentes `Photo` do guia Sankhya ainda indicam capturas a incluir; os guias da API já incluem as imagens migradas.

As permissões são documentação, sem conexão ativa com o ERP. O site não coleta credenciais e não executa alterações no Sankhya. Não há login separado para o tópico de integração.

A configuração Sites está registrada, mas esta entrega foi colocada localmente na pasta solicitada e ainda não foi publicada.

## Vercel

Build compatível: `npm run build:vercel` (saída: `dist-vercel`). Configuração: `vercel.json`.

Deploy enviado à Vercel em 07/09/2026:
https://sankhyadoc-lautenschlaeger-lucas-projects.vercel.app

O endereço exige autenticação Vercel. A conexão utilizada conseguiu criar o deploy, mas retornou 403 ao consultar o status no escopo da conta. Confirme o resultado no painel antes de compartilhar com visitantes externos.
