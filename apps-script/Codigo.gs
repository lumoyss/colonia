/**
 * COLÔNIA — "cérebro" do site.
 * Guarda os sobreviventes e as ideias numa planilha do Google (sua, grátis)
 * e manda um resumo diário para o seu e-mail.
 *
 * Como usar: veja PASSO_A_PASSO.md. Você só precisa colar este código,
 * clicar em "Executar" na função setup e depois em "Implantar".
 */

const ABA_SOBREVIVENTES = 'Sobreviventes';
const ABA_IDEIAS = 'Ideias';
const ABA_TERRENOS = 'Terrenos';
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];

/* ---------- 1. Rode esta função uma vez ---------- */
function setup() {
  const ss = planilha_();
  garantirAba_(ss, ABA_SOBREVIVENTES, ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual']);
  garantirAba_(ss, ABA_IDEIAS, ['data', 'autor', 'tipo', 'texto']);
  garantirAba_(ss, ABA_TERRENOS, ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status']);
  ss.getSheets().forEach(function (aba) {
    const n = aba.getName();
    if ([ABA_SOBREVIVENTES, ABA_IDEIAS, ABA_TERRENOS].indexOf(n) < 0) ss.deleteSheet(aba);
  });

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'resumoDiario') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('resumoDiario').timeBased().everyDays(1).atHour(21).create();

  Logger.log('Tudo pronto! Sua planilha: ' + ss.getUrl());
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

  const trava = LockService.getScriptLock();
  trava.waitLock(15000);
  try {
    const ss = planilha_();
    let r;
    if (dados.acao === 'cadastrar') r = cadastrar_(ss, dados);
    else if (dados.acao === 'ideia') r = ideia_(ss, dados);
    else if (dados.acao === 'terreno') r = terreno_(ss, dados);
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
  const valor = Number(d.valor) || 0;
  const codigo = String(d.codigo || '').replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (lugar.length < 2) return { ok: false, erro: 'Dê um nome para o seu lugar.' };
  if (dono.length < 2) return { ok: false, erro: 'Diga o nome do dono.' };
  if (!codigo) return { ok: false, erro: 'Código inválido.' };
  ss.getSheetByName(ABA_TERRENOS).appendRow([codigo, new Date(), texto_(lugar), texto_(dono), instagram ? texto_('@' + instagram) : '', texto_(plano), valor, 'aguardando Pix']);
  return { ok: true, codigo: codigo };
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
  corpo += '\nRESERVAS DE TERRENO (' + reservas.length + ') — confira o Pix e escreva "pago" na coluna status\n';
  reservas.forEach(function (l) { corpo += l[0] + ' | ' + l[2] + ' | dono: ' + l[3] + (l[4] ? ' (' + l[4] + ')' : '') + ' | ' + l[5] + ' R$ ' + l[6] + '\n'; });
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
