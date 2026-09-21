// ── Estado da aplicação ───────────────────────────────────────────────────────
let modAtivo  = 'cad';
let cnpjs     = [];
let temaAtual = 'dark';

let rodando       = false;
let cancelando    = false;
let resultadosCad = [];
let resultadosSim = [];

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById('si').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

async function login() {
  const senha = document.getElementById('si').value;
  const btnLogin = document.getElementById('bl');
  const input    = document.getElementById('si');

  btnLogin.disabled = true;

  const res  = await fetch('/api/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ senha }),
  });
  const data = await res.json();

  if (data.ok) {
    document.getElementById('lov').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    return;
  }

  // Senha errada
  input.classList.add('er');
  setTimeout(() => input.classList.remove('er'), 600);
  document.getElementById('ler').textContent = data.msg || 'Senha incorreta.';
  input.value = '';
  btnLogin.disabled = data.bloqueado || false;

  if (data.bloqueado) {
    setTimeout(() => { btnLogin.disabled = false; }, 30000);
  } else {
    btnLogin.disabled = false;
  }
}

// ── Tema claro / escuro ───────────────────────────────────────────────────────

function tema() {
  temaAtual = temaAtual === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('lt', temaAtual === 'light');
  document.getElementById('btn-tema').textContent =
    temaAtual === 'dark' ? '\u2600 Modo Claro' : '\uD83C\uDF19 Modo Escuro';
}

// ── Troca de módulo ───────────────────────────────────────────────────────────

function mod(m) {
  modAtivo = m;

  // Painéis
  document.getElementById('painel-cad').style.display = m === 'cad' ? 'flex' : 'none';
  document.getElementById('painel-sim').style.display = m === 'sim' ? 'flex' : 'none';

  // Controles sidebar
  document.getElementById('cc').style.display = m === 'cad' ? 'block' : 'none';
  document.getElementById('cs').style.display = m === 'sim' ? 'block' : 'none';

  // Botões de módulo
  document.getElementById('bmc').className = 'mb' + (m === 'cad' ? ' ac' : '');
  document.getElementById('bms').className = 'mb' + (m === 'sim' ? ' as' : '');
}

// ── Seleção e upload de arquivo ───────────────────────────────────────────────

function abrirArquivo() {
  document.getElementById('fi').click();
}

async function uploadArquivo(input) {
  const arquivo = input.files[0];
  if (!arquivo) return;

  const formData = new FormData();
  formData.append('file', arquivo);

  const res  = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();

  if (data.ok) {
    cnpjs = data.cnpjs;
    const label = '\u2705 ' + arquivo.name + ' \u2014 ' + data.total + ' CNPJ(s)';

    document.getElementById('lac').textContent  = label;
    document.getElementById('las').textContent  = label;
    document.getElementById('lac').style.color  = '#22C55E';
    document.getElementById('las').style.color  = '#22C55E';
    document.getElementById('stot').textContent = data.total;

    document.getElementById('bic').disabled = false;
    document.getElementById('bis').disabled = false;

    setStatus('\u2705 ' + data.total + ' CNPJs carregados. Pronto para consultar.');
  } else {
    alert('Erro ao ler arquivo: ' + data.msg);
  }

  // Limpa o input para permitir recarregar o mesmo arquivo
  input.value = '';
}

// ── Iniciar consulta ──────────────────────────────────────────────────────────
// O loop roda aqui no navegador (um CNPJ por vez, com 1s de intervalo),
// chamando /api/consultar-cnpj a cada iteração — substitui o antigo job em
// background do servidor + polling, que não é compatível com o Vercel.

async function iniciar(tipo) {
  if (!cnpjs.length) {
    alert('Selecione um arquivo primeiro.');
    return;
  }
  if (rodando) return;

  rodando    = true;
  cancelando = false;

  // Reseta UI
  if (tipo === 'cadastral') {
    resultadosCad = [];
    document.getElementById('tbc').innerHTML = '';
    document.getElementById('sok').textContent = '0';
    document.getElementById('ser').textContent = '0';
    document.getElementById('sin').textContent = '0';
    document.getElementById('bic').disabled = true;
    document.getElementById('bpc').disabled = false;
    document.getElementById('bec').disabled = true;
  } else {
    resultadosSim = [];
    document.getElementById('tbs').innerHTML = '';
    document.getElementById('bis').disabled = true;
    document.getElementById('bps').disabled = false;
    document.getElementById('bes').disabled = true;
  }

  setProgresso(0, cnpjs.length);
  setStatus('Iniciando consulta...');

  let atual = 0;
  for (const cnpj of cnpjs) {
    if (cancelando) break;

    try {
      const res  = await fetch('/api/consultar-cnpj', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cnpj, tipo }),
      });
      const data = await res.json();

      if (tipo === 'cadastral') {
        resultadosCad.push(data.resultado);
        renderTabelaCadastral(resultadosCad);
        document.getElementById('sok').textContent = resultadosCad.filter(r => r.status === 'OK').length;
        document.getElementById('ser').textContent = resultadosCad.filter(r => r.status === 'ERRO').length;
        document.getElementById('sin').textContent = resultadosCad.filter(r => r.status === 'INVALIDO').length;
      } else {
        resultadosSim.push(data.resultado);
        renderTabelaSimples(resultadosSim);
        const pct = cnpjs.length ? (atual + 1) / cnpjs.length : 0;
        document.getElementById('psf').style.width = (pct * 100) + '%';
        document.getElementById('pst').textContent = (atual + 1) + ' / ' + cnpjs.length;
      }
    } catch (e) {
      // Falha de rede pontual: segue para o próximo CNPJ.
    }

    atual++;
    setProgresso(atual, cnpjs.length);

    if (cancelando) break;

    // Intervalo fixo de 1s entre consultas, verificando cancelamento a cada 100ms
    // para o "Parar" responder rápido mesmo durante a espera.
    for (let i = 0; i < 10 && !cancelando; i++) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  rodando = false;

  if (tipo === 'cadastral') {
    document.getElementById('bic').disabled = false;
    document.getElementById('bpc').disabled = true;

    if (resultadosCad.length) document.getElementById('bec').disabled = false;
  } else {
    document.getElementById('bis').disabled = false;
    document.getElementById('bps').disabled = true;
    if (resultadosSim.length) document.getElementById('bes').disabled = false;
    
    rodando = false;
  }

  if (cancelando) {
    rodando = false;
    document.getElementById('bic').disabled = false;
    document.getElementById('bpc').disabled = true;
    setStatus('\u23F9 Cancelado. ' + atual + ' processados.');
    return;
  }

  if (tipo !== 'cadastral') {
    setStatus('\u2705 Concluido! ' + atual + '/' + cnpjs.length + ' processados.');
    return;
  }

  // ── Fase 2: enriquecimento de e-mail ────────────────────────────────────
  // O CNPJ.ws (fonte do e-mail) so aceita 3 requisicoes/minuto por IP, entao
  // essa etapa roda separada da fase 1, bem mais devagar e de proposito.
  await buscarEmailsFaltantes(atual);

  rodando = false;
  document.getElementById('bic').disabled = false;
  document.getElementById('bpc').disabled = true;
}

// Intervalo entre chamadas ao CNPJ.ws na fase 2. O limite documentado e 3
// req/min por IP; 21s entre chamadas da margem de sobra (~3 a cada 63s).
const INTERVALO_EMAIL_MS = 21000;
const MAX_RETENTATIVAS_EMAIL = 4;

async function buscarEmailsFaltantes(totalProcessados) {
  let fila = resultadosCad
    .filter(r => r.status === 'OK' && !r.email)
    .map(r => ({ r, tentativas: 0 }));

  if (!fila.length) {
    setStatus('\u2705 Concluido! ' + totalProcessados + '/' + cnpjs.length + ' processados.');
    return;
  }

  const totalEmails = fila.length;
  let feitos = 0;
  let primeira = true;

  while (fila.length && !cancelando) {
    if (!primeira) {
      const etaSeg = Math.round((fila.length * INTERVALO_EMAIL_MS) / 1000);
      setStatus(
        '\uD83D\uDCE7 Buscando e-mails (limite de 3/min da fonte) \u2014 ' +
        feitos + '/' + totalEmails + ' \u2014 ~' + etaSeg + 's restantes...'
      );
      for (let i = 0; i < INTERVALO_EMAIL_MS / 100 && !cancelando; i++) {
        await new Promise(res => setTimeout(res, 100));
      }
      if (cancelando) break;
    }
    primeira = false;

    const item = fila.shift();
    try {
      const res = await fetch('/api/consultar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj: item.r.cnpj_input }),
      });
      const data = await res.json();
      const resultado = data.resultado || {};

      if (resultado.status === 'OK' && resultado.email) {
        item.r.email = resultado.email;
        feitos++;
      } else if (resultado.status === 'RATE_LIMITED' && item.tentativas < MAX_RETENTATIVAS_EMAIL) {
        // Ainda estourou o limite (ex: outra aba/usuario no mesmo IP) -
        // volta pro fim da fila para tentar de novo mais tarde.
        item.tentativas++;
        fila.push(item);
      } else {
        // Sem e-mail cadastrado na fonte, ou esgotou as tentativas: segue.
        feitos++;
      }
    } catch (e) {
      if (item.tentativas < MAX_RETENTATIVAS_EMAIL) {
        item.tentativas++;
        fila.push(item);
      } else {
        feitos++;
      }
    }
  }

  if (cancelando) {
    setStatus('\u23F9 Cancelado durante a busca de e-mails. ' + feitos + '/' + totalEmails + ' e-mails processados.');
  } else {
    setStatus('\u2705 Concluido! ' + totalProcessados + '/' + cnpjs.length + ' processados \u2014 e-mails: ' + feitos + '/' + totalEmails + '.');

  }

  if (!cancelando) {
    setStatus('\u2705 Concluido! ' + atual + '/' + cnpjs.length + ' processados.');
  } else {
    setStatus('\u23F9 Cancelado. ' + atual + ' processados.');

  }
}

// ── Renderização das tabelas ──────────────────────────────────────────────────

function renderTabelaCadastral(resultados) {
  const tbody = document.getElementById('tbc');
  tbody.innerHTML = '';

  resultados.forEach((r, i) => {
    const tr = document.createElement('tr');

    const classeRow = r.status === 'OK'
      ? (i % 2 === 0 ? 'rok' : 'roa')
      : r.status === 'ERRO' ? 'rer' : 'rin';

    const classeStatus = r.status === 'OK' ? 'tok'
      : r.status === 'ERRO' ? 'ter' : 'tin';

    const munUF = r.municipio ? r.municipio + '/' + r.uf : r.uf;
    const cnae  = r.cnae_principal_cod
      ? r.cnae_principal_cod + ' - ' + r.cnae_principal_desc.substring(0, 20)
      : '';

    tr.className = classeRow;
    tr.innerHTML =
      '<td title="' + r.cnpj_formatado + '">' + (r.cnpj_formatado || r.cnpj_input) + '</td>' +
      '<td title="' + esc(r.razao_social) + '">' + r.razao_social.substring(0, 34) + '</td>' +
      '<td title="' + esc(r.nome_fantasia) + '">' + r.nome_fantasia.substring(0, 24) + '</td>' +
      '<td title="' + esc(r.cnae_principal_desc) + '">' + cnae.substring(0, 28) + '</td>' +
      '<td>' + munUF.substring(0, 20) + '</td>' +
      '<td>' + r.situacao.substring(0, 16) + '</td>' +
      '<td class="' + classeStatus + '">' + r.status + '</td>';

    tbody.appendChild(tr);
  });
}

function renderTabelaSimples(simples) {
  const tbody = document.getElementById('tbs');
  tbody.innerHTML = '';

  simples.forEach(s => {
    const tr = document.createElement('tr');
    tr.className    = s.status === 'OK' ? 'rok' : 'rer';
    const classeStatus = s.status === 'OK' ? 'tok' : 'ter';

    tr.innerHTML =
      '<td>' + s.cnpj_input + '</td>' +
      '<td title="' + esc(s.resultado) + '">' + s.resultado + '</td>' +
      '<td class="' + classeStatus + '">' + s.status + '</td>';

    tbody.appendChild(tr);
  });
}

// ── Cancelar / Exportar ───────────────────────────────────────────────────────

async function cancelar() {
  cancelando = true;
}

async function exportar(tipo) {
  const resultados = tipo === 'cadastral' ? resultadosCad : resultadosSim;
  if (!resultados.length) return;

  const res = await fetch('/api/exportar', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ tipo, resultados }),
  });

  if (!res.ok) {
    alert('Erro ao exportar.');
    return;
  }

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = tipo === 'cadastral' ? 'consulta_cnpj.xlsx' : 'simples_simei.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Utilitários ───────────────────────────────────────────────────────────────

function setProgresso(atual, total) {
  const pct = total ? (atual / total) * 100 : 0;
  document.getElementById('pf').style.width  = pct + '%';
  document.getElementById('ctx').textContent = atual + ' / ' + total;
}

function setStatus(msg) {
  document.getElementById('stx').textContent = msg;
}

// Escapa caracteres HTML para uso em atributos
function esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}
