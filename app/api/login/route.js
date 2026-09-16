import { createHash } from "crypto";

export const runtime = "nodejs";

// senhaHash é o SHA-256 da senha de acesso.
// Senha atual: "Governance#2026!Global" (é o valor que de fato bate com o
// hash gravado no backend Go original — o README dizia "cnpj2025", mas
// esse valor nunca correspondeu ao hash em uso).
// Para trocar: node -e "console.log(require('crypto').createHash('sha256').update('NOVA_SENHA').digest('hex'))"
const SENHA_HASH = "564cac9a9177edc490a87b69f59826d0819088bc1e8750c1d33a0c60d97453ab";

// Estado de rate-limit em memória por instância (best-effort).
// Em serverless isso reseta em cold starts / instâncias diferentes — não é
// uma trava forte, igual ao comportamento do binário original, que também
// só protegia um único processo.
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
  } catch (e) {
    // corpo ausente/invalido
  }

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
