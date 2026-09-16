import { buscarEmailCNPJws } from "../../../lib/cnpj";

export const runtime = "nodejs";
export const maxDuration = 30; // segundos

// Rota dedicada da "fase 2": busca só o e-mail no CNPJ.ws para um CNPJ.
// O front-end (app.js) é responsável por espaçar essas chamadas para
// respeitar o limite de 3 requisições/minuto da API pública do CNPJ.ws.
export async function POST(request) {
  const { cnpj } = await request.json();

  if (!cnpj) {
    return Response.json({ ok: false, msg: "cnpj obrigatorio" }, { status: 400 });
  }

  const resultado = await buscarEmailCNPJws(cnpj);
  return Response.json({ ok: true, resultado });
}
