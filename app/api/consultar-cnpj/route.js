import { consultarCNPJ, consultarSimples } from "../../../lib/cnpj";

export const runtime = "nodejs";
export const maxDuration = 30; // segundos (ajuste no plano Vercel se precisar de mais)

export async function POST(request) {
  const { cnpj, tipo } = await request.json();

  if (!cnpj) {
    return Response.json({ ok: false, msg: "cnpj obrigatorio" }, { status: 400 });
  }

  const resultado = tipo === "simples" ? await consultarSimples(cnpj) : await consultarCNPJ(cnpj);
  return Response.json({ ok: true, tipo: tipo === "simples" ? "simples" : "cadastral", resultado });
}
