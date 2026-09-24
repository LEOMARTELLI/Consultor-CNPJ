"use client";

import { useEffect } from "react";

const BODY_HTML = `
  <!-- ── LOGIN ─────────────────────────────────────────────────────────────── -->
  <div id="lov">
    <div id="vanta-bg" style="position:absolute;inset:0;z-index:0;"></div>
    <div class="lc" style="position:relative;z-index:1;">
      <img class="ico" src="/login-icon.jpg" alt="Ícone de automação e segurança" />
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
          <img class="ico-sb" src="/login-icon.jpg" alt="Ícone de automação e segurança" />
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

function carregarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function Home() {
  useEffect(() => {
    // ── App.js principal ────────────────────────────────────────────────────
    if (!document.querySelector('script[src="/app.js"]')) {
      const script = document.createElement("script");
      script.src = "/app.js";
      script.async = false;
      document.body.appendChild(script);
    }

    // ── Vanta Birds na tela de login ────────────────────────────────────────
    let vantaEffect = null;

    async function initVanta() {
      try {
        // Three.js é dependência obrigatória do Vanta
        await carregarScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await carregarScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js");

        const el = document.getElementById("vanta-bg");
        if (!el || !window.VANTA) return;

        vantaEffect = window.VANTA.BIRDS({
          el,
          mouseControls:  true,
          touchControls:  true,
          gyroControls:   false,
          minHeight:       200,
          minWidth:        200,
          scale:           1.0,
          scaleMobile:     1.0,
          // Cores do print (convertidas de hex 0x para #)
          backgroundColor: 0x69428c,   // roxo escuro
          color1:          0x1e161a,   // quase preto
          color2:          0xe36914,   // laranja
          colorMode:       "variance",
          quantity:        5,
          birdSize:        1,
          wingSpan:        30,
          speedLimit:      5,
          separation:      20,
          alignment:       20,
          cohesion:        20,
        });
      } catch (e) {
        // Falha silenciosa — tela de login aparece normalmente sem o efeito
        console.warn("Vanta Birds não carregou:", e);
      }
    }

    initVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
