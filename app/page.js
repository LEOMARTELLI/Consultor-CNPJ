"use client";

import { useEffect } from "react";

// Mesmo HTML de frontend/index.html (só o conteúdo do <body>), preservado
// tal como estava — nenhuma tela, id ou texto foi alterado.
const BODY_HTML = `
  <!-- ── LOGIN ─────────────────────────────────────────────────────────────── -->
  <div id="lov">
    <div class="lc">
      <div class="ico">&#128202;</div>
      <h1>Automação - CNPJ</h1>
      <p>by: Leonardo Martelli</p>
      <label for="si">SENHA DE ACESSO</label>
      <input type="password" id="si" placeholder="Digite a senha..." />
      <div id="ler"></div>
      <button class="lb" id="bl" onclick="login()">Entrar &#8594;</button>
    </div>
  </div>

  <!-- ── APP ───────────────────────────────────────────────────────────────── -->
  <div id="app">
    <div class="lay">

      <!-- SIDEBAR -->
      <div class="sb">
        <div class="sbl">
          <div class="ico-sb">&#128202;</div>
          <h2>Automação - CNPJ</h2>
          <p>Consultor de CNPJ</p>
        </div>
        <div class="dv"></div>

        <!-- Botão tema -->
        <div style="padding:10px 20px 0">
          <button class="btn bt" id="btn-tema" onclick="tema()">&#9728; Modo Claro</button>
        </div>
        <div class="dv" style="margin-top:8px"></div>

        <!-- Seleção de módulo -->
        <div class="sl">MODULO</div>
        <button class="mb ac" id="bmc" onclick="mod('cad')">&#128196; Comprovante de Inscricao</button>
        <button class="mb" id="bms" onclick="mod('sim')">&#128202; Simples / SIMEI</button>
        <div class="dv"></div>

        <!-- Controles Módulo 1 — Cadastral -->
        <div id="cc">
          <div class="sl">ACOES</div>
          <div class="aa">
            <button class="btn bi" id="bic" onclick="iniciar('cadastral')" disabled>&#9654; Iniciar Consulta</button>
            <button class="btn bp" id="bpc" onclick="cancelar()" disabled>&#9209; Parar</button>
            <button class="btn be" id="bec" onclick="exportar('cadastral')" disabled>&#128229; Exportar Excel</button>
            <button class="btn ba" onclick="abrirArquivo()">&#128193; Selecionar Excel (.xlsx)</button>
          </div>
          <div class="al" id="lac">Nenhum arquivo selecionado</div>
          <div class="ic">
            <div class="it">&#9201; INTERVALO ENTRE CONSULTAS</div>
            <div class="iv">1,0 segundo (fixo)</div>
          </div>
          <div class="sl">ESTATISTICAS</div>
          <div class="sc">
            <div class="sr"><span>Total</span><span class="st" id="stot">0</span></div>
            <div class="sr"><span>Sucesso</span><span class="so" id="sok">0</span></div>
            <div class="sr"><span>Erros</span><span class="se" id="ser">0</span></div>
            <div class="sr"><span>Invalidos</span><span class="si" id="sin">0</span></div>
          </div>
        </div>

        <!-- Controles Módulo 2 — Simples/SIMEI -->
        <div id="cs" style="display:none">
          <div class="sl">ACOES</div>
          <div class="aa">
            <button class="btn bs" id="bis" onclick="iniciar('simples')" disabled>&#9654; Iniciar Consulta</button>
            <button class="btn bp" id="bps" onclick="cancelar()" disabled>&#9209; Parar</button>
            <button class="btn be" id="bes" onclick="exportar('simples')" disabled>&#128229; Exportar CSV</button>
            <button class="btn ba" onclick="abrirArquivo()">&#128193; Selecionar Planilha</button>
          </div>
          <div class="al" id="las">Nenhum arquivo selecionado</div>
          <div class="ic">
            <div class="it">&#128190; SALVAMENTO</div>
            <div class="iv" style="color:var(--ac2)">Download ao finalizar</div>
          </div>
          <div class="sl">PROGRESSO</div>
          <div class="sc">
            <div class="pt">
              <div class="pf" id="psf" style="background:var(--ac2)"></div>
            </div>
            <div class="sr" style="margin-top:8px">
              <span>Processados</span>
              <span class="so" id="pst">0 / 0</span>
            </div>
          </div>
        </div>

      </div><!-- /sidebar -->

      <!-- ÁREA PRINCIPAL -->
      <div class="mn">

        <!-- Barra de progresso global -->
        <div class="pa">
          <div class="pt">
            <div class="pf" id="pf"></div>
          </div>
          <div class="pi">
            <span id="stx">Aguardando...</span>
            <span class="pc" id="ctx">0 / 0</span>
          </div>
        </div>

        <!-- Tabela — Módulo Cadastral -->
        <div id="painel-cad" class="tw">
          <div class="tc">
            <table>
              <thead>
                <tr>
                  <th>CNPJ</th>
                  <th>Razao Social</th>
                  <th>Nome Fantasia</th>
                  <th>CNAE</th>
                  <th>Municipio/UF</th>
                  <th>Situacao</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="tbc">
                <tr>
                  <td colspan="7" class="em">Nenhum resultado.<br>Selecione um arquivo e inicie a consulta.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela — Módulo Simples -->
        <div id="painel-sim" style="display:none" class="tw">
          <div class="tc">
            <table>
              <thead>
                <tr>
                  <th>CNPJ</th>
                  <th>Resultado Simples/SIMEI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="tbs">
                <tr>
                  <td colspan="3" class="em">Nenhum resultado.<br>Selecione uma planilha e inicie a consulta.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div><!-- /main -->
    </div><!-- /layout -->
  </div><!-- /app -->

  <!-- Input de arquivo oculto -->
  <input type="file" id="fi" accept=".xlsx,.xls" style="display:none" onchange="uploadArquivo(this)">
`;

export default function Home() {
  useEffect(() => {
    // Evita duplicar o script (o modo de desenvolvimento do React
    // pode montar o efeito duas vezes).
    if (document.querySelector('script[src="/app.js"]')) return;

    const script = document.createElement("script");
    script.src = "/app.js";
    script.async = false;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
