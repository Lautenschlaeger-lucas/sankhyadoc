# Jornada de Implantação Magis5 + Sankhya

Guia responsivo em português com uma tela inicial para escolher Sankhya ou API Magis5. Cada integração tem sua própria área, com o botão Trocar integração para retornar à seleção.

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

`npm run sync:api` baixa o Swagger público, migra e valida o catálogo. O workflow `.github/workflows/api-sync.yml` consulta a fonte aproximadamente a cada 15 minutos, com horários sujeitos à fila do GitHub Actions. Também aceita execução manual e o evento `repository_dispatch` com `event_type: swagger-updated`, que o CTO pode enviar pela rotina de publicação da API. As credenciais para disparar esse evento ficam apenas nessa rotina, nunca no site. O workflow valida os arquivos antes de publicar e mantém a versão anterior se falhar.

O navegador lê o catálogo público de `raw.githubusercontent.com/Lautenschlaeger-lucas/sankhyadoc/main/public/api-data/catalog.json` ao abrir a documentação e a cada cinco minutos enquanto ela estiver visível. A cópia local aparece primeiro e permanece disponível em caso de falha. Não há backend a instalar no domínio. É necessário publicar este novo ZIP uma vez para habilitar o comportamento; novas mudanças de endpoints e schemas passam a chegar sem reenviar o ZIP. Textos editoriais, guias, imagens e a collection Postman continuam vinculados à versão estática e precisam de atualização própria.

Em 23/09/2026, o Swagger não retornou `Access-Control-Allow-Origin` na consulta com Origin externo; o catálogo público do GitHub retornou `*`. Por isso a implementação usa o espelho validado em vez de chamar o Swagger diretamente no navegador. Se o domínio utilizar Content-Security-Policy, o gestor deve permitir `https://raw.githubusercontent.com` em `connect-src`, além de `self`. O repositório precisa continuar público e o workflow precisa estar habilitado com permissão para gravar em `main`. Restrições de branch ou Actions podem exigir ajuste pelo administrador. GitHub pode atrasar execuções e desativar agendas em repositórios públicos inativos.

O status “Catálogo online” confirma a leitura do espelho, não que o Swagger acabou de ser sincronizado. O histórico do workflow informa a última consulta à origem. Campos removidos do Swagger somem da referência, mas menções em guias são editoriais e geram avisos para revisão.

As permissões são documentação, sem conexão ativa com o ERP. O site não coleta credenciais e não executa alterações no Sankhya. Não há login separado para o tópico de integração.

A configuração Sites está registrada, mas esta entrega foi colocada localmente na pasta solicitada e ainda não foi publicada.

## Vercel

Build compatível: `npm run build:vercel` (saída: `dist-vercel`). Configuração: `vercel.json`.

Deploy enviado à Vercel em 07/09/2026:
https://sankhyadoc-lautenschlaeger-lucas-projects.vercel.app

O endereço exige autenticação Vercel. A conexão utilizada conseguiu criar o deploy, mas retornou 403 ao consultar o status no escopo da conta. Confirme o resultado no painel antes de compartilhar com visitantes externos.

## Pacote para hospedagem estática

Execute `npm run build:static` para gerar `dist-vercel/` e atualizar `magis5-central-de-implantacao.zip`. Envie todo o conteúdo do ZIP ao gestor do domínio: index.html, CSS, JavaScript, imagens e dados JSON. Não é necessário Node.js no servidor de hospedagem. O site precisa ser servido por HTTP/HTTPS, não aberto por file://.

A documentação apresenta exemplos JSON dos schemas, com os detalhes de campos recolhidos. A navegação Postman e o download OpenAPI foram removidos da interface; a collection continua disponível para download.

## Aparência

O botão no cabeçalho alterna entre modo claro e escuro em todas as áreas. A primeira visita acompanha o tema do sistema; a escolha manual fica salva no navegador em `magis5-theme`. O arquivo estático `theme-init.js` aplica a preferência antes da renderização. Inclua esse arquivo na publicação junto aos demais arquivos do ZIP.
