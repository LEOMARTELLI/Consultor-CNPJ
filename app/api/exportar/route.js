import { gerarExcel } from "../../../lib/excel";

export const runtime = "nodejs";

export async function POST(request) {
  const { tipo, resultados } = await request.json();

  if (!Array.isArray(resultados) || resultados.length === 0) {
    return new Response("sem resultados para exportar", { status: 400 });
  }

  if (tipo === "simples") {
    let csv = "CNPJ;Resultado Simples/SIMEI;Status\n";
    for (const s of resultados) {
      csv += `${s.cnpj_input};${s.resultado};${s.status}\n`;
    }
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="simples_simei.csv"',
      },
    });
  }

  const xlsxBuffer = gerarExcel(resultados);
  return new Response(xlsxBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="consulta_cnpj.xlsx"',
    },
  });
}
