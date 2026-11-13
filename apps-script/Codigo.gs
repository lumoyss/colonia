/**
 * COLÔNIA ZERO — "cérebro" do site.
 * Guarda tudo numa planilha do Google (sua, grátis): sobreviventes, ideias,
 * moedas, compras do mercado e o chat. Manda um resumo diário para o seu e-mail.
 *
 * Depois de colar este código: rode a função "setup" e faça
 * Implantar → Gerenciar implantações → lápis → Nova versão → Implantar.
 *
 * MODERAÇÃO (na planilha):
 *  - Apagar mensagem do chat: aba Chat, escreva "apagado" na coluna status.
 *  - Banir alguém do chat: aba Sobreviventes, escreva "sim" na coluna banido.
 *  - Dar moedas a alguém: aba Sobreviventes, mude o número na coluna moedas.
 */

// Sua InfiniteTag (sem o $). Os pagamentos em Pix caem na sua InfinitePay, sem taxa.
const INFINITE_TAG = 'lumoyss';
const SITE_URL = 'https://lumoyss.github.io/colonia/';

const ABA_SOBREVIVENTES = 'Sobreviventes';
const ABA_IDEIAS = 'Ideias';
const ABA_TERRENOS = 'Terrenos';
const ABA_PEDIDOS = 'Pedidos';
const ABA_COMPRAS = 'Compras';
const ABA_CHAT = 'Chat';
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];

// Colunas da aba Sobreviventes (1 = A)
const C_NUMERO = 1, C_NOME = 3, C_INSTA = 4, C_PROF = 5, C_VISUAL = 7, C_MOEDAS = 8, C_CHAVE = 9, C_ITENS = 10, C_BANIDO = 11;

/* ---------- MERCADO: pacotes de moedas (em reais) e itens (em moedas) ---------- */
const PACOTES = {
  moedas1000: { nome: '1.000 moedas', reais: 10, moedas: 1000 }
};
const ITENS = [
  { id: 'base', cat: 'Residência', nome: 'Base oxigenada', preco: 500, base: true,
    desc: 'Sua base no mapa, com o nome que você escolher. Você vira cidadão da colônia e ganha voto (peso 1).' },
  { id: 'base_grande', cat: 'Residência', nome: 'Base grande', preco: 1500, base: true,
    desc: 'Uma base maior no mapa, com placa. Voto com peso 2.' },
  { id: 'traje_dourado', cat: 'Roupas', nome: 'Traje dourado', preco: 300,
    desc: 'Seu bonequinho passa a andar de traje dourado no mapa.' },
  { id: 'capacete_dourado', cat: 'Acessórios', nome: 'Capacete dourado', preco: 200,
    desc: 'Um capacete dourado que todo mundo vê no mapa.' },
  { id: 'mochila', cat: 'Acessórios', nome: 'Mochila de oxigênio', preco: 150,
    desc: 'Ar extra nas costas do seu bonequinho.' },
  { id: 'ferramentas', cat: 'Ferramentas', nome: 'Kit de ferramentas', preco: 100,
    desc: 'Para ajudar a consertar a nave. Fica no seu inventário.' },
  { id: 'picareta', cat: 'Ferramentas', nome: 'Picareta', preco: 100,
    desc: 'Para minerar o planeta. Fica no seu inventário.' }
];

/* ---------- 1. Rode esta função depois de colar o código ---------- */
function setup() {
  const ss = planilha_();
  colunas_(garantirAba_(ss, ABA_SOBREVIVENTES), ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual', 'moedas', 'chave', 'itens', 'banido']);
  colunas_(garantirAba_(ss, ABA_IDEIAS), ['data', 'autor', 'tipo', 'texto']);
  colunas_(garantirAba_(ss, ABA_TERRENOS), ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status', 'ref']);
  colunas_(garantirAba_(ss, ABA_PEDIDOS), ['codigo', 'data', 'numero', 'nome', 'pacote', 'reais', 'moedas', 'status', 'ref']);
  colunas_(garantirAba_(ss, ABA_COMPRAS), ['data', 'numero', 'nome', 'item', 'preco_moedas']);
  colunas_(garantirAba_(ss, ABA_CHAT), ['data', 'numero', 'nome', 'texto', 'status']);

  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('resumoDiario').timeBased().everyDays(1).atHour(21).create();

  Logger.log('Tudo pronto! Sua planilha: ' + ss.getUrl());
}

/* ---------- O site lê a colônia (e o chat) por aqui ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.chat) return json_(lerChat_());

  const cache = CacheService.getScriptCache();
  const guardado = cache.get('lista');
  if (guardado) return json_(JSON.parse(guardado));

  const ss = planilha_();
  const sobreviventes = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).map(function (l) {
    return { numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], visual: String(l[6] || ''), itens: String(l[9] || '') };
  });
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).slice(-60).reverse().map(function (l) {
    return { data: l[0], autor: l[1], tipo: l[2], texto: l[3] };
  });
  const terrenos = linhas_(ss.getSheetByName(ABA_TERRENOS)).filter(function (l) {
    return String(l[7]).trim().toLowerCase() === 'pago';
  }).map(function (l) { return { nome: l[2], dono: l[3], plano: l[5] }; });
  const mercado = {
    pacotes: Object.keys(PACOTES).map(function (k) { return { id: k, nome: PACOTES[k].nome, reais: PACOTES[k].reais, moedas: PACOTES[k].moedas }; }),
    itens: ITENS.map(function (i) { return { id: i.id, cat: i.cat, nome: i.nome, preco: i.preco, desc: i.desc, base: !!i.base }; })
  };
  const resposta = { ok: true, total: sobreviventes.length, sobreviventes: sobreviventes.slice(-600), ideias: ideias, terrenos: terrenos, mercado: mercado, chat: true };
  try { cache.put('lista', JSON.stringify(resposta), 20); } catch (err) { /* grande demais para o cache */ }
  return json_(resposta);
}

/* ---------- O site envia cadastros, ideias, compras e mensagens por aqui ---------- */
function doPost(e) {
  let dados;
  try { dados = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, erro: 'Dados inválidos.' }); }
  if (dados.site) return json_({ ok: true, numero: 0 }); // armadilha para robôs
  // Aviso automático da InfinitePay de que um pagamento caiu
  if (dados.invoice_slug && dados.order_nsu) dados = { acao: 'confirmar', order_nsu: dados.order_nsu, transaction_nsu: dados.transaction_nsu, slug: dados.invoice_slug };

  const trava = LockService.getScriptLock();
  trava.waitLock(20000);
  try {
    const ss = planilha_();
    const acoes = { cadastrar: cadastrar_, ideia: ideia_, entrar: perfil_, perfil: perfil_, moedas: pedirMoedas_, confirmar: confirmar_, comprar: comprar_, chat: enviarChat_ };
    const f = acoes[dados.acao];
    const r = f ? f(ss, dados) : { ok: false, erro: 'Ação desconhecida.' };
    if (r.ok && dados.acao !== 'perfil' && dados.acao !== 'entrar' && dados.acao !== 'chat') CacheService.getScriptCache().remove('lista');
    return json_(r);
  } finally {
    trava.releaseLock();
  }
}

/* ---------- Sobreviventes ---------- */
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

  const numero = existentes.length ? Math.max.apply(null, existentes.map(function (l) { return Number(l[0]) || 0; })) + 1 : 1;
  const chave = gerarChave_();
  aba.appendRow([numero, new Date(), texto_(nome), instagram ? texto_('@' + instagram) : '', texto_(profissao), texto_(historia), texto_(visual), 0, chave, '', '']);
  return { ok: true, numero: numero, chave: chave, moedas: 0, itens: '' };
}

// Acha o sobrevivente pelo nome + código de acesso
function acharSobrevivente_(ss, d) {
  const aba = ss.getSheetByName(ABA_SOBREVIVENTES);
  const nome = limpar_(d.nome, 24).toLowerCase();
  const chave = String(d.chave || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!nome || chave.length < 4) return null;
  const ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) {
    if (String(ls[i][C_NOME - 1]).toLowerCase() === nome && String(ls[i][C_CHAVE - 1]).toUpperCase() === chave) {
      return { aba: aba, linha: i + 2, dados: ls[i] };
    }
  }
  return null;
}

function perfilDe_(s) {
  const l = s.dados;
  return { ok: true, numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], visual: String(l[6] || ''),
    moedas: Number(l[C_MOEDAS - 1]) || 0, itens: String(l[C_ITENS - 1] || ''), chave: String(l[C_CHAVE - 1]) };
}

function perfil_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Nome ou código de acesso errado.' };
  return perfilDe_(s);
}

function ideia_(ss, d) {
  const texto = limpar_(d.texto, 500);
  const autor = limpar_(d.autor, 24) || 'Anônimo';
  const tipo = TIPOS_IDEIA.indexOf(d.tipo) >= 0 ? d.tipo : 'outro';
  if (texto.length < 3) return { ok: false, erro: 'Escreva sua ideia antes de enviar.' };
  ss.getSheetByName(ABA_IDEIAS).appendRow([new Date(), texto_(autor), tipo, texto_(texto)]);
  return { ok: true };
}

/* ---------- Mercado: comprar moedas com Pix (InfinitePay) ---------- */
function pedirMoedas_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente antes de adquirir moedas.' };
  const pac = PACOTES[d.pacote];
  if (!pac) return { ok: false, erro: 'Pacote inválido.' };
  if (!INFINITE_TAG) return { ok: false, erro: 'Pagamentos ainda não estão ligados.' };

  const codigo = 'M' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  const r = UrlFetchApp.fetch('https://api.checkout.infinitepay.io/links', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({
      handle: INFINITE_TAG,
      order_nsu: codigo,
      redirect_url: SITE_URL,
      webhook_url: ScriptApp.getService().getUrl(),
      items: [{ quantity: 1, price: Math.round(pac.reais * 100), description: pac.nome + ' - Colonia Zero' }]
    })
  });
  let link = null;
  try { link = JSON.parse(r.getContentText()).url; } catch (err) { /* resposta inválida */ }
  if (!link) { Logger.log('InfinitePay: ' + r.getContentText()); return { ok: false, erro: 'Não consegui abrir o pagamento agora. Tente de novo em instantes.' }; }

  const l = s.dados;
  ss.getSheetByName(ABA_PEDIDOS).appendRow([codigo, new Date(), l[0], texto_(String(l[2])), d.pacote, pac.reais, pac.moedas, 'aguardando pagamento', '']);
  return { ok: true, codigo: codigo, link: link };
}

// Chamado quando a pessoa volta do pagamento e pelo aviso automático da InfinitePay
function confirmar_(ss, d) {
  const codigo = String(d.order_nsu || '');
  const aba = ss.getSheetByName(ABA_PEDIDOS);
  const ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) {
    if (String(ls[i][0]) !== codigo) continue;
    const moedas = Number(ls[i][6]) || 0;
    if (String(ls[i][7]).toLowerCase() === 'pago') return { ok: true, pago: true, moedas: moedas };

    const r = UrlFetchApp.fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ handle: INFINITE_TAG, order_nsu: codigo, transaction_nsu: String(d.transaction_nsu || ''), slug: String(d.slug || '') })
    });
    let res = {};
    try { res = JSON.parse(r.getContentText()); } catch (err) { /* resposta inválida */ }
    if (!(res.paid && Number(res.amount) >= Math.round(Number(ls[i][5]) * 100))) return { ok: true, pago: false };

    aba.getRange(i + 2, 8).setValue('pago');
    aba.getRange(i + 2, 9).setValue('infinitepay ' + (d.slug || ''));
    // Credita as moedas no sobrevivente
    const sobr = ss.getSheetByName(ABA_SOBREVIVENTES);
    const lsS = linhas_(sobr);
    for (let j = 0; j < lsS.length; j++) {
      if (String(lsS[j][0]) === String(ls[i][2])) {
        sobr.getRange(j + 2, C_MOEDAS).setValue((Number(lsS[j][C_MOEDAS - 1]) || 0) + moedas);
        break;
      }
    }
    return { ok: true, pago: true, moedas: moedas };
  }
  return { ok: false, erro: 'Pedido não encontrado.' };
}

/* ---------- Mercado: trocar moedas por itens ---------- */
function comprar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente primeiro.' };
  const item = ITENS.filter(function (i) { return i.id === d.item; })[0];
  if (!item) return { ok: false, erro: 'Item inválido.' };

  const p = perfilDe_(s);
  const meus = p.itens ? p.itens.split(',') : [];
  if (meus.indexOf(item.id) >= 0) return { ok: false, erro: 'Você já tem esse item.' };
  if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };

  let lugar = '';
  if (item.base) {
    lugar = limpar_(d.lugar, 28);
    if (lugar.length < 2) return { ok: false, erro: 'Dê um nome para a sua base.' };
  }

  meus.push(item.id);
  s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas - item.preco);
  s.aba.getRange(s.linha, C_ITENS).setValue(meus.join(','));
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome, item.preco]);
  if (item.base) {
    ss.getSheetByName(ABA_TERRENOS).appendRow(['B' + p.numero + item.id, new Date(), texto_(lugar), texto_(String(p.nome)), p.instagram ? texto_(String(p.instagram)) : '', item.nome, item.preco + ' moedas', 'pago', 'moedas']);
  }
  p.moedas -= item.preco;
  p.itens = meus.join(',');
  return p;
}

/* ---------- Chat: Rádio da nave ---------- */
function lerChat_() {
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('chat');
  if (guardado) return JSON.parse(guardado);
  const aba = planilha_().getSheetByName(ABA_CHAT);
  const msgs = linhas_(aba).filter(function (l) { return String(l[4]).toLowerCase() !== 'apagado'; }).slice(-60).map(function (l) {
    return { t: new Date(l[0]).getTime(), numero: l[1], nome: l[2], texto: l[3] };
  });
  const r = { ok: true, mensagens: msgs };
  try { cache.put('chat', JSON.stringify(r), 4); } catch (err) { /* ok */ }
  return r;
}

function enviarChat_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para falar no rádio.' };
  if (String(s.dados[C_BANIDO - 1]).trim()) return { ok: false, erro: 'Você foi silenciado no rádio da nave.' };
  const texto = limpar_(d.texto, 280);
  if (!texto) return { ok: false, erro: 'Escreva uma mensagem.' };

  const cache = CacheService.getScriptCache();
  const chaveTempo = 'ultimo_' + s.dados[0];
  if (cache.get(chaveTempo)) return { ok: false, erro: 'Calma! Espere alguns segundos entre as mensagens.' };
  cache.put(chaveTempo, '1', 4);

  ss.getSheetByName(ABA_CHAT).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), texto_(texto), '']);
  cache.remove('chat');
  return { ok: true };
}

/* ---------- Resumo diário no seu e-mail (o Claude lê por aqui) ---------- */
function resumoDiario() {
  const props = PropertiesService.getScriptProperties();
  const desde = new Date(Number(props.getProperty('ULTIMO_RESUMO') || 0));
  const agora = new Date();
  const ss = planilha_();
  const novo = function (col) { return function (l) { return new Date(l[col]) > desde; }; };

  const novos = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(novo(1));
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).filter(novo(0));
  const pedidos = linhas_(ss.getSheetByName(ABA_PEDIDOS)).filter(novo(1)).filter(function (l) { return String(l[7]) === 'pago'; });
  const compras = linhas_(ss.getSheetByName(ABA_COMPRAS)).filter(novo(0));
  const chat = linhas_(ss.getSheetByName(ABA_CHAT)).filter(novo(0));
  if (!novos.length && !ideias.length && !pedidos.length && !compras.length && !chat.length) return;

  const reais = pedidos.reduce(function (s, l) { return s + (Number(l[5]) || 0); }, 0);
  let corpo = 'RESUMO DA COLÔNIA\n\n';
  corpo += 'NOVOS SOBREVIVENTES (' + novos.length + ')\n';
  novos.forEach(function (l) {
    corpo += '#' + l[0] + ' ' + l[2] + (l[3] ? ' (' + l[3] + ')' : '') + ' | ' + l[4] + (l[5] ? '\n   História: ' + l[5] : '') + '\n';
  });
  corpo += '\nIDEIAS PARA A HISTÓRIA (' + ideias.length + ')\n';
  ideias.forEach(function (l) { corpo += '[' + l[2] + '] ' + l[1] + ': ' + l[3] + '\n'; });
  corpo += '\nMOEDAS VENDIDAS (' + pedidos.length + ' pedidos, R$ ' + reais.toFixed(2) + ')\n';
  pedidos.forEach(function (l) { corpo += '#' + l[2] + ' ' + l[3] + ' | ' + l[6] + ' moedas | R$ ' + l[5] + '\n'; });
  corpo += '\nCOMPRAS NO MERCADO (' + compras.length + ')\n';
  compras.forEach(function (l) { corpo += '#' + l[1] + ' ' + l[2] + ' | ' + l[3] + ' | ' + l[4] + ' moedas\n'; });
  corpo += '\nRÁDIO DA NAVE (' + chat.length + ' mensagens)\n';
  chat.slice(-40).forEach(function (l) { corpo += l[2] + ': ' + l[3] + '\n'; });
  corpo += '\nPlanilha completa: ' + ss.getUrl() + '\n';

  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
    '[Colônia] Resumo: ' + novos.length + ' sobreviventes, ' + ideias.length + ' ideias, R$ ' + reais.toFixed(2) + ' em moedas', corpo);
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

function garantirAba_(ss, nome) {
  return ss.getSheetByName(nome) || ss.insertSheet(nome);
}

// Garante os títulos das colunas sem apagar nada que já existe
function colunas_(aba, cabecalho) {
  cabecalho.forEach(function (t, i) {
    const c = aba.getRange(1, i + 1);
    if (c.getValue() === '') c.setValue(t).setFontWeight('bold');
  });
  aba.setFrozenRows(1);
}

function linhas_(aba) {
  if (!aba || aba.getLastRow() < 2) return [];
  return aba.getRange(2, 1, aba.getLastRow() - 1, Math.max(aba.getLastColumn(), 11)).getValues();
}

function gerarChave_() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += letras.charAt(Math.floor(Math.random() * letras.length));
  return s;
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

/* ---------- Teste: rode para ver se a InfinitePay está aceitando ---------- */
function testarInfinitePay() {
  const r = UrlFetchApp.fetch('https://api.checkout.infinitepay.io/links', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ handle: INFINITE_TAG, order_nsu: 'TESTE' + Date.now(), items: [{ quantity: 1, price: 1000, description: 'Teste da colonia' }] })
  });
  Logger.log('Resposta da InfinitePay (' + r.getResponseCode() + '): ' + r.getContentText());
}
