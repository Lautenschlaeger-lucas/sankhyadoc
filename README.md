# Jornada de Implantação Magis5 + Sankhya

Guia responsivo em português com sete tópicos, baseado no PDF fornecido.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Validação

```sh
npm run build
npx tsc --noEmit
```

## Conteúdo e imagens

O conteúdo e a navegação estão em `app/page.tsx`; o estilo está em `app/globals.css`.
Os componentes `Photo` identificam as capturas reais do painel que ainda precisam ser incluídas. Não há telas fictícias nem imagens do painel neste projeto. Para incluir uma captura, salve o arquivo em `public/processos/` e substitua o respectivo espaço por uma imagem com descrição acessível.

As permissões são documentação, sem conexão ativa com o ERP. O site não coleta credenciais e não executa alterações no Sankhya. Não há login separado para o tópico de integração.

A configuração Sites está registrada, mas esta entrega foi colocada localmente na pasta solicitada e ainda não foi publicada.

## Vercel

Build compatível: `npm run build:vercel` (saída: `dist-vercel`). Configuração: `vercel.json`.

Deploy enviado à Vercel em 07/09/2026:
https://sankhyadoc-lautenschlaeger-lucas-projects.vercel.app

O endereço exige autenticação Vercel. A conexão utilizada conseguiu criar o deploy, mas retornou 403 ao consultar o status no escopo da conta. Confirme o resultado no painel antes de compartilhar com visitantes externos.
