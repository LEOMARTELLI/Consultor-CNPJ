import { lerCNPJsExcel } from "../../../lib/excel";

export const runtime = "nodejs";

export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ ok: false, msg: "arquivo invalido" });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const cnpjs = lerCNPJsExcel(buffer);
    return Response.json({ ok: true, total: cnpjs.length, cnpjs });
  } catch (e) {
    return Response.json({ ok: false, msg: e.message || "arquivo invalido" });
  }
}
