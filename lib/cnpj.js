// Porta fiel de backend/cnpj.go (Go) para Node.js.
// Mantém os mesmos nomes de campo (snake_case) que o frontend original espera.

export function limparCNPJ(cnpj) {
  return String(cnpj || "").trim().replace(/\D/g, "");
}

export function formatarCNPJ(cnpj) {
  const c = limparCNPJ(cnpj);
  if (c.length === 14) {
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  }
  return cnpj;
}

export function validarCNPJ(cnpj) {
  const c = limparCNPJ(cnpj);
  if (c.length !== 14) return false;

  const todosIguais = c.split("").every((ch) => ch === c[0]);
  if (todosIguais) return false;

  const calc = (s, pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += parseInt(s[i], 10) * pesos[i];
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(c.slice(0, 12), p1);
  const d2 = calc(c.slice(0, 13), p2);
  return c[12] === String(d1) && c[13] === String(d2);
}

function sv(obj, key) {
  if (!obj || obj[key] === undefined || obj[key] === null) return "";
  return String(obj[key]).trim();
}

function formatarCnaes(lista) {
  if (!Array.isArray(lista)) return "";
  const parts = [];
  for (const item of lista) {
    if (!item || typeof item !== "object") continue;
    let cod = sv(item, "codigo");
    if (!cod) cod = sv(item, "subclasse");
    const desc = sv(item, "descricao");
    if (cod && desc) parts.push(`${cod} - ${desc}`);
    else if (cod) parts.push(cod);
  }
  return parts.join(" | ");
}


// NOVA FUNÇÃO: Formata o logradouro juntando o Tipo (Av, Rua, Rodovia) com o Nome
function formatarLogradouro(tipo, nome) {
  if (tipo && nome) {
    return `${tipo} ${nome}`.trim();
  }
  return nome || tipo || "";
}

=======
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
function parseBrasilAPI(data, cnpjInput, cnpj) {
  const cnaeSec = Array.isArray(data.cnaes_secundarios) ? data.cnaes_secundarios : [];
  let natDesc = sv(data, "natureza_juridica");
  let natCod = sv(data, "codigo_natureza_juridica");
  if (!natCod && natDesc.includes(" - ")) {
    const pts = natDesc.split(" - ");
    natCod = pts[0].trim();
    natDesc = pts.slice(1).join(" - ").trim();
  }
  let ddd = sv(data, "ddd_telefone_1");
  const tel = sv(data, "telefone");
  if (ddd && !ddd.startsWith("(")) ddd = `(${ddd})`;
  const telefone = `${ddd} ${tel}`.trim();

  return {
    cnpj_input: cnpjInput,
    cnpj_formatado: formatarCNPJ(cnpj),
    data_abertura: sv(data, "data_inicio_atividade"),
    razao_social: sv(data, "razao_social"),
    nome_fantasia: sv(data, "nome_fantasia"),
    natureza_juridica_cod: natCod,
    natureza_juridica_desc: natDesc,
    cnae_principal_cod: sv(data, "cnae_fiscal"),
    cnae_principal_desc: sv(data, "cnae_fiscal_descricao"),
    cnaes_secundarios: formatarCnaes(cnaeSec),
    
    // CORREÇÃO: Aplicação da função para juntar o tipo e o nome da via na BrasilAPI
    logradouro: formatarLogradouro(sv(data, "descricao_tipo_de_logradouro"), sv(data, "logradouro")),
    
=======
    logradouro: sv(data, "logradouro"),
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
    numero: sv(data, "numero"),
    complemento: sv(data, "complemento"),
    bairro: sv(data, "bairro"),
    cep: sv(data, "cep"),
    municipio: sv(data, "municipio"),
    uf: sv(data, "uf"),
    email: sv(data, "email"),
    telefone,
    situacao: sv(data, "descricao_situacao_cadastral"),
    data_situacao: sv(data, "data_situacao_cadastral"),
    status: "OK",
    erro_mensagem: "",
  };
}

function parseCNPJws(data, cnpjInput, cnpj) {
  const estab = data.estabelecimento && typeof data.estabelecimento === "object" ? data.estabelecimento : {};
  const nat = data.natureza_juridica && typeof data.natureza_juridica === "object" ? data.natureza_juridica : {};
  const cidade = estab.cidade && typeof estab.cidade === "object" ? estab.cidade : {};
  const estado = estab.estado && typeof estab.estado === "object" ? estab.estado : {};
  const atPrinc = estab.atividade_principal && typeof estab.atividade_principal === "object" ? estab.atividade_principal : {};
  const atSec = Array.isArray(estab.atividades_secundarias) ? estab.atividades_secundarias : [];

  const tel1 = sv(estab, "telefone1");
  const tel2 = sv(estab, "telefone2");
  let telefone = tel1;
  if (tel2 && tel2 !== tel1) {
    telefone = tel1 ? `${tel1} / ${tel2}` : tel2;
  }

  return {
    cnpj_input: cnpjInput,
    cnpj_formatado: formatarCNPJ(cnpj),
    data_abertura: sv(estab, "inicio_atividade"),
    razao_social: sv(data, "razao_social"),
    nome_fantasia: sv(estab, "nome_fantasia"),
    natureza_juridica_cod: sv(nat, "id"),
    natureza_juridica_desc: sv(nat, "descricao"),
    cnae_principal_cod: sv(atPrinc, "subclasse"),
    cnae_principal_desc: sv(atPrinc, "descricao"),
    cnaes_secundarios: formatarCnaes(atSec),
    
    // CORREÇÃO: Aplicação da função para juntar o tipo e o nome da via no CNPJ.ws
    logradouro: formatarLogradouro(sv(estab, "tipo_logradouro"), sv(estab, "logradouro")),
    
=======
    logradouro: sv(estab, "logradouro"),
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
    numero: sv(estab, "numero"),
    complemento: sv(estab, "complemento"),
    bairro: sv(estab, "bairro"),
    cep: sv(estab, "cep"),
    municipio: sv(cidade, "nome"),
    uf: sv(estado, "sigla"),
    email: sv(estab, "email"),
    telefone,
    situacao: sv(estab, "situacao_cadastral"),
    data_situacao: sv(estab, "data_situacao_cadastral"),
    status: "OK",
    erro_mensagem: "",
  };
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Accept: "application/json",
};

async function fetchComTimeout(url, headers, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// consultarCNPJ replica a lógica de backend/cnpj.go, simplificada para caber
// dentro do limite de duração de uma função serverless (Vercel). Tenta as duas
// fontes (BrasilAPI e CNPJ.ws), com um único reforço curto em caso de 429.
// CORREÇÃO E-MAIL: o diagnóstico confirmou que o e-mail está APENAS no CNPJ.ws
// (campo estabelecimento.email). Por isso, quando a BrasilAPI responde primeiro
// e não traz e-mail, o CNPJ.ws é consultado em paralelo só para preencher esse campo.
=======
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
export async function consultarCNPJ(cnpjInput) {
  const cnpj = limparCNPJ(cnpjInput);

  if (!cnpj) {
    return { cnpj_input: cnpjInput, status: "INVALIDO", erro_mensagem: "CNPJ vazio.", cnpj_formatado: "", razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "", email: "" };
=======
    return { cnpj_input: cnpjInput, status: "INVALIDO", erro_mensagem: "CNPJ vazio.", cnpj_formatado: "", razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "" };
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
  }
  if (!validarCNPJ(cnpj)) {
    return {
      cnpj_input: cnpjInput,
      cnpj_formatado: formatarCNPJ(cnpj),
      status: "INVALIDO",
      erro_mensagem: "Digitos verificadores invalidos.",
      razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "", email: "",
    };
  }

  // IMPORTANTE: a API pública do CNPJ.ws aceita no máximo 3 requisições por
// minuto por IP (https://docs.cnpj.ws/referencia-de-api/api-publica/limitacoes).
// O front-end consulta ~60 CNPJs/min, então usar o CNPJ.ws dentro deste loop
// (mesmo só "para pegar o e-mail") estoura a cota nos primeiros segundos e
// as chamadas seguintes voltam 429 — foi por isso que só os primeiros e-mails
// eram preenchidos. Por isso o e-mail NÃO é buscado aqui: esta função cobre
// somente os dados cadastrais (via BrasilAPI, sem limite agressivo), e o
// CNPJ.ws só entra como fallback se a BrasilAPI falhar completamente. O
// preenchimento do e-mail é feito depois, numa segunda fase, espaçada para
// respeitar o limite (ver buscarEmailCNPJws + app/api/consultar-email).
const apis = [
=======
      razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "",
    };
  }

  const apis = [
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
    { url: `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, tipo: "brasilapi" },
    { url: `https://publica.cnpj.ws/cnpj/${cnpj}`, tipo: "cnpjws" },
  ];

  for (const api of apis) {
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      try {
        const resp = await fetchComTimeout(api.url, HEADERS, 8000);
        if (resp.status === 429) {
          await sleep(2000);
          continue;
        }

        if (resp.status === 404) break;
        if (resp.status !== 200) break;

        const data = await resp.json();
        const resultado = api.tipo === "brasilapi"
          ? parseBrasilAPI(data, cnpjInput, cnpj)
          : parseCNPJws(data, cnpjInput, cnpj);

        return resultado;
=======
        if (resp.status === 404) break; // tenta a próxima API
        if (resp.status !== 200) break;

        const data = await resp.json();
        return api.tipo === "brasilapi"
          ? parseBrasilAPI(data, cnpjInput, cnpj)
          : parseCNPJws(data, cnpjInput, cnpj);
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
      } catch (e) {
        await sleep(500);
      }
    }
  }

  return {
    cnpj_input: cnpjInput,
    cnpj_formatado: formatarCNPJ(cnpj),
    status: "ERRO",
    erro_mensagem: "Todas as tentativas falharam.",

    razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "", email: "",
  };
}

// buscarEmailCNPJws busca APENAS o e-mail (estabelecimento.email) no CNPJ.ws.
// Usada na "fase 2" (enriquecimento de e-mail), chamada pelo front-end já
// espaçada para respeitar o limite de 3 req/min da API pública do CNPJ.ws.
// Retorna status explícito para o front-end decidir se deve re-enfileirar
// o CNPJ (RATE_LIMITED) em vez de simplesmente deixar o e-mail em branco.
export async function buscarEmailCNPJws(cnpjInput) {
  const cnpj = limparCNPJ(cnpjInput);
  if (!cnpj || !validarCNPJ(cnpj)) {
    return { cnpj_input: cnpjInput, email: "", status: "INVALIDO" };
  }

  try {
    const resp = await fetchComTimeout(`https://publica.cnpj.ws/cnpj/${cnpj}`, HEADERS, 8000);

    if (resp.status === 429) {
      return { cnpj_input: cnpjInput, email: "", status: "RATE_LIMITED" };
    }
    if (resp.status === 404) {
      return { cnpj_input: cnpjInput, email: "", status: "NAO_ENCONTRADO" };
    }
    if (resp.status !== 200) {
      return { cnpj_input: cnpjInput, email: "", status: "ERRO" };
    }

    const data = await resp.json();
    const emailWs = data?.estabelecimento?.email;
    const email = emailWs && typeof emailWs === "string" ? emailWs.trim().toLowerCase() : "";

    return { cnpj_input: cnpjInput, email, status: "OK" };
  } catch (e) {
    return { cnpj_input: cnpjInput, email: "", status: "ERRO" };
  }
}

=======
    razao_social: "", nome_fantasia: "", situacao: "", uf: "", municipio: "", cnae_principal_cod: "", cnae_principal_desc: "",
  };
}

>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
// consultarSimples replica backend/cnpj.go (consultarSimples), com backoff
// reduzido para caber no limite de duração serverless.
export async function consultarSimples(cnpjInput) {
  const c = limparCNPJ(cnpjInput);
  let delay = 2000;

  for (let i = 0; i < 3; i++) {
    try {
      const resp = await fetchComTimeout(`https://brasilapi.com.br/api/cnpj/v1/${c}`, { "User-Agent": "Mozilla/5.0" }, 10000);

      if (resp.status === 429) {
        await sleep(delay);
        delay *= 2;
        continue;
      }
      if (resp.status === 404) {
        return { cnpj_input: cnpjInput, resultado: "ERRO: CNPJ Nao Encontrado", status: "ERRO" };
      }
      if (resp.status !== 200) {
        return { cnpj_input: cnpjInput, resultado: `ERRO HTTP: ${resp.status}`, status: "ERRO" };
      }

      const data = await resp.json();
      const simples = data.opcao_pelo_simples;
      const mei = data.opcao_pelo_mei;

      let txtS = "Simples Nacional nao informado";
      if (simples === true) txtS = "Optante pelo Simples Nacional";
      if (simples === false) txtS = "NAO optante pelo Simples Nacional";

      let txtM = "SIMEI nao informado";
      if (mei === true) txtM = "Enquadrado no SIMEI";
      if (mei === false) txtM = "NAO enquadrado no SIMEI";

      return { cnpj_input: cnpjInput, resultado: `${txtS} | ${txtM}`, status: "OK" };
    } catch (e) {
      await sleep(1500);
    }
  }

  return { cnpj_input: cnpjInput, resultado: "ERRO: 429 - Limite de taxa", status: "ERRO" };
}
=======
}
>>>>>>> 6af35ad0a46c473ae7107eab333b7d65cbb6864e
