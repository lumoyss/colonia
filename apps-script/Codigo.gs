/**
 * NAVE ORION — "cérebro" do site.
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
const ABA_OFERTAS = 'Ofertas';
const ABA_ALUGUEIS = 'Alugueis';
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];

// Colunas da aba Sobreviventes (1 = A)
const C_NUMERO = 1, C_NOME = 3, C_INSTA = 4, C_PROF = 5, C_VISUAL = 7, C_MOEDAS = 8, C_CHAVE = 9, C_ITENS = 10, C_BANIDO = 11;
const C_ON_DIA = 12, C_ON_MIN = 13, C_ON_ULTIMO = 14, C_TURNO = 15, C_PROGRESSO = 16, C_DESCANSO = 17, C_RECON = 18, C_OUTDOOR = 19;
const C_VESTE = 20, C_GAS = 21, C_OBJETIVO = 22, C_AMIGOS = 23, C_MINERAR = 24, C_DATA = 2, C_HIST = 6;
const C_OUT_PRECO = 25, C_OUT_ANUNCIO = 26, C_OUT_AUTOR = 27, C_OUT_ATE = 28;

/* ---------- MISSÃO: consertar a nave (ganha moedas com o site aberto) ---------- */
const MINUTOS_POR_MOEDA = 1;    // 1 moeda a cada 1 minuto consertando
const TURNO_MINUTOS = 240;      // depois de 4 horas consertando, cansa
const DESCANSO_COM_BASE = 60;   // quem mora numa casa (dono ou aluguel) descansa 1 hora
const DESCANSO_SEM_BASE = 120;  // quem não tem onde morar descansa 2 horas
const LIMITE_MINUTOS_DIA = 1440; // sem limite por dia (o descanso já segura)
// Gás de oxigênio: sem gás o sobrevivente fica doente e não trabalha nem minera.
const GAS_PRECO = 50;           // moedas; vale até o fim do dia
const GAS_GRATIS_NO_CADASTRO = true; // quem acorda ganha o gás do primeiro dia
// Picareta: minerar fora da zona dos terrenos
const MINERAR_SEGUNDOS = 120;   // tempo entre uma minerada e outra
const MINERAR_CHANCE = 0.4;     // chance de achar um recurso
const ESPECIAIS = [];           // itens especiais que podem sair na mineração (o Lucas ainda vai criar)
const ESPECIAL_CHANCE = 0.02;
// Aluguel: o dono escolhe o preço por semana; o inquilino paga adiantado
const ALUGUEL_DIAS = 7;
// TAXAS da colônia (ficam com você). Coloque em CONTA_DONO o número do SEU sobrevivente
// para as taxas caírem nele; vazio = somam no cofre (aparece no e-mail diário).
const CONTA_DONO = '';
const TAXA_ANUNCIO = 0.10;      // 10% de cada anúncio pago em outdoor
const TAXA_ALUGUEL = 0.01;      // 1% de cada aluguel
const TAXA_TERRENO = 0.02;      // 2% de cada venda de terreno/casa entre jogadores
const ANUNCIO_HORAS = 24;       // quanto tempo um anúncio fica no outdoor
// Ideias: só quem tem casa construída pode mandar
const IDEIA_PRECISA_BASE = true;

/* ---------- MERCADO: pacotes de moedas (em reais) e itens (em moedas) ---------- */
const PACOTES = {
  moedas1000: { nome: '1.000 moedas', reais: 9.99, moedas: 1000 },
  moedas5500: { nome: '5.500 moedas', reais: 47, moedas: 5500 }
};
/* ---------- EXPLORAÇÃO: o baú do dia ---------- */
// Todo dia um baú aparece num lugar do mapa, num horário entre 10h e 21h.
// Quem chegar primeiro com o bonequinho e abrir leva os recursos.
const RECURSOS = [
  { id: 'cristal', nome: 'Cristal de oxigênio' },
  { id: 'peca', nome: 'Peça da nave' },
  { id: 'minerio', nome: 'Minério raro' },
  { id: 'semente', nome: 'Semente alienígena' },
  { id: 'fossil', nome: 'Fóssil antigo' }
];
const BAU_QTD_RECURSOS = 3;          // quantos recursos vêm no baú
const BAU_CHANCE_RARO = 0.15;        // chance de vir também um item raro do mercado
const BAU_RAROS = ['capacete_dourado', 'traje_dourado', 'mochila'];
const MAPA_L = 640, MAPA_A = 400;    // tamanho do mapa (o site usa o mesmo)

/* ---------- TERRENOS: explorar, reconhecer e registrar ---------- */
// O mapa é dividido em lotes de 60 x 50 (8 colunas x 6 linhas). Os 4 lotes do meio são da nave.
// A pessoa fica parada dentro de um lote livre por TERRENO_MINUTOS (reconhecimento),
// volta para a nave e registra o terreno pagando TERRENO_PRECO moedas.
// Quando acabarem os terrenos livres, só dá para conseguir um no mercado dos sobreviventes.
const LOTE_L = 60, LOTE_A = 50, LOTE_COLUNAS = 8, LOTE_LINHAS = 6;
const LOTE_X0 = 80, LOTE_Y0 = 50;    // onde começa a zona dos terrenos; fora dela é zona de mineração
const LOTES_DA_NAVE = [20, 21, 28, 29];
const TERRENO_PRECO = 400;           // registro do terreno, em moedas
const TERRENO_MINUTOS = 3;           // tempo parado dentro do terreno para reconhecer
const TERRENOS_POR_PESSOA = 1;       // quantos terrenos cada um pode registrar (no mercado pode comprar mais)

const ITENS = [
  { id: 'base', cat: 'Residência', nome: 'Casa oxigenada', preco: 500, base: true, vagas: 1,
    desc: 'Sua casa, construída dentro do seu terreno, com o nome que você escolher. Você vira cidadão da colônia, pode mandar ideias e ganha voto (peso 1). Pode ser alugada.' },
  { id: 'base_grande', cat: 'Residência', nome: 'Prédio com 8 apartamentos', preco: 3000, base: true, vagas: 8,
    desc: 'Um prédio no seu terreno, com placa. Voto com peso 2. Você pode alugar os 8 apartamentos para outros sobreviventes.' },
  { id: 'outdoor', cat: 'Residência', nome: 'Outdoor', preco: 300, terreno: true, fixo: true,
    desc: 'Uma placa grande num terreno SEM construção, com a frase que você quiser (até 40 letras). Você pode cobrar de quem quiser anunciar nele. Para construir depois, é só tirar o outdoor.' },
  { id: 'gas', cat: 'Oxigênio', nome: 'Gás de oxigênio', preco: GAS_PRECO, gas: true,
    desc: 'Dura o dia inteiro (até meia-noite). Sem gás o seu sobrevivente fica doente e não pode trabalhar nem minerar.' },
  { id: 'bone', cat: 'Roupas', nome: 'Boné', preco: 40, slot: 'cabeca', desc: 'Um boné vermelho.' },
  { id: 'calca', cat: 'Roupas', nome: 'Calça jeans', preco: 50, slot: 'pernas', desc: 'Calça azul por cima do traje.' },
  { id: 'chapeu', cat: 'Roupas', nome: 'Chapéu', preco: 60, slot: 'cabeca', desc: 'Chapéu de explorador.' },
  { id: 'colete', cat: 'Roupas', nome: 'Colete', preco: 70, slot: 'tronco', desc: 'Colete de couro por cima do traje.' },
  { id: 'vestido', cat: 'Roupas', nome: 'Vestido', preco: 90, slot: 'tronco,pernas', desc: 'Vestido vermelho.' },
  { id: 'capacete_dourado', cat: 'Roupa dourada', nome: 'Capacete dourado', preco: 500, slot: 'capacete', desc: 'Capacete de ouro que todo mundo vê no mapa.' },
  { id: 'bota_dourada', cat: 'Roupa dourada', nome: 'Bota dourada', preco: 500, slot: 'pes', desc: 'Botas de ouro.' },
  { id: 'calca_dourada', cat: 'Roupa dourada', nome: 'Calça dourada', preco: 700, slot: 'pernas', desc: 'Calça de ouro.' },
  { id: 'blusa_dourada', cat: 'Roupa dourada', nome: 'Blusa dourada', preco: 800, slot: 'tronco', desc: 'Blusa de ouro.' },
  { id: 'mochila', cat: 'Acessórios', nome: 'Mochila de oxigênio', preco: 150, slot: 'costas', desc: 'Um tanque de ar nas costas do seu bonequinho.' },
  { id: 'picareta', cat: 'Ferramentas', nome: 'Picareta', preco: 300,
    desc: 'Leve o seu bonequinho para fora da zona dos terrenos (a borda pedregosa do mapa) e minere. Dá para achar recursos e, às vezes, itens especiais.' },
  { id: 'ferramentas', cat: 'Ferramentas', nome: 'Kit de ferramentas', preco: 100,
    desc: 'Para ajudar a consertar a nave. Fica no seu inventário.' }
];
// Peças antigas que ainda aparecem para quem já tem
const SLOTS_ANTIGOS = { traje_dourado: 'tronco,pernas' };

/* ---------- 1. Rode esta função depois de colar o código ---------- */
function setup() {
  const ss = planilha_();
  colunas_(garantirAba_(ss, ABA_SOBREVIVENTES), ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual', 'moedas', 'chave', 'itens', 'banido', 'online_dia', 'online_minutos', 'online_ultimo', 'turno_minutos', 'progresso_moeda', 'descanso_ate', 'reconhecimento', 'outdoor', 'vestindo', 'gas_dia', 'objetivo', 'amigos', 'minerou', 'outdoor_preco', 'anuncio', 'anuncio_autor', 'anuncio_ate']);
  colunas_(garantirAba_(ss, ABA_IDEIAS), ['data', 'autor', 'tipo', 'texto', 'id', 'numero', 'gostei']);
  colunas_(garantirAba_(ss, ABA_TERRENOS), ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status', 'ref', 'aluguel_semana', 'dono_numero', 'item']);
  colunas_(garantirAba_(ss, ABA_PEDIDOS), ['codigo', 'data', 'numero', 'nome', 'pacote', 'reais', 'moedas', 'status', 'ref']);
  colunas_(garantirAba_(ss, ABA_COMPRAS), ['data', 'numero', 'nome', 'item', 'preco_moedas']);
  colunas_(garantirAba_(ss, ABA_CHAT), ['data', 'numero', 'nome', 'texto', 'status']);
  colunas_(garantirAba_(ss, ABA_ALUGUEIS), ['data', 'imovel', 'dono_numero', 'dono', 'inquilino_numero', 'inquilino', 'preco', 'ate']);
  colunas_(garantirAba_(ss, ABA_OFERTAS), ['id', 'data', 'vendedor_numero', 'vendedor', 'item', 'preco', 'status', 'comprador_numero', 'comprador']);

  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('resumoDiario').timeBased().everyDays(1).atHour(21).create();

  Logger.log('Tudo pronto! Sua planilha: ' + ss.getUrl());
}

/* ---------- O site lê a colônia (e o chat) por aqui ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.chat) return json_(lerChat_());
  if (p.perfil) return json_(perfilPublico_(p.perfil));

  const cache = CacheService.getScriptCache();
  const guardado = cache.get('lista');
  if (guardado) return json_(JSON.parse(guardado));

  const ss = planilha_();
  const sobreviventes = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).map(function (l) {
    return { numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], visual: String(l[6] || ''), itens: String(l[9] || ''), outdoor: String(l[C_OUTDOOR - 1] || ''), veste: vesteDe_(l) };
  });
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).map(function (l, i) {
    const quem = String(l[6] || '').split(',').filter(String).map(Number);
    return { id: String(l[4] || ('L' + (i + 2))), data: l[0], autor: l[1], tipo: l[2], texto: l[3], gostei: quem.length, quem: quem };
  }).slice(-60).reverse();
  const terrenos = linhas_(ss.getSheetByName(ABA_TERRENOS)).filter(function (l) {
    return String(l[7]).trim().toLowerCase() === 'pago';
  }).map(function (l) { return { nome: l[2], dono: l[3], plano: l[5] }; });
  const alugueis = listarImoveis_(ss);
  const outdoors = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return tem_(String(l[C_ITENS - 1] || ''), 'outdoor'); }).map(outdoorDe_);
  const mercado = {
    pacotes: Object.keys(PACOTES).map(function (k) { return { id: k, nome: PACOTES[k].nome, reais: PACOTES[k].reais, moedas: PACOTES[k].moedas }; }),
    missao: { porMoeda: MINUTOS_POR_MOEDA, turno: TURNO_MINUTOS, descansoBase: DESCANSO_COM_BASE, descansoSemBase: DESCANSO_SEM_BASE, limite: LIMITE_MINUTOS_DIA },
    minerar: { segundos: MINERAR_SEGUNDOS }, aluguelDias: ALUGUEL_DIAS, ideiaPrecisaBase: IDEIA_PRECISA_BASE, anuncioHoras: ANUNCIO_HORAS,
    taxas: { anuncio: TAXA_ANUNCIO, aluguel: TAXA_ALUGUEL, terreno: TAXA_TERRENO },
    itens: ITENS.map(function (i) { return { id: i.id, cat: i.cat, nome: i.nome, preco: i.preco, desc: i.desc, base: !!i.base, terreno: !!(i.base || i.terreno), fixo: !!(i.base || i.fixo || i.gas), gas: !!i.gas, slot: i.slot || '', vagas: i.vagas || 0 }; }),
    recursos: RECURSOS,
    terrenos: { x0: LOTE_X0, y0: LOTE_Y0, l: LOTE_L, a: LOTE_A, colunas: LOTE_COLUNAS, linhas: LOTE_LINHAS, nave: LOTES_DA_NAVE, preco: TERRENO_PRECO, minutos: TERRENO_MINUTOS, porPessoa: TERRENOS_POR_PESSOA }
  };
  const ofertas = linhas_(ss.getSheetByName(ABA_OFERTAS)).filter(function (l) { return l[6] === 'aberta'; }).slice(-100).reverse().map(function (l) {
    return { id: l[0], vendedor: l[3], item: l[4], preco: l[5] };
  });
  const b = bauDeHoje_(), aberto = PropertiesService.getScriptProperties().getProperty('BAU_' + b.dia);
  const bau = { dia: b.dia, hora: b.hora, aparece: b.aparece, x: Date.now() >= b.aparece ? b.x : null, y: Date.now() >= b.aparece ? b.y : null, abertoPor: aberto ? JSON.parse(aberto).nome : '' };
  const resposta = { ok: true, total: sobreviventes.length, sobreviventes: sobreviventes.slice(-600), ideias: ideias, terrenos: terrenos, mercado: mercado, chat: true, alugueis: alugueis, outdoors: outdoors,
    ofertas: ofertas, bau: bau, mapa: { l: MAPA_L, a: MAPA_A } };
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
    const acoes = { cadastrar: cadastrar_, ideia: ideia_, entrar: perfil_, perfil: perfil_, moedas: pedirMoedas_, confirmar: confirmar_, comprar: comprar_, chat: enviarChat_, consertar: consertar_,
      bau: abrirBau_, vender: vender_, cancelar: cancelarOferta_, comprar_oferta: comprarOferta_,
      reconhecer: reconhecer_, registrar_terreno: registrarTerreno_, outdoor: trocarOutdoor_, outdoor_preco: precoOutdoor_, tirar_outdoor: tirarOutdoor_, anunciar: anunciar_,
      curtir: curtir_, vestir: vestir_, minerar: minerar_, aluguel_preco: precoAluguel_, alugar: alugar_, amigo: amigo_, objetivo: mudarObjetivo_ };
    const f = acoes[dados.acao];
    const r = f ? f(ss, dados) : { ok: false, erro: 'Ação desconhecida.' };
    if (r.ok && ['perfil', 'entrar', 'chat', 'consertar', 'reconhecer', 'amigo', 'objetivo'].indexOf(dados.acao) < 0) CacheService.getScriptCache().remove('lista');
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
  const objetivo = limpar_(d.objetivo, 120);

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
  const linha = [numero, new Date(), texto_(nome), instagram ? texto_('@' + instagram) : '', texto_(profissao), texto_(historia), texto_(visual), 0, chave, '', ''];
  while (linha.length < C_OUT_ATE) linha.push('');
  if (GAS_GRATIS_NO_CADASTRO) linha[C_GAS - 1] = "'" + hoje_();
  linha[C_OBJETIVO - 1] = texto_(objetivo);
  aba.appendRow(linha);
  return { ok: true, numero: numero, chave: chave, moedas: 0, itens: '', gas: GAS_GRATIS_NO_CADASTRO, objetivo: objetivo };
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
    moedas: Number(l[C_MOEDAS - 1]) || 0, itens: String(l[C_ITENS - 1] || ''), chave: String(l[C_CHAVE - 1]), outdoor: String(l[C_OUTDOOR - 1] || ''), veste: vesteDe_(l), gas: temGas_(l), objetivo: String(l[C_OBJETIVO - 1] || ''),
    amigos: String(l[C_AMIGOS - 1] || '') };
}

function perfil_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Nome ou código de acesso errado.' };
  const p = perfilDe_(s), a = moradiaAlugada_(ss, p.numero);
  p.mora = a ? a.imovel : ''; p.moraAte = a ? a.ate : 0;
  return p;
}

function ideia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para mandar ideias.' };
  if (IDEIA_PRECISA_BASE && !temCasa_(String(s.dados[C_ITENS - 1] || ''))) return { ok: false, erro: 'Só quem tem casa construída pode mandar ideias. Registre um terreno e construa sua casa no Mercado. Você ainda pode dar "gostei" nas ideias dos outros.' };
  const texto = limpar_(d.texto, 500);
  const autor = String(s.dados[C_NOME - 1]);
  const tipo = TIPOS_IDEIA.indexOf(d.tipo) >= 0 ? d.tipo : 'outro';
  if (texto.length < 3) return { ok: false, erro: 'Escreva sua ideia antes de enviar.' };
  ss.getSheetByName(ABA_IDEIAS).appendRow([new Date(), texto_(autor), tipo, texto_(texto), 'I' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase(), s.dados[0], '']);
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
      items: [{ quantity: 1, price: Math.round(pac.reais * 100), description: pac.nome + ' - Nave Orion' }]
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
  if (item.gas) {
    if (p.gas) return { ok: false, erro: 'Você já tem gás de oxigênio para hoje. Amanhã compre de novo.' };
    if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };
    p.moedas -= item.preco; p.gas = true;
    s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas);
    s.aba.getRange(s.linha, C_GAS).setValue("'" + hoje_());
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome, item.preco]);
    return p;
  }
  if (meus.indexOf(item.id) >= 0) return { ok: false, erro: 'Você já tem esse item.' };
  if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };

  let lugar = '';
  if ((item.base || item.terreno) && !meus.some(function (i) { return /^lote_/.test(i); }))
    return { ok: false, erro: 'Para ter ' + (item.base ? 'uma base' : 'um ' + item.nome.toLowerCase()) + ' você precisa de um terreno. Explore o mapa e registre um terreno primeiro.' };
  if (item.id === 'outdoor' && temCasa_(p.itens)) return { ok: false, erro: 'O outdoor só pode ficar num terreno sem construção. Seu terreno já tem casa.' };
  if (item.base && tem_(p.itens, 'outdoor')) return { ok: false, erro: 'Seu terreno tem um outdoor. Tire o outdoor (no cartão do outdoor, aqui no Mercado) antes de construir.' };
  let frase = '';
  if (item.id === 'outdoor') {
    frase = limpar_(d.lugar, 40);
    if (!frase) return { ok: false, erro: 'Escreva a frase do seu outdoor.' };
  }
  if (item.base) {
    lugar = limpar_(d.lugar, 28);
    if (lugar.length < 2) return { ok: false, erro: 'Dê um nome para a sua base.' };
  }

  meus.push(item.id);
  if (item.slot) { p.veste = vestirLista_(p.veste, item.id, true); s.aba.getRange(s.linha, C_VESTE).setValue(p.veste || '-'); }
  if (frase) { s.aba.getRange(s.linha, C_OUTDOOR).setValue(texto_(frase)); p.outdoor = frase; }
  s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas - item.preco);
  s.aba.getRange(s.linha, C_ITENS).setValue(meus.join(','));
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome, item.preco]);
  if (item.base) {
    ss.getSheetByName(ABA_TERRENOS).appendRow(['B' + p.numero + item.id, new Date(), texto_(lugar), texto_(String(p.nome)), p.instagram ? texto_(String(p.instagram)) : '', item.nome, item.preco + ' moedas', 'pago', 'moedas', 0, p.numero, item.id]);
  }
  p.moedas -= item.preco;
  p.itens = meus.join(',');
  return p;
}

/* ---------- Missão: consertar a nave ---------- */
// O site chama isto 1 vez por minuto enquanto a pessoa está consertando.
function consertar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const l = s.dados, agora = Date.now(), cel = function (c, v) { s.aba.getRange(s.linha, c).setValue(v); };
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const diaSalvo = l[C_ON_DIA - 1] instanceof Date ? Utilities.formatDate(l[C_ON_DIA - 1], 'America/Sao_Paulo', 'yyyy-MM-dd') : String(l[C_ON_DIA - 1]).replace(/^'/, '');
  const itens = ',' + String(l[C_ITENS - 1] || '') + ',';
  const temBase = temCasa_(itens) || !!moradiaAlugada_(ss, l[0]);
  const gas = temGas_(l);

  let hojeMin = diaSalvo === hoje ? (Number(l[C_ON_MIN - 1]) || 0) : 0;
  let turno = Number(l[C_TURNO - 1]) || 0;
  let progresso = Number(l[C_PROGRESSO - 1]) || 0;
  let moedas = Number(l[C_MOEDAS - 1]) || 0, ganhou = 0;
  const descansoAte = Number(l[C_DESCANSO - 1]) || 0;
  const r = function (estadoAtual, restante) {
    return { ok: true, estado: estadoAtual, moedas: moedas, ganhou: ganhou, progresso: progresso, turno: turno, hojeMin: hojeMin,
      descansoSeg: restante || 0, temBase: temBase, gas: gas };
  };
  if (!gas) return r('doente');

  if (agora < descansoAte) return r('descansando', Math.ceil((descansoAte - agora) / 1000));
  if (hojeMin >= LIMITE_MINUTOS_DIA) return r('limite');
  if (agora - (Number(l[C_ON_ULTIMO - 1]) || 0) < 55000) return r('consertando'); // 1 minuto por vez, mesmo com várias abas

  hojeMin++; turno++; progresso++;
  if (progresso >= MINUTOS_POR_MOEDA) { progresso = 0; ganhou = 1; moedas += 1; cel(C_MOEDAS, moedas); }
  let est = 'consertando', restante = 0;
  if (turno >= TURNO_MINUTOS) {
    turno = 0; est = 'cansado';
    restante = (temBase ? DESCANSO_COM_BASE : DESCANSO_SEM_BASE) * 60;
    cel(C_DESCANSO, agora + restante * 1000);
  }
  cel(C_ON_DIA, "'" + hoje); cel(C_ON_MIN, hojeMin); cel(C_ON_ULTIMO, agora); cel(C_TURNO, turno); cel(C_PROGRESSO, progresso);
  return r(est, restante);
}

/* ---------- Inventário (itens repetidos = quantidade) ---------- */
function tirarItem_(lista, id) { const i = lista.indexOf(id); if (i < 0) return false; lista.splice(i, 1); return true; }
function salvarPerfil_(s, p) {
  s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas);
  s.aba.getRange(s.linha, C_ITENS).setValue(p.itens);
}
function linhaPorNumero_(ss, numero) {
  const aba = ss.getSheetByName(ABA_SOBREVIVENTES), ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) if (String(ls[i][0]) === String(numero)) return { aba: aba, linha: i + 2, dados: ls[i] };
  return null;
}

/* ---------- Baú do dia ---------- */
function bauDeHoje_() {
  const dia = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  let h = 0; for (let i = 0; i < dia.length; i++) h = (h * 31 + dia.charCodeAt(i)) % 1000003;
  const hora = 10 + h % 12;
  const x = 30 + (h * 7) % (MAPA_L - 60), y = 30 + (h * 13) % (MAPA_A - 60);
  const aparece = new Date(dia + 'T' + ('0' + hora).slice(-2) + ':00:00-03:00').getTime();
  return { dia: dia, hora: hora, x: x, y: y, aparece: aparece };
}

function abrirBau_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para abrir o baú.' };
  const b = bauDeHoje_(), props = PropertiesService.getScriptProperties();
  if (Date.now() < b.aparece) return { ok: false, erro: 'O baú de hoje ainda não apareceu. Ele surge às ' + b.hora + 'h.' };
  const ja = props.getProperty('BAU_' + b.dia);
  if (ja) return { ok: false, erro: JSON.parse(ja).nome + ' chegou primeiro e já abriu o baú de hoje.' };

  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [], ganhou = [];
  for (let i = 0; i < BAU_QTD_RECURSOS; i++) ganhou.push(RECURSOS[Math.floor(Math.random() * RECURSOS.length)].id);
  if (Math.random() < BAU_CHANCE_RARO) ganhou.push(BAU_RAROS[Math.floor(Math.random() * BAU_RAROS.length)]);
  p.itens = lista.concat(ganhou).join(',');
  salvarPerfil_(s, p);
  props.setProperty('BAU_' + b.dia, JSON.stringify({ nome: String(p.nome), numero: p.numero }));
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Baú do dia: ' + ganhou.join(', '), 0]);
  p.ganhou = ganhou;
  return p;
}

/* ---------- Outdoor: a frase no terreno ---------- */
// Para apagar uma frase feia: limpe a célula na coluna "outdoor" da aba Sobreviventes.
function trocarOutdoor_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s);
  if ((p.itens ? p.itens.split(',') : []).indexOf('outdoor') < 0) return { ok: false, erro: 'Você ainda não tem um outdoor.' };
  const frase = limpar_(d.texto, 40);
  if (!frase) return { ok: false, erro: 'Escreva a frase do seu outdoor.' };
  s.aba.getRange(s.linha, C_OUTDOOR).setValue(texto_(frase));
  p.outdoor = frase;
  return p;
}

/* ---------- Outdoor: anúncios pagos e taxas ---------- */
function creditar_(ss, numero, valor) {
  const l = linhaPorNumero_(ss, numero); if (!l || !valor) return;
  l.aba.getRange(l.linha, C_MOEDAS).setValue((Number(l.dados[C_MOEDAS - 1]) || 0) + valor);
}
function cobrarTaxa_(ss, valor, motivo) {
  if (!valor) return;
  if (CONTA_DONO && linhaPorNumero_(ss, CONTA_DONO)) creditar_(ss, CONTA_DONO, valor);
  else { const pr = PropertiesService.getScriptProperties(); pr.setProperty('COFRE', String((Number(pr.getProperty('COFRE')) || 0) + valor)); }
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), 0, 'COLÔNIA', motivo, valor]);
}
function outdoorDe_(l) {
  const ate = Number(l[C_OUT_ATE - 1]) || 0, ativo = ate > Date.now() && String(l[C_OUT_ANUNCIO - 1] || '');
  return { numero: l[0], dono: String(l[2]), texto: String(l[C_OUTDOOR - 1] || ''), preco: Number(l[C_OUT_PRECO - 1]) || 0,
    anuncio: ativo ? { texto: String(l[C_OUT_ANUNCIO - 1]), autor: String(l[C_OUT_AUTOR - 1] || ''), ate: ate } : null };
}
function precoOutdoor_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (!tem_(String(s.dados[C_ITENS - 1] || ''), 'outdoor')) return { ok: false, erro: 'Você não tem outdoor.' };
  const preco = Math.floor(Number(d.preco));
  if (!(preco >= 0 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço entre 0 e 100.000 moedas (0 = não aceitar anúncios).' };
  s.aba.getRange(s.linha, C_OUT_PRECO).setValue(preco);
  return { ok: true, preco: preco };
}
function tirarOutdoor_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (!tirarItem_(lista, 'outdoor')) return { ok: false, erro: 'Você não tem outdoor.' };
  if (Number(s.dados[C_OUT_ATE - 1]) > Date.now()) return { ok: false, erro: 'Tem um anúncio pago no seu outdoor até ' + Utilities.formatDate(new Date(Number(s.dados[C_OUT_ATE - 1])), 'America/Sao_Paulo', 'dd/MM HH:mm') + '. Espere ele acabar.' };
  p.itens = lista.join(','); salvarPerfil_(s, p);
  [C_OUTDOOR, C_OUT_PRECO, C_OUT_ANUNCIO, C_OUT_AUTOR, C_OUT_ATE].forEach(function (c) { s.aba.getRange(s.linha, c).setValue(''); });
  p.outdoor = '';
  return p;
}
function anunciar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const dono = linhaPorNumero_(ss, d.numero);
  if (!dono || !tem_(String(dono.dados[C_ITENS - 1] || ''), 'outdoor')) return { ok: false, erro: 'Esse outdoor não existe mais.' };
  const o = outdoorDe_(dono.dados);
  if (String(dono.dados[0]) === String(s.dados[0])) return { ok: false, erro: 'O outdoor é seu: troque a frase direto no cartão do outdoor.' };
  if (o.preco <= 0) return { ok: false, erro: 'Esse outdoor não está aceitando anúncios.' };
  if (o.anuncio) return { ok: false, erro: 'Esse outdoor já tem um anúncio até ' + Utilities.formatDate(new Date(o.anuncio.ate), 'America/Sao_Paulo', 'dd/MM HH:mm') + '.' };
  const texto = limpar_(d.texto, 40);
  if (!texto) return { ok: false, erro: 'Escreva a mensagem do anúncio.' };
  const p = perfilDe_(s);
  if (p.moedas < o.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + o.preco + '.' };
  p.moedas -= o.preco; salvarPerfil_(s, p);
  const taxa = Math.floor(o.preco * TAXA_ANUNCIO), ate = Date.now() + ANUNCIO_HORAS * 3600000;
  const fresco = linhaPorNumero_(ss, d.numero);
  fresco.aba.getRange(fresco.linha, C_MOEDAS).setValue((Number(fresco.dados[C_MOEDAS - 1]) || 0) + o.preco - taxa);
  fresco.aba.getRange(fresco.linha, C_OUT_ANUNCIO).setValue(texto_(texto));
  fresco.aba.getRange(fresco.linha, C_OUT_AUTOR).setValue(texto_(String(p.nome)));
  fresco.aba.getRange(fresco.linha, C_OUT_ATE).setValue(ate);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Anúncio no outdoor de ' + o.dono + ': ' + texto, o.preco]);
  cobrarTaxa_(ss, taxa, 'Taxa de anúncio (outdoor de ' + o.dono + ')');
  p.anuncioAte = ate;
  return p;
}

/* ---------- Terrenos ---------- */
function loteEm_(x, y) {
  const c = Math.floor((x - LOTE_X0) / LOTE_L), l = Math.floor((y - LOTE_Y0) / LOTE_A);
  if (x < LOTE_X0 || y < LOTE_Y0 || c >= LOTE_COLUNAS || l >= LOTE_LINHAS) return -1; // fora da zona dos terrenos
  return loteValido_(l * LOTE_COLUNAS + c + 1);
}
function loteValido_(n) {
  n = Math.floor(Number(n));
  return n >= 1 && n <= LOTE_COLUNAS * LOTE_LINHAS && LOTES_DA_NAVE.indexOf(n) < 0 ? n : 0;
}
// Quem é dono de cada lote: está nos itens de alguém ou guardado numa oferta aberta
function donoDoLote_(ss, n) {
  const id = 'lote_' + n;
  const s = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return String(l[C_ITENS - 1] || '').split(',').indexOf(id) >= 0; })[0];
  if (s) return String(s[C_NOME - 1]);
  const o = linhas_(ss.getSheetByName(ABA_OFERTAS)).filter(function (l) { return l[6] === 'aberta' && l[4] === id; })[0];
  return o ? String(o[3]) : '';
}

function reconhecer_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const n = loteValido_(d.lote);
  if (!n) return { ok: false, erro: 'Esse lugar não é um terreno.' };
  if (donoDoLote_(ss, n)) return { ok: false, erro: 'O Terreno ' + n + ' já tem dono.' };
  s.aba.getRange(s.linha, C_RECON).setValue(n + '|' + Date.now());
  return { ok: true, lote: n, minutos: TERRENO_MINUTOS };
}

function registrarTerreno_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const rec = String(s.dados[C_RECON - 1] || '').split('|'), n = loteValido_(rec[0]);
  if (!n) return { ok: false, erro: 'Primeiro fique dentro de um terreno livre para fazer o reconhecimento.' };
  if (Date.now() - Number(rec[1]) < TERRENO_MINUTOS * 60000 - 5000) return { ok: false, erro: 'O reconhecimento do Terreno ' + n + ' ainda não terminou.' };
  const dono = donoDoLote_(ss, n);
  if (dono) { s.aba.getRange(s.linha, C_RECON).setValue(''); return { ok: false, erro: dono + ' registrou o Terreno ' + n + ' antes de você.' }; }
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (lista.filter(function (i) { return /^lote_/.test(i); }).length >= TERRENOS_POR_PESSOA)
    return { ok: false, erro: 'Você já registrou o seu terreno. Para ter outro, compre no mercado dos sobreviventes.' };
  if (p.moedas < TERRENO_PRECO) return { ok: false, erro: 'O registro custa ' + TERRENO_PRECO + ' moedas e você tem ' + p.moedas + '.' };
  p.moedas -= TERRENO_PRECO;
  lista.push('lote_' + n);
  p.itens = lista.join(',');
  salvarPerfil_(s, p);
  s.aba.getRange(s.linha, C_RECON).setValue('');
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Terreno ' + n, TERRENO_PRECO]);
  p.lote = n;
  return p;
}

/* ---------- Mercado entre jogadores ---------- */
function vendivel_(id) {
  return /^lote_\d+$/.test(id) || RECURSOS.some(function (r) { return r.id === id; }) || ITENS.some(function (i) { return i.id === id && !i.base && !i.fixo && !i.gas; });
}

function vender_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const item = String(d.item || ''), preco = Math.floor(Number(d.preco));
  if (!vendivel_(item)) return { ok: false, erro: 'Esse item não pode ser vendido.' };
  if (!(preco >= 1 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço entre 1 e 100.000 moedas.' };
  const aba = ss.getSheetByName(ABA_OFERTAS);
  const minhas = linhas_(aba).filter(function (l) { return l[6] === 'aberta' && String(l[2]) === String(s.dados[0]); }).length;
  if (minhas >= 10) return { ok: false, erro: 'Você já tem 10 itens à venda. Cancele algum primeiro.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (!tirarItem_(lista, item)) return { ok: false, erro: 'Você não tem esse item.' };
  if (lista.indexOf(item) < 0 && tem_(p.veste, item)) { p.veste = vestirLista_(p.veste, item, false); s.aba.getRange(s.linha, C_VESTE).setValue(p.veste || '-'); }
  if (/^lote_/.test(item) && !lista.some(function (i) { return /^lote_/.test(i); }) && lista.some(function (i) { return ITENS.some(function (x) { return x.id === i && x.base; }); }))
    return { ok: false, erro: 'Sua base está nesse terreno. Você não pode vender o único terreno onde está a sua base.' };
  if (/^lote_/.test(item) && !lista.some(function (i) { return /^lote_/.test(i); }) && lista.indexOf('outdoor') >= 0)
    return { ok: false, erro: 'Seu outdoor está nesse terreno. Tire o outdoor antes de vender o terreno.' };
  p.itens = lista.join(',');
  salvarPerfil_(s, p);
  const id = 'O' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  aba.appendRow([id, new Date(), p.numero, texto_(String(p.nome)), item, preco, 'aberta', '', '']);
  return p;
}

function acharOferta_(ss, id) {
  const aba = ss.getSheetByName(ABA_OFERTAS), ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) if (String(ls[i][0]) === String(id)) return { aba: aba, linha: i + 2, dados: ls[i] };
  return null;
}

function cancelarOferta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const o = acharOferta_(ss, d.id);
  if (!o || o.dados[6] !== 'aberta') return { ok: false, erro: 'Essa oferta não está mais aberta.' };
  if (String(o.dados[2]) !== String(s.dados[0])) return { ok: false, erro: 'Essa oferta não é sua.' };
  o.aba.getRange(o.linha, 7).setValue('cancelada');
  const p = perfilDe_(s);
  p.itens = (p.itens ? p.itens.split(',') : []).concat([o.dados[4]]).join(',');
  salvarPerfil_(s, p);
  return p;
}

function comprarOferta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const o = acharOferta_(ss, d.id);
  if (!o || o.dados[6] !== 'aberta') return { ok: false, erro: 'Alguém já comprou essa oferta.' };
  if (String(o.dados[2]) === String(s.dados[0])) return { ok: false, erro: 'Essa oferta é sua.' };
  const preco = Number(o.dados[5]) || 0, p = perfilDe_(s);
  if (p.moedas < preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + preco + '.' };
  const vend = linhaPorNumero_(ss, o.dados[2]);
  p.moedas -= preco;
  p.itens = (p.itens ? p.itens.split(',') : []).concat([o.dados[4]]).join(',');
  salvarPerfil_(s, p);
  const taxa = /^lote_/.test(String(o.dados[4])) ? Math.floor(preco * TAXA_TERRENO) : 0;
  if (vend) vend.aba.getRange(vend.linha, C_MOEDAS).setValue((Number(vend.dados[C_MOEDAS - 1]) || 0) + preco - taxa);
  if (taxa) cobrarTaxa_(ss, taxa, 'Taxa de venda de terreno');
  o.aba.getRange(o.linha, 7).setValue('vendida');
  o.aba.getRange(o.linha, 8).setValue(p.numero);
  o.aba.getRange(o.linha, 9).setValue(texto_(String(p.nome)));
  return p;
}

/* ---------- Ajudantes ---------- */
function hoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function tem_(lista, id) { return (',' + (lista || '') + ',').indexOf(',' + id + ',') >= 0; }
function temCasa_(itens) { return tem_(itens, 'base') || tem_(itens, 'base_grande'); }
function temGas_(l) {
  const v = l[C_GAS - 1];
  const dia = v instanceof Date ? Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd') : String(v || '').replace(/^'/, '');
  return dia === hoje_();
}
function slotDe_(id) {
  const i = ITENS.filter(function (x) { return x.id === id; })[0];
  return i && i.slot ? i.slot : (SLOTS_ANTIGOS[id] || '');
}
// O que o sobrevivente está vestindo. Vazio = nunca escolheu (veste tudo o que tem); '-' = nada.
function vesteDe_(l) {
  const v = String(l[C_VESTE - 1] || '');
  if (v === '-') return '';
  if (v) return v;
  const usados = {};
  return String(l[C_ITENS - 1] || '').split(',').filter(function (id) {
    const sl = slotDe_(id); if (!sl) return false;
    const partes = sl.split(','); if (partes.some(function (x) { return usados[x]; })) return false;
    partes.forEach(function (x) { usados[x] = 1; }); return true;
  }).join(',');
}
function vestirLista_(veste, id, ligar) {
  const sl = slotDe_(id).split(',');
  let lista = String(veste || '').split(',').filter(String).filter(function (x) { return x !== id; });
  if (ligar) {
    lista = lista.filter(function (x) { return !slotDe_(x).split(',').some(function (p) { return sl.indexOf(p) >= 0; }); });
    lista.push(id);
  }
  return lista.join(',');
}

/* ---------- Ideias: gostei ---------- */
function curtir_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para dar gostei.' };
  const aba = ss.getSheetByName(ABA_IDEIAS), ls = linhas_(aba);
  for (let i = 0; i < ls.length; i++) {
    const id = String(ls[i][4] || ('L' + (i + 2)));
    if (id !== String(d.id)) continue;
    if (String(ls[i][5]) === String(s.dados[0])) return { ok: false, erro: 'Essa ideia é sua.' };
    let quem = String(ls[i][6] || '').split(',').filter(String);
    const eu = String(s.dados[0]);
    quem = quem.indexOf(eu) >= 0 ? quem.filter(function (q) { return q !== eu; }) : quem.concat([eu]);
    aba.getRange(i + 2, 7).setValue(quem.join(','));
    if (!ls[i][4]) aba.getRange(i + 2, 5).setValue(id);
    return { ok: true, id: id, gostei: quem.length, curti: quem.indexOf(eu) >= 0 };
  }
  return { ok: false, erro: 'Ideia não encontrada.' };
}

/* ---------- Roupas: vestir e tirar ---------- */
function vestir_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s), id = String(d.item || '');
  if (!slotDe_(id)) return { ok: false, erro: 'Isso não é uma roupa.' };
  if (!tem_(p.itens, id)) return { ok: false, erro: 'Você não tem essa roupa.' };
  p.veste = vestirLista_(p.veste, id, !!d.ligar);
  s.aba.getRange(s.linha, C_VESTE).setValue(p.veste || '-');
  return p;
}

/* ---------- Picareta: minerar fora da zona dos terrenos ---------- */
function minerar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s);
  if (!tem_(p.itens, 'picareta')) return { ok: false, erro: 'Você precisa de uma picareta. Tem no Mercado.' };
  if (!p.gas) return { ok: false, erro: 'Sem gás de oxigênio você está doente e não consegue minerar. Adquira gás no Mercado.' };
  if (loteEm_(Number(d.x), Number(d.y)) !== -1) return { ok: false, erro: 'Aqui é zona de terrenos. Vá para a borda pedregosa do mapa para minerar.' };
  const agora = Date.now(), ultimo = Number(s.dados[C_MINERAR - 1]) || 0;
  if (agora - ultimo < MINERAR_SEGUNDOS * 1000) return { ok: false, erro: 'Sua picareta precisa esfriar. Tente de novo em ' + Math.ceil((MINERAR_SEGUNDOS * 1000 - (agora - ultimo)) / 1000) + ' segundos.', espera: Math.ceil((MINERAR_SEGUNDOS * 1000 - (agora - ultimo)) / 1000) };
  s.aba.getRange(s.linha, C_MINERAR).setValue(agora);
  let achou = '';
  if (ESPECIAIS.length && Math.random() < ESPECIAL_CHANCE) achou = ESPECIAIS[Math.floor(Math.random() * ESPECIAIS.length)];
  else if (Math.random() < MINERAR_CHANCE) achou = Math.random() < 0.5 ? 'minerio' : RECURSOS[Math.floor(Math.random() * RECURSOS.length)].id;
  if (achou) {
    p.itens = (p.itens ? p.itens.split(',') : []).concat([achou]).join(',');
    salvarPerfil_(s, p);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Mineração: ' + achou, 0]);
  }
  p.achou = achou; p.espera = MINERAR_SEGUNDOS;
  return p;
}

/* ---------- Aluguel de casas e apartamentos ---------- */
function imoveis_(ss) {
  const aba = ss.getSheetByName(ABA_TERRENOS);
  return linhas_(aba).map(function (l, i) {
    const codigo = String(l[0]), m = /^B(\d+)(base_grande|base)$/.exec(codigo);
    if (!m || String(l[7]).trim().toLowerCase() !== 'pago') return null;
    const item = ITENS.filter(function (x) { return x.id === m[2]; })[0];
    return { aba: aba, linha: i + 2, codigo: codigo, nome: String(l[2]), dono: String(l[3]), donoNumero: String(l[10] || m[1]), item: m[2], vagas: item ? item.vagas : 1, preco: Number(l[9]) || 0 };
  }).filter(Boolean);
}
function contratosAtivos_(ss) {
  const agora = Date.now();
  return linhas_(ss.getSheetByName(ABA_ALUGUEIS)).map(function (l, i) {
    return { linha: i + 2, imovel: String(l[1]), dono: String(l[2]), inquilino: String(l[4]), inquilinoNome: String(l[5]), ate: Number(l[7]) || 0 };
  }).filter(function (c) { return c.ate > agora; });
}
function moradiaAlugada_(ss, numero) {
  const aba = ss.getSheetByName(ABA_ALUGUEIS); if (!aba) return null;
  return contratosAtivos_(ss).filter(function (c) { return c.inquilino === String(numero); })[0] || null;
}
function listarImoveis_(ss) {
  if (!ss.getSheetByName(ABA_ALUGUEIS)) return [];
  const ativos = contratosAtivos_(ss);
  return imoveis_(ss).filter(function (im) { return im.preco > 0; }).map(function (im) {
    const dele = ativos.filter(function (c) { return c.imovel === im.codigo; });
    return { codigo: im.codigo, nome: im.nome, dono: im.dono, item: im.item, preco: im.preco, vagas: im.vagas,
      ocupadas: dele.length, inquilinos: dele.map(function (c) { return { nome: c.inquilinoNome, ate: c.ate }; }) };
  });
}
function precoAluguel_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const preco = Math.floor(Number(d.preco));
  if (!(preco >= 0 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço entre 0 e 100.000 moedas por semana (0 = não alugar).' };
  const im = imoveis_(ss).filter(function (x) { return x.donoNumero === String(s.dados[0]) && x.item === d.item; })[0];
  if (!im) return { ok: false, erro: 'Você não tem esse imóvel.' };
  im.aba.getRange(im.linha, 10).setValue(preco);
  if (!im.aba.getRange(im.linha, 11).getValue()) im.aba.getRange(im.linha, 11).setValue(s.dados[0]);
  return { ok: true, item: d.item, preco: preco };
}
function alugar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const im = imoveis_(ss).filter(function (x) { return x.codigo === String(d.codigo); })[0];
  if (!im || im.preco <= 0) return { ok: false, erro: 'Esse imóvel não está para alugar.' };
  const eu = String(s.dados[0]);
  if (im.donoNumero === eu) return { ok: false, erro: 'Esse imóvel já é seu.' };
  const ativos = contratosAtivos_(ss), meu = ativos.filter(function (c) { return c.inquilino === eu; })[0];
  if (meu && meu.imovel !== im.codigo) return { ok: false, erro: 'Você já aluga outro lugar até ' + Utilities.formatDate(new Date(meu.ate), 'America/Sao_Paulo', 'dd/MM HH:mm') + '.' };
  if (!meu && ativos.filter(function (c) { return c.imovel === im.codigo; }).length >= im.vagas) return { ok: false, erro: 'Não tem vaga livre nesse imóvel agora.' };
  const p = perfilDe_(s);
  if (p.moedas < im.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + im.preco + '.' };
  p.moedas -= im.preco; salvarPerfil_(s, p);
  const taxa = Math.floor(im.preco * TAXA_ALUGUEL);
  creditar_(ss, im.donoNumero, im.preco - taxa);
  cobrarTaxa_(ss, taxa, 'Taxa de aluguel (' + im.nome + ')');
  const aba = ss.getSheetByName(ABA_ALUGUEIS), semana = ALUGUEL_DIAS * 86400000;
  let ate;
  if (meu) { ate = meu.ate + semana; aba.getRange(meu.linha, 8).setValue(ate); }
  else { ate = Date.now() + semana; aba.appendRow([new Date(), im.codigo, im.donoNumero, texto_(im.dono), eu, texto_(String(p.nome)), im.preco, ate]); }
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Aluguel: ' + im.nome + ' (de ' + im.dono + ')', im.preco]);
  p.mora = im.codigo; p.moraAte = ate;
  return p;
}

/* ---------- Perfil público e amigos ---------- */
function perfilPublico_(numero) {
  const ss = planilha_(), l = (linhaPorNumero_(ss, numero) || {}).dados;
  if (!l) return { ok: false, erro: 'Sobrevivente não encontrado.' };
  const nomes = {};
  linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).forEach(function (x) { nomes[String(x[0])] = String(x[2]); });
  const amigos = String(l[C_AMIGOS - 1] || '').split(',').filter(function (n) { return nomes[n]; });
  const casa = temCasa_(String(l[C_ITENS - 1] || '')), aluga = moradiaAlugada_(ss, l[0]);
  return { ok: true, numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], historia: l[5], visual: String(l[6] || ''),
    itens: String(l[C_ITENS - 1] || ''), veste: vesteDe_(l), desde: new Date(l[C_DATA - 1]).getTime(), moedas: Number(l[C_MOEDAS - 1]) || 0,
    objetivo: String(l[C_OBJETIVO - 1] || ''), amigos: amigos.map(function (n) { return { numero: n, nome: nomes[n] }; }),
    casa: casa, aluga: aluga ? true : false, gas: temGas_(l) };
}
function amigo_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const outro = linhaPorNumero_(ss, d.numero);
  if (!outro) return { ok: false, erro: 'Sobrevivente não encontrado.' };
  if (String(outro.dados[0]) === String(s.dados[0])) return { ok: false, erro: 'Esse é você!' };
  let lista = String(s.dados[C_AMIGOS - 1] || '').split(',').filter(String).filter(function (n) { return n !== String(d.numero); });
  if (d.ligar) lista.push(String(d.numero));
  s.aba.getRange(s.linha, C_AMIGOS).setValue(lista.join(','));
  const p = perfilDe_(s); p.amigos = lista.join(',');
  return p;
}
function mudarObjetivo_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const t = limpar_(d.texto, 120);
  s.aba.getRange(s.linha, C_OBJETIVO).setValue(texto_(t));
  const p = perfilDe_(s); p.objetivo = t;
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
  corpo += '\nTAXAS NO COFRE DA COLÔNIA: ' + (Number(props.getProperty('COFRE')) || 0) + ' moedas\n';
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
  return aba.getRange(2, 1, aba.getLastRow() - 1, Math.max(aba.getLastColumn(), 28)).getValues();
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
