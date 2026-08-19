import XLSX from "xlsx-js-style";

// lerCNPJsExcel replica backend/excel.go (lerCNPJsExcel): localiza a coluna
// "CNPJ" (case-insensitive) e retorna os valores não vazios como lista de strings.
export function lerCNPJsExcel(buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("planilha nao encontrada no arquivo");

  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!rows.length) throw new Error("planilha vazia");

  const header = rows[0];
  let colIdx = -1;
  for (let i = 0; i < header.length; i++) {
    if (String(header[i] ?? "").trim().toUpperCase() === "CNPJ") {
      colIdx = i;
      break;
    }
  }
  if (colIdx === -1) throw new Error("coluna 'CNPJ' nao encontrada na planilha");

  const cnpjs = [];
  for (let r = 1; r < rows.length; r++) {
    const raw = rows[r][colIdx];
    const val = String(raw ?? "").trim();
    if (val && val.toLowerCase() !== "nan") cnpjs.push(val);
  }
  return cnpjs;
}

// ── Escrita do Excel de resultados (colunas, larguras e cores idênticas ao backend/excel.go) ──

const HEADERS = [
  "Numero de Inscricao (CNPJ)", "Data de Abertura", "Nome Empresarial (Razao Social)",
  "Titulo do Estabelecimento (Nome Fantasia)", "Cod. CNAE Principal", "Descricao CNAE Principal",
  "CNAEs Secundarios", "Cod. Natureza Juridica", "Descricao Natureza Juridica",
  "Logradouro", "Numero", "Complemento", "Bairro/Distrito", "CEP",
  "Municipio", "UF", "Email", "Telefone",
  "Situacao Cadastral", "Data da Situacao Cadastral",
  "CNPJ (Original)", "Status", "Observacao",
];

const WIDTHS = [
  24, 16, 42, 36, 14, 50, 80, 14, 40, 36,
  10, 20, 22, 12, 20, 6, 36, 18, 20, 18, 20, 12, 44,
];

function camposDoCNPJ(r) {
  return [
    r.cnpj_formatado, r.data_abertura, r.razao_social, r.nome_fantasia,
    r.cnae_principal_cod, r.cnae_principal_desc, r.cnaes_secundarios,
    r.natureza_juridica_cod, r.natureza_juridica_desc,
    r.logradouro, r.numero, r.complemento, r.bairro, r.cep,
    r.municipio, r.uf, r.email, r.telefone,
    r.situacao, r.data_situacao,
    r.cnpj_input, r.status, r.erro_mensagem,
  ].map((v) => v ?? "");
}

const HEADER_STYLE = {
  font: { sz: 10, bold: true, color: { rgb: "E8F4FD" }, name: "Calibri" },
  fill: { fgColor: { rgb: "1A1A2E" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: borda(),
};

function borda() {
  const b = { style: "thin", color: { rgb: "BDC3C7" } };
  return { top: b, bottom: b, left: b, right: b };
}

function estiloLinha(fillRgb) {
  return {
    font: { sz: 10, name: "Calibri" },
    fill: fillRgb ? { fgColor: { rgb: fillRgb } } : undefined,
    alignment: { vertical: "center" },
    border: borda(),
  };
}

const STYLE_OK_PAR = estiloLinha("D4EDDA");
const STYLE_OK_IMPAR = estiloLinha(null);
const STYLE_ERRO = estiloLinha("F8D7DA");
const STYLE_INVALIDO = estiloLinha("FFF3CD");

// gerarExcel replica backend/excel.go (gerarExcel): mesma linha de cabeçalho,
// cores condicionais por status e largura de colunas.
export function gerarExcel(resultados) {
  const aoa = [HEADERS, ...resultados.map(camposDoCNPJ)];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = WIDTHS.map((w) => ({ wch: w }));
  ws["!rows"] = [{ hpt: 30 }, ...resultados.map(() => ({ hpt: 16 }))];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  ws["!panes"] = [{ ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" }];

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; R++) {
    let style;
    if (R === 0) {
      style = HEADER_STYLE;
    } else {
      const r = resultados[R - 1];
      if (r.status === "ERRO") style = STYLE_ERRO;
      else if (r.status === "INVALIDO") style = STYLE_INVALIDO;
      else style = (R - 1) % 2 === 1 ? STYLE_OK_IMPAR : STYLE_OK_PAR;
    }
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      ws[addr].s = style;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consulta CNPJ");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
