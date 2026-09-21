import { createHash } from "crypto";

export const runtime = "nodejs";

// Hash SHA-256 gerado para a senha:
// CORRETO
const SENHA_HASH = "564cac9a9177edc490a87b69f59826d0819088bc1e8750c1d33a0c60d97453ab";

let loginBlockAte = 0;
let tentativas = 0;

function hashSenha(s) {
  return createHash("sha256").update(s).digest("hex");
}

export async function POST(request) {
  const agora = Date.now();

  if (agora < loginBlockAte) {
    return Response.json({ ok: false, bloqueado: true, msg: "Muitas tentativas. Aguarde 30 segundos." });
  }

  let senha = "";
  try {
    const body = await request.json();
    senha = body?.senha || "";
  } catch (e) {}

  if (hashSenha(senha) === SENHA_HASH) {
    tentativas = 0;
    return Response.json({ ok: true });
  }

  tentativas++;
  let restantes = 5 - tentativas;
  if (tentativas >= 5) {
    loginBlockAte = agora + 30000;
    tentativas = 0;
    restantes = 0;
  }

  return Response.json({ ok: false, msg: `Senha incorreta. ${restantes} tentativa(s) restante(s).` });
}