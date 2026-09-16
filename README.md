# 📊 Automação CNPJ — Versão Web

**by Leonardo Martelli**

> Ferramenta que consulta dados de CNPJ em massa (situação cadastral, razão
> social, endereço, CNAE, Simples Nacional/SIMEI...) a partir de uma
> planilha, e devolve tudo pronto pra baixar em Excel ou CSV.
>
> Esta é a versão web do programa que antes rodava como um `.exe` no
> computador — agora ela fica hospedada online, com o mesmo visual e as
> mesmas funções de sempre.

---

## 🧭 Índice

1. [Para que serve](#-para-que-serve)
2. [Como acessar](#-como-acessar)
3. [Passo a passo de uso](#-passo-a-passo-de-uso)
4. [Entendendo a tela](#-entendendo-a-tela)
5. [Perguntas frequentes](#-perguntas-frequentes)
6. [Para quem for hospedar/manter o projeto](#-para-quem-for-hospedarmanter-o-projeto)

---

## 🎯 Para que serve

Em vez de consultar CNPJ um por um em algum site, você:

1. Sobe uma planilha com uma lista de CNPJs;
2. A ferramenta consulta todos, automaticamente, um atrás do outro;
3. Você acompanha o andamento em tempo real na tela;
4. No final, baixa uma planilha pronta com tudo organizado.

Ela tem **dois módulos**, escolhidos na barra lateral:

| Módulo | O que traz |
|---|---|
| 📄 **Comprovante de Inscrição** | Razão social, nome fantasia, endereço completo, CNAE, situação cadastral, data de abertura, etc. — o mesmo que sai no cartão CNPJ da Receita. |
| 📊 **Simples / SIMEI** | Se a empresa é optante pelo Simples Nacional e/ou enquadrada no SIMEI. |

---

## 🔑 Como acessar

O acesso é protegido por senha. **A senha não está neste documento** — peça
para quem te enviou este link/projeto.

> Vai gerenciar o projeto e precisa **definir ou trocar** a senha? Veja a
> seção [Para quem for hospedar/manter o projeto](#-para-quem-for-hospedarmanter-o-projeto).

---

## 🚀 Passo a passo de uso

### 1️⃣ Prepare sua planilha

Crie (ou use) um arquivo `.xlsx` com **uma coluna chamada `CNPJ`** —
não importa a posição dela na planilha, só o nome do cabeçalho precisa
bater. Cada linha abaixo dela é um CNPJ (pode estar com ou sem
pontuação, tanto faz).

```
 CNPJ
 11.222.333/0001-81
 44555666000199
 ...
```

### 2️⃣ Escolha o módulo

Na barra lateral esquerda, clique em **"📄 Comprovante de Inscrição"** ou
**"📊 Simples / SIMEI"**, dependendo do que você precisa consultar.

### 3️⃣ Envie o arquivo

Clique em **"📁 Selecionar Excel (.xlsx)"** e escolha sua planilha.
Assim que ela for lida, você verá quantos CNPJs foram encontrados,
tipo: `✅ minha_planilha.xlsx — 150 CNPJ(s)`.

### 4️⃣ Inicie a consulta

Clique em **"▶ Iniciar Consulta"**. A partir daí:

- A barra de progresso enche conforme os CNPJs vão sendo processados;
- A tabela abaixo é preenchida ao vivo, um CNPJ por vez;
- As consultas rodam com um intervalo fixo de ~1 segundo entre elas —
  é proposital, para não sobrecarregar as fontes de dados.

Mudou de ideia no meio do caminho? Clique em **"⏹ Parar"** a qualquer
momento — o que já foi consultado até ali fica salvo e disponível pra
exportar.

### 5️⃣ Exporte o resultado

Quando terminar (ou depois de parar), clique em:

- **"📥 Exportar Excel"** (módulo Comprovante de Inscrição) — baixa um
  `.xlsx` com todas as colunas, já formatado e com cores por status.
- **"📥 Exportar CSV"** (módulo Simples/SIMEI) — baixa um `.csv` com o
  resultado.

Pronto! O arquivo cai na pasta de downloads do seu navegador, do jeitinho
que sempre foi.

---

## 🖥️ Entendendo a tela

| Elemento | O que significa |
|---|---|
| 🟢 Linha **verde** | CNPJ consultado com sucesso (`OK`) |
| 🔴 Linha **vermelha** | Erro na consulta (`ERRO`) — geralmente instabilidade das fontes de dados |
| 🟡 Linha **amarela** | CNPJ com formato inválido (`INVALIDO`) — confira os dígitos na planilha |
| **Total / Sucesso / Erros / Inválidos** | Contadores em tempo real, na barra lateral |
| ☀ / 🌙 (topo da barra lateral) | Alterna entre tema claro e escuro |

---

## ❓ Perguntas frequentes

**A consulta trava se eu fechar a aba do navegador?**
Sim — a consulta roda enquanto a página está aberta. Se fechar antes de
terminar, é preciso recomeçar. Evite trocar de aba por muito tempo ou
deixar o computador hibernar durante o processo.

**Posso consultar várias planilhas ao mesmo tempo, em abas diferentes?**
Sim! Cada aba/pessoa tem sua própria consulta, independente das outras.

**Por que a consulta não é instantânea?**
O intervalo de ~1 segundo entre CNPJs é proposital, para respeitar os
limites das fontes de dados públicas usadas nas consultas.

**Uma linha veio com erro. E agora?**
Normalmente é uma instabilidade passageira da fonte de dados. Vale
rodar a consulta de novo só para os CNPJs que deram erro.

**Minha planilha tem 2 mil linhas, funciona?**
Sim, sem problema de quantidade de CNPJs. O único limite técnico é o
**tamanho do arquivo enviado** (até 4,5 MB) — o que é bem mais planilha
do que normalmente se usa aqui.

---

## 🛠️ Para quem for hospedar/manter o projeto

<details>
<summary><strong>Clique para expandir — detalhes técnicos</strong></summary>

### O que mudou em relação ao `.exe` original

O `.exe` original mantinha um processo rodando continuamente em segundo
plano para processar a fila de CNPJs. Hospedagem serverless (como o
Vercel) não sustenta esse tipo de processo — cada requisição nasce,
responde e morre. Por isso, o loop de consulta passou a rodar **no
navegador**: o frontend chama a API uma vez por CNPJ, no mesmo
intervalo de 1s, mantendo a experiência idêntica (progresso ao vivo,
tabela, "Parar" funcionando). Como efeito colateral positivo: antes só
uma consulta rodava por vez para todo mundo; agora cada pessoa tem a
sua, em paralelo.

### Estrutura do projeto

```
cnpj-web/
├── app/
│   ├── layout.js                    ← layout raiz (carrega style.css)
│   ├── page.js                      ← tela (mesmo HTML da versão original)
│   └── api/
│       ├── login/route.js           ← autenticação
│       ├── upload/route.js          ← leitura da planilha
│       ├── consultar-cnpj/route.js  ← consulta 1 CNPJ (cadastral ou simples)
│       └── exportar/route.js        ← gera o Excel/CSV de saída
├── lib/
│   ├── cnpj.js                      ← validação e consulta (porta de backend/cnpj.go)
│   └── excel.js                     ← leitura/escrita de .xlsx (porta de backend/excel.go)
├── public/
│   ├── style.css                    ← visual (idêntico ao original)
│   └── app.js                       ← lógica do navegador (login, loop de consulta, tabelas)
└── package.json
```

| Quer mexer em... | Arquivo |
|---|---|
| Cores, fontes, layout | `public/style.css` |
| Textos, estrutura de telas | `app/page.js` |
| Comportamento dos botões/tabelas/loop de consulta | `public/app.js` |
| Senha de acesso | `app/api/login/route.js` → `SENHA_HASH` |
| Lógica de consulta de CNPJ | `lib/cnpj.js` |
| Colunas/estilo do Excel exportado | `lib/excel.js` |

### Rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### Publicar no Vercel

**Pelo site:** suba a pasta para um repositório Git (GitHub/GitLab/Bitbucket),
importe em [vercel.com](https://vercel.com) → **Add New → Project** →
**Deploy**. O Vercel reconhece Next.js automaticamente, sem configuração.

**Pela linha de comando:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Definir ou trocar a senha

```bash
node -e "console.log(require('crypto').createHash('sha256').update('SUA_NOVA_SENHA').digest('hex'))"
```
Copie o resultado e cole em `app/api/login/route.js`, na constante
`SENHA_HASH`. Publique novamente para valer.

### Limites técnicos herdados da hospedagem

- **Tamanho máximo de upload:** 4,5 MB por requisição (limite fixo do
  Vercel, não configurável).
- **Retentativas de consulta:** ajustadas para caber com folga no tempo
  de execução de uma função serverless — o resultado final é o mesmo
  do app original, só a agressividade da retentativa em caso de erro
  429 foi reduzida.
- **Rate limit do login (5 tentativas / 30s):** vive na memória de uma
  instância de função; pode resetar entre instâncias frias. Não é uma
  proteção forte — assim como no `.exe` original, que só protegia o
  processo local.

</details>
