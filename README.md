# Automação CNPJ — Versão Web (Next.js / Vercel)
**by Leonardo Martelli**

Migração do app original em Go (`Consulta CNPJ.exe`) para uma versão 100%
web.

- Login com senha
- Upload de planilha `.xlsx` e leitura da coluna `CNPJ`
- Consulta cadastral (BrasilAPI, com fallback para CNPJ.ws)
- Consulta Simples Nacional / SIMEI
- Barra de progresso e tabela de resultados em tempo real
- Botão "Parar" (cancelar consulta em andamento)
- Exportar Excel (com as mesmas cores condicionais por status) e CSV
- Tema claro/escuro

---

## O que mudou por baixo do capô (e por quê)

O `.exe` original mantinha um **processo rodando continuamente**: um job em
segundo plano consultava os CNPJs um por um, e o navegador ficava perguntando
("polling") o andamento a cada 800ms.

O Vercel **não hospeda esse tipo de processo**. Lá, cada requisição roda numa
função "serverless" que nasce, responde e morre — não existe estado
compartilhado confiável entre requisições nem um job contínuo em segundo
plano.

Por isso, o loop de consulta passou a rodar **no navegador**: o frontend
percorre a lista de CNPJs e chama a API uma vez por CNPJ, aguardando 1
segundo entre cada chamada — exatamente o mesmo comportamento visual (barra
de progresso, tabela atualizando ao vivo, "Parar" funcionando), só que sem
depender de estado no servidor. Como bônus, isso resolve uma limitação do
app original: antes só uma consulta podia rodar por vez, para *todo mundo*
que usasse o servidor; agora cada pessoa tem sua própria consulta
independente.

### Outras adaptações

- **Senha de acesso:** o hash no código Go original não correspondia à senha
  documentada no README (`cnpj2025`) — na prática, a senha que sempre
  funcionou é `Governance#2026!Global` (é o que aparecia impresso no
  terminal ao abrir o `.exe`). Mantive esse valor. Para trocar, veja a seção
  abaixo.

## Estrutura do projeto

```
cnpj-web/
├── app/
│   ├── layout.js              ← layout raiz (carrega style.css)
│   ├── page.js                ← tela (mesmo HTML da versão original)
│   └── api/
│       ├── login/route.js         ← autenticação
│       ├── upload/route.js        ← leitura da planilha
│       ├── consultar-cnpj/route.js ← consulta 1 CNPJ (cadastral ou simples)
│       └── exportar/route.js      ← gera o Excel/CSV de saída
├── lib/
│   ├── cnpj.js                ← validação e consulta (porta de backend/cnpj.go)
│   └── excel.js                ← leitura/escrita de .xlsx (porta de backend/excel.go)
├── public/
│   ├── style.css               ← visual (idêntico ao original)
│   └── app.js                  ← lógica do navegador (login, loop de consulta, tabelas)
└── package.json
```


## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Senha padrão: **Governance#2026!Global**

-------

## Trocar a senha

1. Gere o hash da nova senha:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('SUA_NOVA_SENHA').digest('hex'))"
```
2. Abra `app/api/login/route.js`
3. Substitua o valor de `SENHA_HASH`
4. Publique novamente (`vercel --prod` ou um novo commit/push, se estiver
   usando integração com Git)
