/**
 * COLÔNIA — "cérebro" do site.
 * Guarda os sobreviventes e as ideias numa planilha do Google (sua, grátis)
 * e manda um resumo diário para o seu e-mail.
 *
 * Como usar: veja PASSO_A_PASSO.md. Você só precisa colar este código,
 * clicar em "Executar" na função setup e depois em "Implantar".
 */

// Sua InfiniteTag (sem o $). Com ela preenchida, o pagamento é pela InfinitePay
// e a base aparece sozinha no mapa quando o Pix cai (Pix sem taxa).
const INFINITE_TAG = 'lumoyss';
const SITE_URL = 'https://lumoyss.github.io/colonia/';

const ABA_SOBREVIVENTES = 'Sobreviventes';
const ABA_IDEIAS = 'Ideias';
const ABA_TERRENOS = 'Terrenos';
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];
// Preços cobrados (o site mostra os mesmos valores em config.js; aqui é o que vale)
const PRECOS = { 'Base oxigenada': 5, 'Base grande com placa': 15 };

/* ---------- 1. Rode esta função uma vez ---------- */
function setup() {
  const ss = planilha_();
  garantirAba_(ss, ABA_SOBREVIVENTES, ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual']);
  garantirAba_(ss, ABA_IDEIAS, ['data', 'autor', 'tipo', 'texto']);
  const terrenos = garantirAba_(ss, ABA_TERRENOS, ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status', 'mercado_pago_id']);
  if (terrenos.getRange(1, 9).getValue() === '') terrenos.getRange(1, 9).setValue('mercado_pago_id').setFontWeight('bold');
  ss.getSheets().forEach(function (aba) {
    const n = aba.getName();
    if ([ABA_SOBREVIVENTES, ABA_IDEIAS, ABA_TERRENOS].indexOf(n) < 0) ss.deleteSheet(aba);
  });

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (['resumoDiario', 'verificarPendentes'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('resumoDiario').timeBased().everyDays(1).atHour(21).create();
  if (tokenMP_()) ScriptApp.newTrigger('verificarPendentes').timeBased().everyMinutes(5).create();

  Logger.log('Tudo pronto! Sua planilha: ' + ss.getUrl());
  Logger.log(tokenMP_() ? 'Mercado Pago ligado: os pagamentos serão confirmados sozinhos.' : 'Mercado Pago NÃO ligado (falta MP_TOKEN). Os pagamentos precisam ser marcados à mão.');
}

/* ---------- O site lê a colônia por aqui ---------- */
function doGet() {
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('lista');
  if (guardado) return json_(JSON.parse(guardado));

  const ss = planilha_();
  const sobreviventes = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).map(function (l) {
    return { numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], visual: String(l[6] || '') };
  });
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).slice(-60).reverse().map(function (l) {
    return { data: l[0], autor: l[1], tipo: l[2], texto: l[3] };
  });
  // Só aparecem no mapa os terrenos que você marcou como "pago" na planilha
  const terrenos = linhas_(ss.getSheetByName(ABA_TERRENOS)).filter(function (l) {
    return String(l[7]).trim().toLowerCase() === 'pago';
  }).map(function (l) { return { nome: l[2], dono: l[3], plano: l[5] }; });
  const resposta = { ok: true, total: sobreviventes.length, sobreviventes: sobreviventes.slice(-600), ideias: ideias, terrenos: terrenos };
  try { cache.put('lista', JSON.stringify(resposta), 20); } catch (err) { /* lista grande demais para o cache */ }
  return json_(resposta);
}

/* ---------- O site envia cadastros e ideias por aqui ---------- */
function doPost(e) {
  let dados;
  try { dados = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, erro: 'Dados inválidos.' }); }
  if (dados.site) return json_({ ok: true, numero: 0 }); // armadilha para robôs
  // Aviso automático da InfinitePay de que um pagamento caiu
  if (dados.invoice_slug && dados.order_nsu) dados = { acao: 'confirmar', order_nsu: dados.order_nsu, transaction_nsu: dados.transaction_nsu, slug: dados.invoice_slug };

  const trava = LockService.getScriptLock();
  trava.waitLock(15000);
  try {
    const ss = planilha_();
    let r;
    if (dados.acao === 'cadastrar') r = cadastrar_(ss, dados);
    else if (dados.acao === 'ideia') r = ideia_(ss, dados);
    else if (dados.acao === 'terreno') r = terreno_(ss, dados);
    else if (dados.acao === 'verificar') r = verificar_(ss, String(dados.codigo || ''));
    else if (dados.acao === 'confirmar') r = confirmarInfinite_(ss, dados);
    else r = { ok: false, erro: 'Ação desconhecida.' };
    if (r.ok) CacheService.getScriptCache().remove('lista');
    return json_(r);
  } finally {
    trava.releaseLock();
  }
}

function cadastrar_(ss, d) {
  const nome = limpar_(d.nome, 24);
  const instagram = limpar_(d.instagram, 31).replace(/^@*/, '');
  const profissao = limpar_(d.profissao, 30);
  const historia = limpar_(d.historia, 400);
  const visual = String(d.visual || '').replace(/[^0-9,]/g, '').slice(0, 20);

  if (nome.length < 2) return { ok: false, erro: 'Escolha um nome com pelo menos 2 letras.' };
  if (!profissao) return { ok: false, erro: 'Escolha uma profissão.' };
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) return { ok: false, erro: 'Esse @ do Instagram não parece certo.' };

  const aba = ss.getSheetByName(ABA_SOBREVIVENTES);
  const existentes = linhas_(aba);
  const nomeMin = nome.toLowerCase();
  if (existentes.some(function (l) { return String(l[2]).toLowerCase() === nomeMin; })) {
    return { ok: false, erro: 'Já existe um sobrevivente chamado ' + nome + '. Tente outro nome.' };
  }
  if (instagram && existentes.some(function (l) { return String(l[3]).toLowerCase() === '@' + instagram.toLowerCase(); })) {
    return { ok: false, erro: 'Esse @ já tem um sobrevivente na colônia.' };
  }

  const numero = existentes.length + 1;
  aba.appendRow([numero, new Date(), texto_(nome), instagram ? texto_('@' + instagram) : '', texto_(profissao), texto_(historia), texto_(visual)]);
  return { ok: true, numero: numero };
}

function ideia_(ss, d) {
  const texto = limpar_(d.texto, 500);
  const autor = limpar_(d.autor, 24) || 'Anônimo';
  const tipo = TIPOS_IDEIA.indexOf(d.tipo) >= 0 ? d.tipo : 'outro';
  if (texto.length < 3) return { ok: false, erro: 'Escreva sua ideia antes de enviar.' };
  ss.getSheetByName(ABA_IDEIAS).appendRow([new Date(), texto_(autor), tipo, texto_(texto)]);
  return { ok: true };
}

function terreno_(ss, d) {
  const lugar = limpar_(d.lugar, 28);
  const dono = limpar_(d.dono, 24);
  const instagram = limpar_(d.instagram, 31).replace(/^@*/, '');
  const plano = limpar_(d.plano, 30);
  const valor = PRECOS[plano] || 0;
  const codigo = String(d.codigo || '').replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (lugar.length < 2) return { ok: false, erro: 'Dê um nome para o seu lugar.' };
  if (dono.length < 2) return { ok: false, erro: 'Diga o nome do dono.' };
  if (!codigo) return { ok: false, erro: 'Código inválido.' };
  if (!valor) return { ok: false, erro: 'Plano inválido.' };

  // Com a InfinitePay ligada, cria um link de pagamento que volta para o site
  if (INFINITE_TAG) {
    const r = UrlFetchApp.fetch('https://api.checkout.infinitepay.io/links', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({
        handle: INFINITE_TAG,
        order_nsu: codigo,
        redirect_url: SITE_URL,
        webhook_url: ScriptApp.getService().getUrl(),
        items: [{ quantity: 1, price: Math.round(valor * 100), description: plano + ' - ' + lugar }]
      })
    });
    let link = null;
    try { link = JSON.parse(r.getContentText()).url; } catch (err) { Logger.log('InfinitePay: ' + r.getContentText()); }
    if (link) {
      ss.getSheetByName(ABA_TERRENOS).appendRow([codigo, new Date(), texto_(lugar), texto_(dono), instagram ? texto_('@' + instagram) : '', texto_(plano), valor, 'aguardando pagamento', 'infinitepay']);
      return { ok: true, codigo: codigo, link: link };
    }
  }

  // Com Mercado Pago ligado, cria um Pix que se confirma sozinho (API de Orders).
  // Se o Mercado Pago falhar, o site usa o Pix da sua chave e você confirma à mão.
  let pix = null, mpId = '';
  if (tokenMP_()) {
    const v = valor.toFixed(2);
    const pedido = mp_('post', '/v1/orders', {
      type: 'online',
      processing_mode: 'automatic',
      total_amount: v,
      external_reference: codigo,
      // E-mail do pagador: o seu, com +código (os avisos do Mercado Pago chegam para você)
      payer: { email: Session.getEffectiveUser().getEmail().replace('@', '+' + codigo.toLowerCase() + '@') },
      transactions: { payments: [{ amount: v, payment_method: { id: 'pix', type: 'bank_transfer' } }] }
    }, codigo);
    try {
      pix = pedido.transactions.payments[0].payment_method.qr_code || null;
      mpId = pix ? String(pedido.id) : '';
    } catch (err) { pix = null; }
  }

  ss.getSheetByName(ABA_TERRENOS).appendRow([codigo, new Date(), texto_(lugar), texto_(dono), instagram ? texto_('@' + instagram) : '', texto_(plano), valor, 'aguardando Pix', mpId]);
  return { ok: true, codigo: codigo, pix: pix, automatico: !!pix };
}

/* ---------- Confirmação automática do Pix (Mercado Pago) ---------- */
function verificar_(ss, codigo) {
  const aba = ss.getSheetByName(ABA_TERRENOS);
  const ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) {
    if (String(ls[i][0]) !== codigo) continue;
    if (String(ls[i][7]).toLowerCase() === 'pago') return { ok: true, pago: true };
    if (!ls[i][8] || !tokenMP_()) return { ok: true, pago: false };
    const pedido = mp_('get', '/v1/orders/' + ls[i][8]);
    if (pedido && pedido.status === 'processed') {
      aba.getRange(i + 2, 8).setValue('pago');
      CacheService.getScriptCache().remove('lista');
      return { ok: true, pago: true };
    }
    return { ok: true, pago: false };
  }
  return { ok: false, erro: 'Reserva não encontrada.' };
}

// Roda sozinho a cada 5 minutos: confirma quem pagou e fechou a página
function verificarPendentes() {
  if (!tokenMP_()) return;
  const ss = planilha_();
  const limite = Date.now() - 2 * 24 * 3600 * 1000;
  linhas_(ss.getSheetByName(ABA_TERRENOS)).forEach(function (l) {
    if (l[8] && String(l[7]).toLowerCase() !== 'pago' && new Date(l[1]).getTime() > limite) verificar_(ss, String(l[0]));
  });
}

/* ---------- Confirmação automática (InfinitePay) ---------- */
function confirmarInfinite_(ss, d) {
  const codigo = String(d.order_nsu || '');
  const aba = ss.getSheetByName(ABA_TERRENOS);
  const ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) {
    if (String(ls[i][0]) !== codigo) continue;
    if (String(ls[i][7]).toLowerCase() === 'pago') return { ok: true, pago: true, lugar: ls[i][2] };
    if (!INFINITE_TAG) return { ok: true, pago: false };
    const r = UrlFetchApp.fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ handle: INFINITE_TAG, order_nsu: codigo, transaction_nsu: String(d.transaction_nsu || ''), slug: String(d.slug || '') })
    });
    let res = {};
    try { res = JSON.parse(r.getContentText()); } catch (err) { /* resposta inválida */ }
    if (res.paid && Number(res.amount) >= Math.round(Number(ls[i][6]) * 100)) {
      aba.getRange(i + 2, 8).setValue('pago');
      aba.getRange(i + 2, 9).setValue('infinitepay ' + (d.slug || ''));
      CacheService.getScriptCache().remove('lista');
      return { ok: true, pago: true, lugar: ls[i][2] };
    }
    return { ok: true, pago: false };
  }
  return { ok: false, erro: 'Reserva não encontrada.' };
}

function tokenMP_() {
  return (PropertiesService.getScriptProperties().getProperty('MP_TOKEN') || '').trim();
}

function mp_(metodo, caminho, corpo, chave) {
  const opcoes = { method: metodo, muteHttpExceptions: true, contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + tokenMP_() } };
  if (corpo) opcoes.payload = JSON.stringify(corpo);
  if (chave) opcoes.headers['X-Idempotency-Key'] = chave;
  const r = UrlFetchApp.fetch('https://api.mercadopago.com' + caminho, opcoes);
  if (r.getResponseCode() >= 300) { Logger.log('Mercado Pago ' + r.getResponseCode() + ': ' + r.getContentText()); return null; }
  return JSON.parse(r.getContentText());
}

/* ---------- Resumo diário no seu e-mail (o Claude lê por aqui) ---------- */
function resumoDiario() {
  const props = PropertiesService.getScriptProperties();
  const desde = new Date(Number(props.getProperty('ULTIMO_RESUMO') || 0));
  const agora = new Date();
  const ss = planilha_();

  const novos = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return new Date(l[1]) > desde; });
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).filter(function (l) { return new Date(l[0]) > desde; });
  const reservas = linhas_(ss.getSheetByName(ABA_TERRENOS)).filter(function (l) { return new Date(l[1]) > desde; });
  if (!novos.length && !ideias.length && !reservas.length) return;

  let corpo = 'RESUMO DA COLÔNIA\n\n';
  corpo += 'NOVOS SOBREVIVENTES (' + novos.length + ')\n';
  novos.forEach(function (l) {
    corpo += '#' + l[0] + ' ' + l[2] + (l[3] ? ' (' + l[3] + ')' : '') + ' | ' + l[4] + (l[5] ? '\n   História: ' + l[5] : '') + '\n';
  });
  corpo += '\nIDEIAS PARA A HISTÓRIA (' + ideias.length + ')\n';
  ideias.forEach(function (l) { corpo += '[' + l[2] + '] ' + l[1] + ': ' + l[3] + '\n'; });
  corpo += '\nRESERVAS DE BASE (' + reservas.length + ')' + (tokenMP_() ? '' : ' — confira o Pix e escreva "pago" na coluna status') + '\n';
  reservas.forEach(function (l) { corpo += l[0] + ' | ' + l[2] + ' | dono: ' + l[3] + (l[4] ? ' (' + l[4] + ')' : '') + ' | ' + l[5] + ' R$ ' + l[6] + ' | ' + l[7] + '\n'; });
  corpo += '\nPlanilha completa: ' + ss.getUrl() + '\n';

  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
    '[Colônia] Resumo: ' + novos.length + ' sobreviventes, ' + ideias.length + ' ideias, ' + reservas.length + ' terrenos', corpo);
  props.setProperty('ULTIMO_RESUMO', String(agora.getTime()));
}

/* ---------- ajudantes ---------- */
function planilha_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('PLANILHA_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('Colônia — sobreviventes e ideias');
  props.setProperty('PLANILHA_ID', ss.getId());
  return ss;
}

function garantirAba_(ss, nome, cabecalho) {
  let aba = ss.getSheetByName(nome);
  if (!aba) aba = ss.insertSheet(nome);
  if (aba.getLastRow() === 0) {
    aba.appendRow(cabecalho);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
  }
  return aba;
}

function linhas_(aba) {
  if (!aba || aba.getLastRow() < 2) return [];
  return aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues();
}

function limpar_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Evita que um texto começando com = + - @ vire fórmula na planilha
function texto_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
