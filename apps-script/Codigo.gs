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
const ABA_OBRAS = 'Obras';
const ABA_TORRES = 'Torres';
const ABA_SILENCIO = 'Silenciados';
const ABA_CRIACOES = 'Criacoes';
const ABA_LEILOES = 'Leiloes';
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];

// Colunas da aba Sobreviventes (1 = A)
const C_NUMERO = 1, C_NOME = 3, C_INSTA = 4, C_PROF = 5, C_VISUAL = 7, C_MOEDAS = 8, C_CHAVE = 9, C_ITENS = 10, C_BANIDO = 11;
const C_ON_DIA = 12, C_ON_MIN = 13, C_ON_ULTIMO = 14, C_TURNO = 15, C_PROGRESSO = 16, C_DESCANSO = 17, C_RECON = 18, C_OUTDOOR = 19;
const C_VESTE = 20, C_GAS = 21, C_OBJETIVO = 22, C_AMIGOS = 23, C_MINERAR = 24, C_DATA = 2, C_HIST = 6;
const C_OUT_PRECO = 25, C_OUT_ANUNCIO = 26, C_OUT_AUTOR = 27, C_OUT_ATE = 28;
const C_FUNCAO = 29, C_FUNCAO_DATA = 30, C_PONTOS = 31, C_PONTOS_SEM = 32, C_FOME = 33, C_DOENTE_ATE = 34, C_AR = 35, C_AR_TS = 36,
  C_PLANTAO = 37, C_MEDICO_PRECO = 38, C_EXTRA = 39, C_CLA = 40, C_MUDO_ATE = 41;

/* ---------- MISSÃO: consertar a nave (ganha moedas com o site aberto) ---------- */
const MINUTOS_POR_MOEDA = 1;    // 1 moeda a cada 1 minuto consertando
const TURNO_MINUTOS = 240;      // depois de 4 horas trabalhando, cansa
const DESCANSO_COM_BASE = 10;   // quem mora numa casa (dono ou aluguel) descansa 10 minutos em casa
const DESCANSO_SEM_BASE = 60;   // quem não tem casa espera 1 hora na nave
const LIMITE_MINUTOS_DIA = 1440; // sem limite por dia (o descanso já segura)
// Gás de oxigênio: sem gás o sobrevivente fica doente e não trabalha nem minera.
const GAS_PRECO = 50;           // moedas; enche o tanque
const AR_MAX = 1440;            // o tanque cheio dura 24 horas parado; trabalhando gasta o dobro
const GAS_GRATIS_NO_CADASTRO = true; // quem acorda ganha o primeiro tanque cheio
// Comida: precisa comer a cada 4 horas de trabalho; quem passa disso fica doente
const FOME_LIMITE = 240;
const DOENTE_MINUTOS = 60;      // doente fica 1 hora sem trabalhar (ou chama um médico)
const RACAO_PRECO = 30;         // ração da nave, para ninguém ficar sem comida
// META DA NAVE: todo mundo consertando junto
const META_NAVE = 1000000, ETAPA_NAVE = 50000;
// PROFISSÕES
const FUNCOES = {
  mecanico:     { nome: 'Mecânico(a)', desc: 'Conserta a nave mais rápido: 2 pontos por minuto e +1 moeda extra a cada 2 minutos.' },
  engenheiro:   { nome: 'Engenheiro(a)', desc: 'Conserta a nave e constrói as casas: quem compra casa paga a mão de obra para o engenheiro que aceitar a obra.' },
  agricultor:   { nome: 'Agricultor(a)', desc: 'Cultiva comida: 1 comida a cada 10 minutos cultivando. Venda no mercado dos sobreviventes.' },
  cozinheiro:   { nome: 'Cozinheiro(a)', desc: 'Transforma comida em refeição (sacia por 8 horas de trabalho): 1 a cada 5 minutos cozinhando.' },
  minerador:    { nome: 'Minerador(a)', desc: 'Conserta a nave e minera na borda do mapa com menos espera entre as mineradas.' },
  explorador:   { nome: 'Explorador(a)', desc: 'Conserta a nave e explora o mapa: é quem encontra as novidades do planeta.' },
  medico:       { nome: 'Médico(a)', desc: 'Cura na hora quem ficou doente e cobra o preço que escolher. Precisa estar de plantão (online). Não conserta a nave.' },
  guarda:       { nome: 'Guarda', desc: 'Vigia a colônia: 1 moeda a cada 2 minutos com o site aberto e +30 moedas ao completar o turno de 4 horas.' },
  desempregado: { nome: 'Desempregado(a)', desc: 'Não ganha moedas consertando, mas pode fazer bicos para os outros. Não fica doente.' },
  livre:        { nome: 'Profissão livre', desc: 'Conserta a nave como todo mundo e pode ganhar dinheiro vendendo serviços para os outros jogadores.' }
};
const MAPA_PROFISSAO = { 'Mecânica(o)': 'mecanico', 'Engenheira(o)': 'engenheiro', 'Agricultor(a)': 'agricultor', 'Cozinheira(o)': 'cozinheiro',
  'Minerador(a)': 'minerador', 'Explorador(a)': 'explorador', 'Médica(o)': 'medico', 'Guarda': 'guarda', 'Desempregado(a)': 'desempregado' };
const TROCA_FUNCAO_DIAS = 7;
const KIT_TEMPORARIO_HORAS = 24; // quem acorda ganha um kit de ferramentas temporário; depois precisa comprar o kit
const VAGAS = { medico: 20, guarda: 10 };   // 1 vaga para cada N sobreviventes
const MEDICO_MIN = 50;          // preço mínimo da consulta
const PLANTAO_SEGUNDOS = 180;   // conta como online quem mandou sinal nos últimos 3 minutos
// OBRAS: casa precisa de engenheiro
const MAO_DE_OBRA = { base: 100, base_grande: 500 };
const OBRA_MINUTOS = 10;        // tempo que o engenheiro fica construindo
const OBRA_PRAZO_HORAS = 24;    // sem engenheiro até lá, a nave constrói sozinha
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
// Cadastro: cada @ do Instagram só acorda 1 sobrevivente (false = @ opcional)
const INSTAGRAM_OBRIGATORIO = true;

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
const BAU_MOEDAS = 50;               // moedas que vêm no baú
const BAU_CHANCE_FICHA_ITEM = 0.25;  // chance de vir a ficha "Criar item"
const BAU_CHANCE_FICHA_EMPRESA = 0.05; // chance de vir a ficha "Criar empresa"
// BAÚ PEQUENO: aparece a cada 14 a 16 minutos num lugar do mapa, só com moedas
const BAUZINHO_MINUTOS = 15, BAUZINHO_VARIA_SEG = 60, BAUZINHO_MIN = 40, BAUZINHO_MAX = 90, BAUZINHO_MAX_MAPA = 2;
const CRIAR_ITEM_PRECO = 500;        // moedas para usar a ficha de criar item
const CRIAR_EMPRESA_PRECO = 5000;    // moedas para usar a ficha de criar empresa (precisa ter terreno)

/* ---------- TORRES DE CLÃ: construções antigas de outros seres ---------- */
// Ficam escondidas na borda do mapa. Quem chega perto descobre a torre.
// Para desbloquear, os sobreviventes trabalham perto dela (1 ponto/min; explorador 2) até TORRE_META.
// Quem mais somou pontos ganha a chance de ser dono pagando TORRE_PRECO. Tem TORRE_PRAZO_HORAS para responder.
// Se recusar: a torre pede mais TORRE_PONTOS_EXTRA pontos e o próximo da lista paga 10 a menos (mínimo TORRE_PRECO_MIN).
const TORRES = [
  { id: 'T1', nome: 'Torre do Norte', x: 440, y: 56 },
  { id: 'T2', nome: 'Torre das Cinzas', x: 84, y: 92 },
  { id: 'T3', nome: 'Torre do Cristal', x: 796, y: 88 },
  { id: 'T4', nome: 'Torre da Ferrugem', x: 92, y: 480 },
  { id: 'T5', nome: 'Torre do Eco', x: 790, y: 486 },
  { id: 'T6', nome: 'Torre do Sul', x: 440, y: 512 }
];
const TORRE_META = 10000, TORRE_PONTOS_EXTRA = 500, TORRE_RAIO = 40;
const TORRE_PRECO = 1000, TORRE_PRECO_MIN = 800, TORRE_DESCONTO = 10, TORRE_PRAZO_HORAS = 12;
const CLA_ENTRADA_PADRAO = 100;      // preço para entrar no clã (o dono muda)
const TAXA_CLA = 0.10;               // 10% da entrada no clã fica com a colônia
// GUARDAS: silenciam no rádio; quem foi silenciado pode reclamar.
// Você decide na aba Silenciados: escreva "certo" ou "abuso" na coluna decisao.
const SILENCIO_MINUTOS = 5, GUARDA_BONUS = 20;
// RÁDIO: proteção automática contra ofensas e flood
const CHAT_MAX_POR_MINUTO = 8;       // mais que isso em 1 minuto é bloqueado
const CHAT_OFENSAS_PARA_SILENCIAR = 3; // 3 mensagens ofensivas bloqueadas = silenciado automático
const CHAT_SILENCIO_AUTO_MIN = 10;
// Palavras bloqueadas no rádio (sem acento, minúsculas). Pode acrescentar ou tirar à vontade.
const PALAVRAS_PROIBIDAS = ['porra', 'caralho', 'krl', 'crl', 'merda', 'puta', 'puto', 'putaria', 'fdp', 'pqp', 'cu', 'cuzao', 'buceta', 'boceta',
  'xoxota', 'xereca', 'viado', 'bicha', 'sapatao', 'traveco', 'arrombado', 'arrombada', 'otario', 'otaria', 'idiota', 'imbecil', 'babaca',
  'cretino', 'cretina', 'retardado', 'retardada', 'mongol', 'vagabundo', 'vagabunda', 'vadia', 'corno', 'corna', 'desgracado', 'desgracada',
  'foda', 'fodase', 'foder', 'fuder', 'fudido', 'fudida', 'punheta', 'pica', 'vsf', 'vtnc', 'tnc', 'escroto', 'escrota', 'nojento', 'nojenta', 'lixo humano'];
// LEILÃO DO VÍDEO: quem der o maior lance tem o @ divulgado no vídeo.
// Quem é superado recebe as moedas de volta na hora. Fecha todo dia às LEILAO_HORA (horário de Brasília).
// O vencedor escreve a frase do que quer divulgar; aparece no e-mail diário e na aba Leiloes.
const LEILAO_HORA = 20, LEILAO_MINIMO = 100, LEILAO_AUMENTO = 10;
const MAPA_L = 880, MAPA_A = 560;    // tamanho do mapa (o site usa o mesmo)

/* ---------- TERRENOS: explorar, reconhecer e registrar ---------- */
// O mapa é dividido em lotes de 60 x 50 (8 colunas x 6 linhas). Os 4 lotes do meio são da nave.
// A pessoa fica parada dentro de um lote livre por TERRENO_MINUTOS (reconhecimento),
// volta para a nave e registra o terreno pagando TERRENO_PRECO moedas.
// Quando acabarem os terrenos livres, só dá para conseguir um no mercado dos sobreviventes.
const LOTE_L = 60, LOTE_A = 50, LOTE_COLUNAS = 8, LOTE_LINHAS = 6;
const LOTE_X0 = 200, LOTE_Y0 = 130;    // onde começa a zona dos terrenos; fora dela é zona de mineração
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
  { id: 'gas', cat: 'Oxigênio e comida', nome: 'Gás de oxigênio', preco: GAS_PRECO, gas: true,
    desc: 'Enche o seu tanque de ar: dura 24 horas parado ou 12 horas trabalhando. Sem ar o seu sobrevivente fica doente.' },
  { id: 'racao', cat: 'Oxigênio e comida', nome: 'Ração da nave', preco: RACAO_PRECO, consumivel: true, comida: FOME_LIMITE,
    desc: 'Sacia a fome por 4 horas de trabalho. A comida dos agricultores costuma sair mais barata no mercado dos sobreviventes.' },
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
    desc: 'Precisa dele para consertar a nave. Quem acorda ganha um kit temporário de 1 dia; comprando, é seu para sempre.' },
  // fichas que só aparecem no baú (não estão à venda no Mercado da nave, mas dá para vender entre jogadores)
  { id: 'ficha_item', cat: 'Fichas', nome: 'Ficha: criar item', preco: CRIAR_ITEM_PRECO, oculto: true,
    desc: 'Achada no baú. Pague ' + CRIAR_ITEM_PRECO + ' moedas e mande a ideia de um item novo: depois de aprovado, ele fica no seu inventário e pode ser vendido.' },
  { id: 'ficha_empresa', cat: 'Fichas', nome: 'Ficha: criar empresa', preco: CRIAR_EMPRESA_PRECO, oculto: true,
    desc: 'Achada no baú. Quem tem terreno paga ' + CRIAR_EMPRESA_PRECO + ' moedas e abre uma empresa com a ideia que quiser.' }
];
// Comidas que vêm dos jogadores (quanto tempo de trabalho cada uma sacia)
const COMIDAS = { comida: { nome: 'Comida', sacia: FOME_LIMITE }, refeicao: { nome: 'Refeição', sacia: FOME_LIMITE * 2 }, racao: { nome: 'Ração da nave', sacia: FOME_LIMITE } };
// Peças antigas que ainda aparecem para quem já tem
const SLOTS_ANTIGOS = { traje_dourado: 'tronco,pernas' };

/* ---------- 1. Rode esta função depois de colar o código ---------- */
function setup() {
  const ss = planilha_();
  colunas_(garantirAba_(ss, ABA_SOBREVIVENTES), ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual', 'moedas', 'chave', 'itens', 'banido', 'online_dia', 'online_minutos', 'online_ultimo', 'turno_minutos', 'progresso_moeda', 'descanso_ate', 'reconhecimento', 'outdoor', 'vestindo', 'gas_dia', 'objetivo', 'amigos', 'minerou', 'outdoor_preco', 'anuncio', 'anuncio_autor', 'anuncio_ate', 'funcao', 'funcao_desde', 'pontos', 'pontos_semana', 'fome_min', 'doente_ate', 'ar_min', 'ar_quando', 'plantao', 'preco_consulta', 'extra', 'cla', 'silenciado_ate']);
  colunas_(garantirAba_(ss, ABA_IDEIAS), ['data', 'autor', 'tipo', 'texto', 'id', 'numero', 'gostei']);
  colunas_(garantirAba_(ss, ABA_TERRENOS), ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status', 'ref', 'aluguel_semana', 'dono_numero', 'item']);
  colunas_(garantirAba_(ss, ABA_PEDIDOS), ['codigo', 'data', 'numero', 'nome', 'pacote', 'reais', 'moedas', 'status', 'ref']);
  colunas_(garantirAba_(ss, ABA_COMPRAS), ['data', 'numero', 'nome', 'item', 'preco_moedas']);
  colunas_(garantirAba_(ss, ABA_CHAT), ['data', 'numero', 'nome', 'texto', 'status']);
  colunas_(garantirAba_(ss, ABA_OBRAS), ['id', 'data', 'dono_numero', 'dono', 'item', 'nome_da_casa', 'mao_de_obra', 'status', 'engenheiro_numero', 'engenheiro', 'progresso', 'ultimo_sinal']);
  colunas_(garantirAba_(ss, ABA_ALUGUEIS), ['data', 'imovel', 'dono_numero', 'dono', 'inquilino_numero', 'inquilino', 'preco', 'ate']);
  colunas_(garantirAba_(ss, ABA_TORRES), ['id', 'nome', 'status', 'pontos', 'meta', 'preco', 'contribuicoes', 'recusaram', 'oferta_numero', 'oferta_ate', 'dono_numero', 'dono', 'nome_do_cla', 'preco_entrada', 'descoberta_por', 'descoberta_em']);
  garantirTorres_(ss);
  colunas_(garantirAba_(ss, ABA_SILENCIO), ['id', 'data', 'guarda_numero', 'guarda', 'silenciado_numero', 'silenciado', 'mensagens', 'reclamacao', 'decisao', 'processado']);
  colunas_(garantirAba_(ss, ABA_CRIACOES), ['id', 'data', 'numero', 'nome', 'tipo', 'ideia', 'moedas_pagas', 'status', 'nome_final', 'processado']);
  colunas_(garantirAba_(ss, ABA_LEILOES), ['id', 'fechou', 'numero', 'nome', 'instagram', 'lance', 'frase', 'status']);
  colunas_(garantirAba_(ss, ABA_OFERTAS), ['id', 'data', 'vendedor_numero', 'vendedor', 'item', 'preco', 'status', 'comprador_numero', 'comprador', 'quantidade']);

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
    return { numero: l[0], nome: l[2], instagram: l[3], profissao: l[4], visual: String(l[6] || ''), itens: String(l[9] || ''), outdoor: String(l[C_OUTDOOR - 1] || ''), veste: vesteDe_(l), funcao: funcaoDe_(l), cla: String(l[C_CLA - 1] || '') };
  });
  const ideias = linhas_(ss.getSheetByName(ABA_IDEIAS)).map(function (l, i) {
    const quem = String(l[6] || '').split(',').filter(String).map(Number);
    return { id: String(l[4] || ('L' + (i + 2))), data: l[0], autor: l[1], tipo: l[2], texto: l[3], gostei: quem.length, quem: quem };
  }).slice(-60).reverse();
  const terrenos = linhas_(ss.getSheetByName(ABA_TERRENOS)).filter(function (l) {
    return String(l[7]).trim().toLowerCase() === 'pago';
  }).map(function (l) { return { nome: l[2], dono: l[3], plano: l[5] }; });
  try { if (ss.getSheetByName(ABA_OBRAS)) obrasVencidas_(ss); } catch (err) { /* segue */ }
  try { if (ss.getSheetByName(ABA_TORRES)) torresVencidas_(ss); } catch (err) { /* segue */ }
  try { if (ss.getSheetByName(ABA_SILENCIO)) processarSilencios_(ss); } catch (err) { /* segue */ }
  try { if (ss.getSheetByName(ABA_CRIACOES)) processarCriacoes_(ss); } catch (err) { /* segue */ }
  try { if (ss.getSheetByName(ABA_LEILOES)) fecharLeilao_(ss); } catch (err) { /* segue */ }
  const alugueis = listarImoveis_(ss);
  const todas = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES));
  const pontosNave = Number(PropertiesService.getScriptProperties().getProperty('PONTOS_NAVE')) || 0;
  const agoraGet = Date.now();
  const medicos = todas.filter(function (l) { return funcaoDe_(l) === 'medico' && agoraGet - (Number(l[C_PLANTAO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000; })
    .map(function (l) { return { numero: l[0], nome: String(l[2]), preco: Math.max(MEDICO_MIN, Number(l[C_MEDICO_PRECO - 1]) || MEDICO_MIN) }; });
  const engenheiros = todas.filter(function (l) { return funcaoDe_(l) === 'engenheiro' && agoraGet - (Number(l[C_PLANTAO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000; }).length;
  const contagem = {}; todas.forEach(function (l) { const f = funcaoDe_(l); contagem[f] = (contagem[f] || 0) + 1; });
  const funcoes = Object.keys(FUNCOES).map(function (k) { return { id: k, nome: FUNCOES[k].nome, desc: FUNCOES[k].desc, pessoas: contagem[k] || 0, vagas: VAGAS[k] ? Math.max(1, Math.floor(todas.length / VAGAS[k])) : 0 }; });
  const outdoors = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return tem_(String(l[C_ITENS - 1] || ''), 'outdoor'); }).map(outdoorDe_);
  const mercado = {
    pacotes: Object.keys(PACOTES).map(function (k) { return { id: k, nome: PACOTES[k].nome, reais: PACOTES[k].reais, moedas: PACOTES[k].moedas }; }),
    missao: { porMoeda: MINUTOS_POR_MOEDA, turno: TURNO_MINUTOS, descansoBase: DESCANSO_COM_BASE, descansoSemBase: DESCANSO_SEM_BASE, limite: LIMITE_MINUTOS_DIA },
    minerar: { segundos: MINERAR_SEGUNDOS }, vida: { arMax: AR_MAX, fomeLimite: FOME_LIMITE, doente: DOENTE_MINUTOS, medicoMin: MEDICO_MIN, trocaDias: TROCA_FUNCAO_DIAS, obraMinutos: OBRA_MINUTOS, obraPrazo: OBRA_PRAZO_HORAS, maoDeObra: MAO_DE_OBRA }, aluguelDias: ALUGUEL_DIAS, ideiaPrecisaBase: IDEIA_PRECISA_BASE, anuncioHoras: ANUNCIO_HORAS,
    taxas: { anuncio: TAXA_ANUNCIO, aluguel: TAXA_ALUGUEL, terreno: TAXA_TERRENO, cla: TAXA_CLA },
    torre: { meta: TORRE_META, raio: TORRE_RAIO, preco: TORRE_PRECO, precoMin: TORRE_PRECO_MIN, prazo: TORRE_PRAZO_HORAS, extra: TORRE_PONTOS_EXTRA },
    criar: { item: CRIAR_ITEM_PRECO, empresa: CRIAR_EMPRESA_PRECO }, silencioMin: SILENCIO_MINUTOS,
    itens: ITENS.map(function (i) { return { id: i.id, cat: i.cat, oculto: !!i.oculto, nome: i.nome, preco: i.preco, desc: i.desc, base: !!i.base, terreno: !!(i.base || i.terreno), fixo: !!(i.base || i.fixo || i.gas || i.consumivel), gas: !!i.gas, consumivel: !!i.consumivel, maoDeObra: MAO_DE_OBRA[i.id] || 0, slot: i.slot || '', vagas: i.vagas || 0 }; }),
    recursos: RECURSOS,
    terrenos: { x0: LOTE_X0, y0: LOTE_Y0, l: LOTE_L, a: LOTE_A, colunas: LOTE_COLUNAS, linhas: LOTE_LINHAS, nave: LOTES_DA_NAVE, preco: TERRENO_PRECO, minutos: TERRENO_MINUTOS, porPessoa: TERRENOS_POR_PESSOA }
  };
  const ofertas = linhas_(ss.getSheetByName(ABA_OFERTAS)).filter(function (l) { return l[6] === 'aberta'; }).slice(-100).reverse().map(function (l) {
    return { id: l[0], vendedor: l[3], item: l[4], preco: l[5], qtd: qtdOferta_(l) };
  });
  const b = bauDeHoje_(), aberto = PropertiesService.getScriptProperties().getProperty('BAU_' + b.dia);
  const bau = { dia: b.dia, hora: b.hora, aparece: b.aparece, x: Date.now() >= b.aparece ? b.x : null, y: Date.now() >= b.aparece ? b.y : null, abertoPor: aberto ? JSON.parse(aberto).nome : '' };
  const resposta = { ok: true, bauzinhos: bauzinhos_().lista, total: sobreviventes.length, sobreviventes: sobreviventes.slice(-600), ideias: ideias, terrenos: terrenos, mercado: mercado, chat: true, alugueis: alugueis, outdoors: outdoors,
    nave: { pontos: pontosNave, meta: META_NAVE, etapa: ETAPA_NAVE }, ranking: rankings_(todas), medicos: medicos, engenheirosOnline: engenheiros,
    obras: ss.getSheetByName(ABA_OBRAS) ? obrasAbertas_(ss) : [], funcoes: funcoes,
    torres: ss.getSheetByName(ABA_TORRES) ? torresPublicas_(ss, todas) : [], leilao: ss.getSheetByName(ABA_LEILOES) ? leilaoPublico_(ss) : null, criados: ss.getSheetByName(ABA_CRIACOES) ? criadosPublicos_(ss) : {},
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
      curtir: curtir_, trabalhar: trabalhar_, comer: comer_, funcao: trocarFuncao_, plantao: plantao_, chamar_medico: chamarMedico_, aceitar_obra: aceitarObra_, vestir: vestir_, minerar: minerar_, aluguel_preco: precoAluguel_, alugar: alugar_, amigo: amigo_, objetivo: mudarObjetivo_,
      descobrir_torre: descobrirTorre_, torre_responder: responderTorre_, cla_preco: precoCla_, entrar_cla: entrarCla_, sair_cla: sairCla_,
      silenciar: silenciar_, censurar_outdoor: censurarOutdoor_, reclamar: reclamar_, criar: criar_, lance: lance_, leilao_frase: fraseLeilao_, bauzinho: abrirBauzinho_ };
    const f = acoes[dados.acao];
    const r = f ? f(ss, dados) : { ok: false, erro: 'Ação desconhecida.' };
    if (r.ok && ['perfil', 'entrar', 'chat', 'consertar', 'trabalhar', 'plantao', 'reconhecer', 'amigo', 'objetivo'].indexOf(dados.acao) < 0) CacheService.getScriptCache().remove('lista');
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
  if (INSTAGRAM_OBRIGATORIO && !instagram) return { ok: false, erro: 'Coloque o seu @ do Instagram: cada @ acorda um sobrevivente.' };
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
  while (linha.length < C_EXTRA) linha.push('');
  if (GAS_GRATIS_NO_CADASTRO) { linha[C_AR - 1] = AR_MAX; linha[C_AR_TS - 1] = Date.now(); }
  linha[C_FUNCAO - 1] = MAPA_PROFISSAO[d.profissao] || (d.funcao && FUNCOES[d.funcao] ? d.funcao : 'livre');
  const fv = linha[C_FUNCAO - 1];
  if (VAGAS[fv] && existentes.filter(function (l) { return funcaoDe_(l) === fv; }).length >= Math.max(1, Math.floor((existentes.length + 1) / VAGAS[fv])))
    return { ok: false, erro: 'Não há vagas de ' + FUNCOES[fv].nome + ' agora. Escolha outra profissão (dá para trocar depois).' };
  linha[C_FUNCAO_DATA - 1] = Date.now();
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
    moedas: Number(l[C_MOEDAS - 1]) || 0, itens: String(l[C_ITENS - 1] || ''), chave: String(l[C_CHAVE - 1]), outdoor: String(l[C_OUTDOOR - 1] || ''), veste: vesteDe_(l), gas: temGas_(l), ar: arDe_(l), fome: Number(l[C_FOME - 1]) || 0, doenteAte: Number(l[C_DOENTE_ATE - 1]) || 0,
    kitAte: kitAte_(l), funcao: funcaoDe_(l), funcaoDesde: Number(l[C_FUNCAO_DATA - 1]) || 0, pontos: Number(l[C_PONTOS - 1]) || 0, precoConsulta: Number(l[C_MEDICO_PRECO - 1]) || MEDICO_MIN,
    objetivo: String(l[C_OBJETIVO - 1] || ''), cla: String(l[C_CLA - 1] || ''), mudoAte: Number(l[C_MUDO_ATE - 1]) || 0,
    amigos: String(l[C_AMIGOS - 1] || '') };
}

function perfil_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Nome ou código de acesso errado.' };
  const p = perfilDe_(s), a = moradiaAlugada_(ss, p.numero);
  p.mora = a ? a.imovel : ''; p.moraAte = a ? a.ate : 0;
  const ob = ss.getSheetByName(ABA_OBRAS) ? obrasDe_(ss, p.numero)[0] : null;
  p.obra = ob ? { id: ob.id, item: ob.item, nome: ob.nome, status: ob.status, engenheiro: ob.engNome, progresso: ob.progresso, prazo: ob.data + OBRA_PRAZO_HORAS * 3600000 } : null;
  p.criacoes = ss.getSheetByName(ABA_CRIACOES) ? linhas_(ss.getSheetByName(ABA_CRIACOES)).filter(function (c) { return String(c[2]) === String(p.numero); })
    .slice(-10).map(function (c) { return { id: String(c[0]), tipo: String(c[4]), ideia: String(c[5]), status: String(c[7] || 'pendente'), nome: String(c[8] || '') }; }) : [];
  const sil = ultimoSilencio_(ss, p.numero);
  p.silencio = sil && p.mudoAte > Date.now() - 86400000 ? { id: sil.id, guarda: sil.guarda, reclamou: !!sil.reclamacao, decisao: sil.decisao } : null;
  return p;
}

function ideia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para mandar ideias.' };
  if (IDEIA_PRECISA_BASE && !temCasa_(String(s.dados[C_ITENS - 1] || '')) && !moradiaAlugada_(ss, s.dados[0])) return { ok: false, erro: 'Só quem tem casa (própria ou alugada) pode mandar ideias. Registre um terreno e construa sua casa no Mercado. Você ainda pode dar "gostei" nas ideias dos outros.' };
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
  if (item.oculto) return { ok: false, erro: 'Essa ficha só aparece no baú do dia (ou no mercado dos sobreviventes).' };

  const p = perfilDe_(s);
  const meus = p.itens ? p.itens.split(',') : [];
  if (item.gas) {
    if (p.funcao === 'desempregado') return { ok: false, erro: 'Desempregado não precisa de gás.' };
    if (p.ar > AR_MAX * 0.75) return { ok: false, erro: 'Seu tanque ainda está com mais de 3/4 de ar.' };
    if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };
    p.moedas -= item.preco; p.gas = true; p.ar = AR_MAX;
    s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas);
    s.aba.getRange(s.linha, C_AR).setValue(AR_MAX); s.aba.getRange(s.linha, C_AR_TS).setValue(Date.now());
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome, item.preco]);
    return p;
  }
  if (item.consumivel) {
    if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };
    p.moedas -= item.preco; p.itens = meus.concat([item.id]).join(',');
    salvarPerfil_(s, p);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome, item.preco]);
    return p;
  }
  if (meus.indexOf(item.id) >= 0) return { ok: false, erro: 'Você já tem esse item.' };
  const mao = item.base ? (MAO_DE_OBRA[item.id] || 0) : 0;
  if (item.base && obrasDe_(ss, p.numero).length) return { ok: false, erro: 'Você já tem uma obra em andamento. Espere ela terminar.' };
  if (p.moedas < item.preco + mao) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + (item.preco + mao) + (mao ? ' (casa + mão de obra do engenheiro)' : '') + '.' };

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

  if (item.base) { // a casa vira uma obra: espera um engenheiro
    p.moedas -= item.preco + mao;
    s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas);
    const id = 'OB' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
    ss.getSheetByName(ABA_OBRAS).appendRow([id, new Date(), p.numero, texto_(String(p.nome)), item.id, texto_(lugar), mao, 'aguardando', '', '', 0, 0]);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome + ' (obra)', item.preco + mao]);
    p.obra = { id: id, item: item.id, status: 'aguardando' };
    p.engenheirosOnline = online_(ss, 'engenheiro').length;
    return p;
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
function temKit_(l) {
  if (tem_(String(l[C_ITENS - 1] || ''), 'ferramentas')) return true;
  const desde = new Date(l[C_DATA - 1]).getTime();
  return !isNaN(desde) && Date.now() - desde < KIT_TEMPORARIO_HORAS * 3600000;
}
function kitAte_(l) { return tem_(String(l[C_ITENS - 1] || ''), 'ferramentas') ? -1 : new Date(l[C_DATA - 1]).getTime() + KIT_TEMPORARIO_HORAS * 3600000; }
function estaDoente_(l) { return funcaoDe_(l) !== 'desempregado' && Number(l[C_DOENTE_ATE - 1]) > Date.now(); }
// Um minuto de trabalho. modo: consertar, vigiar, cultivar, cozinhar, construir.
function trabalhar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const l = s.dados, agora = Date.now(), cel = function (c, v) { s.aba.getRange(s.linha, c).setValue(v); };
  const modo = ['consertar', 'vigiar', 'cultivar', 'cozinhar', 'construir', 'torre'].indexOf(d.modo) >= 0 ? d.modo : 'consertar';
  const funcao = funcaoDe_(l), desemp = funcao === 'desempregado';
  const permitido = { consertar: funcao !== 'medico', vigiar: funcao === 'guarda', cultivar: funcao === 'agricultor', cozinhar: funcao === 'cozinheiro', construir: funcao === 'engenheiro', torre: true };
  if (modo === 'consertar' && !temKit_(l)) return { ok: false, semKit: true, erro: 'Seu kit de ferramentas temporário acabou. Para continuar consertando a nave, adquira o Kit de ferramentas no Mercado (é para sempre).' };
  if (!permitido[modo]) return { ok: false, erro: funcao === 'medico' && modo === 'consertar' ? 'Médico não conserta a nave: fique de plantão para curar os doentes.' : 'Sua profissão não faz isso.' };
  const temBase = temCasa_(String(l[C_ITENS - 1] || '')) || !!moradiaAlugada_(ss, l[0]);
  let ar = arDe_(l), fome = Number(l[C_FOME - 1]) || 0;
  let turno = Number(l[C_TURNO - 1]) || 0, progresso = Number(l[C_PROGRESSO - 1]) || 0;
  let moedas = Number(l[C_MOEDAS - 1]) || 0, ganhou = 0, pontos = 0, produziu = '';
  let torre = null;
  const descansoAte = Number(l[C_DESCANSO - 1]) || 0, doenteAte = Number(l[C_DOENTE_ATE - 1]) || 0;
  const r = function (est, restante, extra) {
    const o = { ok: true, estado: est, modo: modo, moedas: moedas, ganhou: ganhou, pontos: pontos, produziu: produziu, progresso: progresso, turno: turno,
      descansoSeg: restante || 0, temBase: temBase, torre: torre ? { id: torre.id, pontos: torre.pontos, meta: torre.meta, status: torre.status } : null, gas: desemp || ar > 0, ar: ar, fome: fome, funcao: funcao, itens: String(s.aba.getRange(s.linha, C_ITENS).getValue() || '') };
    for (const k in extra || {}) o[k] = extra[k];
    return o;
  };
  if (!desemp && doenteAte > agora) return r('doente', Math.ceil((doenteAte - agora) / 1000));
  if (agora < descansoAte) return r('descansando', Math.ceil((descansoAte - agora) / 1000));
  if (!desemp && ar <= 0) { cel(C_DOENTE_ATE, agora + DOENTE_MINUTOS * 60000); return r('doente', DOENTE_MINUTOS * 60, { causa: 'ar' }); }
  if (!desemp && fome >= FOME_LIMITE) { cel(C_DOENTE_ATE, agora + DOENTE_MINUTOS * 60000); return r('doente', DOENTE_MINUTOS * 60, { causa: 'fome' }); }
  if (agora - (Number(l[C_ON_ULTIMO - 1]) || 0) < 55000) return r('trabalhando'); // 1 minuto por vez, mesmo com várias abas

  // obra: precisa ter uma obra aceita
  let obra = null;
  if (modo === 'construir') {
    obra = obrasDoEngenheiro_(ss, l[0])[0];
    if (!obra) return { ok: false, erro: 'Você não tem obra aceita. Aceite uma obra na lista de obras.' };
  }
  if (modo === 'torre') {
    torre = torrePorId_(ss, d.torre);
    if (!torre) return { ok: false, erro: 'Torre não encontrada.' };
    if (!torre.descoberta) return { ok: false, erro: 'Essa torre ainda não foi descoberta.' };
    if (Math.hypot(Number(d.x) - torre.x, Number(d.y) - torre.y) > TORRE_RAIO + 10) return { ok: false, erro: 'Fique perto da torre para desbloquear.' };
    if (torre.status !== 'bloqueada') return { ok: false, erro: torre.status === 'oferta' ? 'A torre já foi desbloqueada: esperando ' + torre.ofertaNome + ' decidir se vira dono do clã.' : 'Essa torre já tem dono: ' + torre.dono + '.' };
  }
  if (modo === 'cozinhar') {
    const lista = String(l[C_ITENS - 1] || '').split(',').filter(String);
    if (lista.indexOf('comida') < 0) return { ok: false, erro: 'Você não tem comida para cozinhar. Compre dos agricultores no mercado dos sobreviventes.' };
  }

  turno++; progresso++;
  if (!desemp) { fome++; ar = Math.max(0, ar - 1); cel(C_FOME, fome); cel(C_AR, ar); cel(C_AR_TS, agora); }
  if (modo === 'consertar') {
    pontos = funcao === 'mecanico' ? 2 : 1;
    if (!desemp) { ganhou = 1; if (funcao === 'mecanico' && progresso % 2 === 0) ganhou = 2; }
    somarPontos_(s, l, pontos);
  } else if (modo === 'vigiar') {
    if (progresso % 2 === 0) ganhou = 1;
  } else if (modo === 'cultivar') {
    if (progresso % 10 === 0) produziu = 'comida';
  } else if (modo === 'cozinhar') {
    if (progresso % 5 === 0) produziu = 'refeicao';
  } else if (modo === 'construir') {
    avancarObra_(ss, obra, l);
  } else if (modo === 'torre') {
    pontos = funcao === 'explorador' ? 2 : 1;
    somarTorre_(ss, torre, l[0], pontos);
  }
  if (produziu) {
    let lista = String(l[C_ITENS - 1] || '').split(',').filter(String);
    if (produziu === 'refeicao') tirarItem_(lista, 'comida');
    lista.push(produziu); cel(C_ITENS, lista.join(','));
  }
  let est = 'trabalhando', restante = 0;
  if (turno >= TURNO_MINUTOS) {
    if (modo === 'vigiar') ganhou += 30; // turno completo de guarda
    turno = 0; est = 'cansado';
    restante = (temBase ? DESCANSO_COM_BASE : DESCANSO_SEM_BASE) * 60;
    cel(C_DESCANSO, agora + restante * 1000);
  }
  if (ganhou) { moedas += ganhou; cel(C_MOEDAS, moedas); }
  cel(C_ON_ULTIMO, agora); cel(C_TURNO, turno); cel(C_PROGRESSO, progresso);
  return r(est, restante);
}
function somarPontos_(s, l, n) {
  s.aba.getRange(s.linha, C_PONTOS).setValue((Number(l[C_PONTOS - 1]) || 0) + n);
  const sem = String(l[C_PONTOS_SEM - 1] || '').split('|'), chave = semana_();
  s.aba.getRange(s.linha, C_PONTOS_SEM).setValue(chave + '|' + ((sem[0] === chave ? Number(sem[1]) || 0 : 0) + n));
  const pr = PropertiesService.getScriptProperties();
  pr.setProperty('PONTOS_NAVE', String((Number(pr.getProperty('PONTOS_NAVE')) || 0) + n));
}
// Compatível com o site antigo
function consertar_(ss, d) { d.modo = 'consertar'; const r = trabalhar_(ss, d); if (r.estado === 'trabalhando') r.estado = 'consertando'; return r; }

/* ---------- Comer ---------- */
function comer_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const c = COMIDAS[d.item];
  if (!c) return { ok: false, erro: 'Isso não é comida.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (!tirarItem_(lista, d.item)) return { ok: false, erro: 'Você não tem ' + c.nome.toLowerCase() + '.' };
  p.itens = lista.join(','); salvarPerfil_(s, p);
  p.fome = Math.min(Number(s.dados[C_FOME - 1]) || 0, FOME_LIMITE - c.sacia); // comida: 4h de trabalho; refeição: 8h
  s.aba.getRange(s.linha, C_FOME).setValue(p.fome);
  return p;
}

/* ---------- Profissões ---------- */
function online_(ss, funcao) {
  const agora = Date.now();
  return linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) {
    return funcaoDe_(l) === funcao && agora - (Number(l[C_PLANTAO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000;
  });
}
function trocarFuncao_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const f = String(d.funcao || '');
  if (!FUNCOES[f]) return { ok: false, erro: 'Profissão inválida.' };
  const atual = funcaoDe_(s.dados), desde = Number(s.dados[C_FUNCAO_DATA - 1]) || 0;
  if (f === atual) return { ok: false, erro: 'Essa já é a sua profissão.' };
  if (Date.now() - desde < TROCA_FUNCAO_DIAS * 86400000) return { ok: false, erro: 'Você só pode trocar de profissão 1 vez por semana. Próxima troca: ' + Utilities.formatDate(new Date(desde + TROCA_FUNCAO_DIAS * 86400000), 'America/Sao_Paulo', 'dd/MM HH:mm') + '.' };
  if (VAGAS[f]) {
    const todos = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)), vagas = Math.max(1, Math.floor(todos.length / VAGAS[f]));
    if (todos.filter(function (l) { return funcaoDe_(l) === f; }).length >= vagas) return { ok: false, erro: 'Não há vagas de ' + FUNCOES[f].nome + ' agora (' + vagas + ' vaga(s) para ' + todos.length + ' sobreviventes).' };
  }
  s.aba.getRange(s.linha, C_FUNCAO).setValue(f);
  s.aba.getRange(s.linha, C_FUNCAO_DATA).setValue(Date.now());
  s.aba.getRange(s.linha, C_PROF).setValue(FUNCOES[f].nome);
  s.aba.getRange(s.linha, C_TURNO).setValue(0); s.aba.getRange(s.linha, C_PROGRESSO).setValue(0);
  const p = perfilDe_(linhaPorNumero_(ss, s.dados[0])); p.funcao = f; p.profissao = FUNCOES[f].nome; p.funcaoDesde = Date.now();
  return p;
}
// Médicos e engenheiros avisam que estão online
function plantao_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const f = funcaoDe_(s.dados);
  if (f !== 'medico' && f !== 'engenheiro') return { ok: false, erro: 'Só médicos e engenheiros ficam de plantão.' };
  s.aba.getRange(s.linha, C_PLANTAO).setValue(Date.now());
  if (f === 'medico' && d.preco != null) {
    const preco = Math.floor(Number(d.preco));
    if (!(preco >= MEDICO_MIN && preco <= 100000)) return { ok: false, erro: 'O preço da consulta precisa ser de pelo menos ' + MEDICO_MIN + ' moedas.' };
    s.aba.getRange(s.linha, C_MEDICO_PRECO).setValue(preco);
  }
  const r = { ok: true, funcao: f };
  if (f === 'engenheiro') { r.obras = obrasAbertas_(ss); r.minha = obrasDoEngenheiro_(ss, s.dados[0])[0] || null; }
  return r;
}
function chamarMedico_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (!estaDoente_(s.dados)) return { ok: false, erro: 'Você não está doente.' };
  const med = online_(ss, 'medico').filter(function (l) { return String(l[0]) === String(d.numero); })[0];
  if (!med) return { ok: false, erro: 'Esse médico não está mais de plantão.' };
  if (String(med[0]) === String(s.dados[0])) return { ok: false, erro: 'Você não pode se curar.' };
  const preco = Math.max(MEDICO_MIN, Number(med[C_MEDICO_PRECO - 1]) || MEDICO_MIN), p = perfilDe_(s);
  if (p.moedas < preco) return { ok: false, erro: 'A consulta custa ' + preco + ' moedas e você tem ' + p.moedas + '.' };
  p.moedas -= preco; salvarPerfil_(s, p);
  s.aba.getRange(s.linha, C_DOENTE_ATE).setValue(0);
  creditar_(ss, med[0], preco);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Consulta com ' + med[2], preco]);
  p.doenteAte = 0; p.curadoPor = String(med[2]);
  return p;
}

/* ---------- Obras (engenheiro constrói as casas) ---------- */
function linhasObras_(ss) {
  const aba = ss.getSheetByName(ABA_OBRAS); if (!aba) return [];
  return linhas_(aba).map(function (l, i) { return { aba: aba, linha: i + 2, id: String(l[0]), data: new Date(l[1]).getTime(), dono: String(l[2]), donoNome: String(l[3]), item: String(l[4]), nome: String(l[5]), mao: Number(l[6]) || 0, status: String(l[7]), eng: String(l[8]), engNome: String(l[9]), progresso: Number(l[10]) || 0, sinal: Number(l[11]) || 0 }; });
}
function obrasDe_(ss, numero) { return linhasObras_(ss).filter(function (o) { return o.dono === String(numero) && (o.status === 'aguardando' || o.status === 'em obra'); }); }
function obrasDoEngenheiro_(ss, numero) { return linhasObras_(ss).filter(function (o) { return o.eng === String(numero) && o.status === 'em obra'; }); }
function obrasAbertas_(ss) {
  return linhasObras_(ss).filter(function (o) { return o.status === 'aguardando' || (o.status === 'em obra' && Date.now() - o.sinal > OBRA_MINUTOS * 60000); })
    .map(function (o) { return { id: o.id, dono: o.donoNome, item: o.item, nome: o.nome, mao: o.mao, prazo: o.data + OBRA_PRAZO_HORAS * 3600000 }; });
}
function aceitarObra_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (funcaoDe_(s.dados) !== 'engenheiro') return { ok: false, erro: 'Só engenheiros constroem casas.' };
  if (obrasDoEngenheiro_(ss, s.dados[0]).length) return { ok: false, erro: 'Termine a sua obra atual primeiro.' };
  const o = linhasObras_(ss).filter(function (x) { return x.id === String(d.id); })[0];
  const livre = o && (o.status === 'aguardando' || (o.status === 'em obra' && Date.now() - o.sinal > OBRA_MINUTOS * 60000));
  if (!livre) return { ok: false, erro: 'Outro engenheiro já pegou essa obra.' };
  if (o.dono === String(s.dados[0])) return { ok: false, erro: 'Você não pode construir a sua própria casa.' };
  o.aba.getRange(o.linha, 8).setValue('em obra'); o.aba.getRange(o.linha, 9).setValue(s.dados[0]);
  o.aba.getRange(o.linha, 10).setValue(texto_(String(s.dados[2]))); o.aba.getRange(o.linha, 11).setValue(0); o.aba.getRange(o.linha, 12).setValue(Date.now());
  s.aba.getRange(s.linha, C_PLANTAO).setValue(Date.now());
  return { ok: true, obra: { id: o.id, dono: o.donoNome, item: o.item, nome: o.nome, mao: o.mao, progresso: 0, total: OBRA_MINUTOS } };
}
function avancarObra_(ss, o, l) {
  const prog = o.progresso + 1;
  o.aba.getRange(o.linha, 11).setValue(prog); o.aba.getRange(o.linha, 12).setValue(Date.now());
  if (prog >= OBRA_MINUTOS) { concluirObra_(ss, o, 'pronta'); creditar_(ss, l[0], o.mao); }
}
function concluirObra_(ss, o, status) {
  o.aba.getRange(o.linha, 8).setValue(status);
  const dono = linhaPorNumero_(ss, o.dono); if (!dono) return;
  const lista = String(dono.dados[C_ITENS - 1] || '').split(',').filter(String);
  if (lista.indexOf(o.item) < 0) lista.push(o.item);
  dono.aba.getRange(dono.linha, C_ITENS).setValue(lista.join(','));
  const item = ITENS.filter(function (x) { return x.id === o.item; })[0];
  ss.getSheetByName(ABA_TERRENOS).appendRow(['B' + o.dono + o.item, new Date(), texto_(o.nome), texto_(o.donoNome), dono.dados[3] ? texto_(String(dono.dados[3])) : '', item ? item.nome : o.item, (item ? item.preco : 0) + ' moedas', 'pago', 'moedas', 0, o.dono, o.item]);
}
// Obras sem engenheiro depois do prazo: a nave constrói sozinha (a mão de obra vai para o cofre da colônia)
function obrasVencidas_(ss) {
  const limite = Date.now() - OBRA_PRAZO_HORAS * 3600000;
  linhasObras_(ss).filter(function (o) { return (o.status === 'aguardando' || (o.status === 'em obra' && Date.now() - o.sinal > OBRA_MINUTOS * 60000)) && o.data < limite; })
    .forEach(function (o) { concluirObra_(ss, o, 'construída pela nave'); cobrarTaxa_(ss, o.mao, 'Mão de obra da nave (' + o.nome + ')'); });
}

/* ---------- Rankings e meta ---------- */
function rankings_(linhas) {
  const sem = semana_();
  const semana = linhas.map(function (l) { const p = String(l[C_PONTOS_SEM - 1] || '').split('|'); return { nome: String(l[2]), pontos: p[0] === sem ? Number(p[1]) || 0 : 0 }; })
    .filter(function (x) { return x.pontos > 0; }).sort(function (a, b) { return b.pontos - a.pontos; }).slice(0, 10);
  const total = linhas.map(function (l) { return { nome: String(l[2]), pontos: Number(l[C_PONTOS - 1]) || 0 }; })
    .filter(function (x) { return x.pontos > 0; }).sort(function (a, b) { return b.pontos - a.pontos; }).slice(0, 10);
  const ricos = linhas.map(function (l) { return { nome: String(l[2]), moedas: Number(l[C_MOEDAS - 1]) || 0 }; })
    .filter(function (x) { return x.moedas > 0; }).sort(function (a, b) { return b.moedas - a.moedas; }).slice(0, 10);
  return { semana: semana, total: total, ricos: ricos };
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
  if (Math.random() < BAU_CHANCE_FICHA_ITEM) ganhou.push('ficha_item');
  if (Math.random() < BAU_CHANCE_FICHA_EMPRESA) ganhou.push('ficha_empresa');
  p.itens = lista.concat(ganhou).join(',');
  p.moedas += BAU_MOEDAS; p.moedasBau = BAU_MOEDAS;
  salvarPerfil_(s, p);
  props.setProperty('BAU_' + b.dia, JSON.stringify({ nome: String(p.nome), numero: p.numero }));
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Baú do dia: ' + BAU_MOEDAS + ' moedas, ' + ganhou.join(', '), 0]);
  p.ganhou = ganhou;
  return p;
}

/* ---------- Baús pequenos (a cada 14 a 16 minutos, no máximo 2 no mapa) ---------- */
// Cada baú fica no mapa até alguém abrir. Se já tiver BAUZINHO_MAX_MAPA esperando, não aparece outro.
function bauzinhos_() {
  const pr = PropertiesService.getScriptProperties(), agora = Date.now();
  let st = null; try { st = JSON.parse(pr.getProperty('BAUZINHOS') || 'null'); } catch (e) { st = null; }
  if (!st) st = { lista: [], proximo: agora, seq: 0 };
  const intervalo = function () { return (BAUZINHO_MINUTOS * 60 + Math.round((Math.random() - 0.5) * 2 * BAUZINHO_VARIA_SEG)) * 1000; };
  let mudou = false;
  while (agora >= st.proximo) {
    mudou = true;
    if (st.lista.length < BAUZINHO_MAX_MAPA) {
      st.seq++; st.lista.push({ id: st.seq, x: 30 + Math.floor(Math.random() * (MAPA_L - 60)), y: 30 + Math.floor(Math.random() * (MAPA_A - 60)) });
      st.proximo += intervalo();
    } else st.proximo = agora + intervalo(); // mapa cheio: o relógio só volta a contar quando alguém abrir
  }
  if (mudou) pr.setProperty('BAUZINHOS', JSON.stringify(st));
  return st;
}
function abrirBauzinho_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para abrir o baú.' };
  const st = bauzinhos_(), b = st.lista.filter(function (x) { return x.id === Number(d.id); })[0];
  if (!b) return { ok: false, erro: 'Alguém chegou primeiro e abriu esse baú.' };
  if (Math.hypot(Number(d.x) - b.x, Number(d.y) - b.y) > 24) return { ok: false, erro: 'Chegue mais perto do baú.' };
  const moedas = BAUZINHO_MIN + Math.floor(Math.random() * (BAUZINHO_MAX - BAUZINHO_MIN + 1));
  st.lista = st.lista.filter(function (x) { return x.id !== b.id; });
  PropertiesService.getScriptProperties().setProperty('BAUZINHOS', JSON.stringify(st));
  CacheService.getScriptCache().remove('lista');
  s.aba.getRange(s.linha, C_MOEDAS).setValue((Number(s.dados[C_MOEDAS - 1]) || 0) + moedas);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), 'Baú pequeno: ' + moedas + ' moedas', 0]);
  const p = perfil_(ss, d); p.moedasBau = moedas; return p;
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
  const proib = regraOutdoor_(s.dados, frase); if (proib) return proib;
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
  const proib = regraOutdoor_(s.dados, texto); if (proib) return proib;
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
  return /^lote_\d+$/.test(id) || /^criado_/.test(id) || id === 'ficha_item' || id === 'ficha_empresa' || id === 'comida' || id === 'refeicao' || RECURSOS.some(function (r) { return r.id === id; }) || ITENS.some(function (i) { return i.id === id && !i.base && !i.fixo && !i.gas && !i.consumivel; });
}

function vender_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const item = String(d.item || ''), preco = Math.floor(Number(d.preco)), qtd = Math.floor(Number(d.qtd || 1));
  if (!vendivel_(item)) return { ok: false, erro: 'Esse item não pode ser vendido.' };
  if (!(preco >= 1 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço entre 1 e 100.000 moedas (por unidade).' };
  if (!(qtd >= 1 && qtd <= 999)) return { ok: false, erro: 'Escolha quantas unidades quer vender.' };
  if (qtd > 1 && /^lote_/.test(item)) return { ok: false, erro: 'Terreno é vendido um de cada vez.' };
  const aba = ss.getSheetByName(ABA_OFERTAS);
  const minhas = linhas_(aba).filter(function (l) { return l[6] === 'aberta' && String(l[2]) === String(s.dados[0]); }).length;
  if (minhas >= 10) return { ok: false, erro: 'Você já tem 10 itens à venda. Cancele algum primeiro.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (lista.filter(function (x) { return x === item; }).length < qtd) return { ok: false, erro: 'Você não tem ' + qtd + ' unidades desse item.' };
  for (let k = 0; k < qtd; k++) tirarItem_(lista, item);
  if (lista.indexOf(item) < 0 && tem_(p.veste, item)) { p.veste = vestirLista_(p.veste, item, false); s.aba.getRange(s.linha, C_VESTE).setValue(p.veste || '-'); }
  if (/^lote_/.test(item) && !lista.some(function (i) { return /^lote_/.test(i); }) && lista.some(function (i) { return ITENS.some(function (x) { return x.id === i && x.base; }); }))
    return { ok: false, erro: 'Sua base está nesse terreno. Você não pode vender o único terreno onde está a sua base.' };
  if (/^lote_/.test(item) && !lista.some(function (i) { return /^lote_/.test(i); }) && lista.indexOf('outdoor') >= 0)
    return { ok: false, erro: 'Seu outdoor está nesse terreno. Tire o outdoor antes de vender o terreno.' };
  p.itens = lista.join(',');
  salvarPerfil_(s, p);
  const id = 'O' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  aba.appendRow([id, new Date(), p.numero, texto_(String(p.nome)), item, preco, 'aberta', '', '', qtd]);
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
  const volta = []; for (let k = 0; k < qtdOferta_(o.dados); k++) volta.push(o.dados[4]);
  p.itens = (p.itens ? p.itens.split(',') : []).concat(volta).join(',');
  salvarPerfil_(s, p);
  return p;
}
function qtdOferta_(l) { const q = Math.floor(Number(l[9])); return q >= 1 ? q : 1; }

function comprarOferta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const o = acharOferta_(ss, d.id);
  if (!o || o.dados[6] !== 'aberta') return { ok: false, erro: 'Alguém já comprou essa oferta.' };
  if (String(o.dados[2]) === String(s.dados[0])) return { ok: false, erro: 'Essa oferta é sua.' };
  const tem = qtdOferta_(o.dados), qtd = Math.floor(Number(d.qtd || 1));
  if (!(qtd >= 1 && qtd <= tem)) return { ok: false, erro: 'Só tem ' + tem + (tem === 1 ? ' unidade' : ' unidades') + ' nessa oferta.' };
  const preco = (Number(o.dados[5]) || 0) * qtd, p = perfilDe_(s);
  if (p.moedas < preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + preco + '.' };
  const vend = linhaPorNumero_(ss, o.dados[2]);
  p.moedas -= preco;
  const vem = []; for (let k = 0; k < qtd; k++) vem.push(o.dados[4]);
  p.itens = (p.itens ? p.itens.split(',') : []).concat(vem).join(',');
  salvarPerfil_(s, p);
  const taxa = /^lote_/.test(String(o.dados[4])) ? Math.floor(preco * TAXA_TERRENO) : 0;
  if (vend) vend.aba.getRange(vend.linha, C_MOEDAS).setValue((Number(vend.dados[C_MOEDAS - 1]) || 0) + preco - taxa);
  if (taxa) cobrarTaxa_(ss, taxa, 'Taxa de venda de terreno');
  o.aba.getRange(o.linha, 10).setValue(tem - qtd);
  if (tem - qtd <= 0) o.aba.getRange(o.linha, 7).setValue('vendida');
  o.aba.getRange(o.linha, 8).setValue(p.numero);
  o.aba.getRange(o.linha, 9).setValue(texto_(String(p.nome)));
  return p;
}

/* ---------- Ajudantes ---------- */
function hoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function tem_(lista, id) { return (',' + (lista || '') + ',').indexOf(',' + id + ',') >= 0; }
function temCasa_(itens) { return tem_(itens, 'base') || tem_(itens, 'base_grande'); }
function arDe_(l) {
  const ts = Number(l[C_AR_TS - 1]) || 0;
  if (!ts) { // jeito antigo: gás por dia
    const v = l[C_GAS - 1], dia = v instanceof Date ? Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd') : String(v || '').replace(/^'/, '');
    return dia === hoje_() ? AR_MAX : 0;
  }
  return Math.max(0, Math.round((Number(l[C_AR - 1]) || 0) - (Date.now() - ts) / 60000));
}
function temGas_(l) { return funcaoDe_(l) === 'desempregado' || arDe_(l) > 0; }
function funcaoDe_(l) { const f = String(l[C_FUNCAO - 1] || ''); return FUNCOES[f] ? f : (MAPA_PROFISSAO[String(l[C_PROF - 1])] || 'livre'); }
function semana_() { const d = new Date(), j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + '-' + Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7); }
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
  const espera = funcaoDe_(s.dados) === 'minerador' ? MINERAR_SEGUNDOS / 2 : MINERAR_SEGUNDOS;
  if (estaDoente_(s.dados)) return { ok: false, erro: 'Você está doente e não consegue minerar agora.' };
  if (agora - ultimo < espera * 1000) return { ok: false, erro: 'Sua picareta precisa esfriar. Tente de novo em ' + Math.ceil((espera * 1000 - (agora - ultimo)) / 1000) + ' segundos.', espera: Math.ceil((espera * 1000 - (agora - ultimo)) / 1000) };
  s.aba.getRange(s.linha, C_MINERAR).setValue(agora);
  let achou = '';
  if (ESPECIAIS.length && Math.random() < ESPECIAL_CHANCE) achou = ESPECIAIS[Math.floor(Math.random() * ESPECIAIS.length)];
  else if (Math.random() < MINERAR_CHANCE) achou = Math.random() < 0.5 ? 'minerio' : RECURSOS[Math.floor(Math.random() * RECURSOS.length)].id;
  if (achou) {
    p.itens = (p.itens ? p.itens.split(',') : []).concat([achou]).join(',');
    salvarPerfil_(s, p);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Mineração: ' + achou, 0]);
  }
  p.achou = achou; p.espera = espera;
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
    casa: casa, aluga: aluga ? true : false, gas: temGas_(l), funcao: FUNCOES[funcaoDe_(l)].nome, pontos: Number(l[C_PONTOS - 1]) || 0 };
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
  const mudo = Number(s.dados[C_MUDO_ATE - 1]) || 0;
  if (mudo > Date.now() && CacheService.getScriptCache().get('mudoauto_' + s.dados[0])) return { ok: false, erro: 'Você está sem rádio por linguagem ofensiva. Volta a falar em ' + Math.ceil((mudo - Date.now()) / 60000) + ' min.' };
  if (mudo > Date.now()) return { ok: false, mudo: true, erro: 'Um guarda silenciou você no rádio. Você volta a falar em ' + Math.ceil((mudo - Date.now()) / 60000) + ' min. Se foi injusto, toque em RECLAMAR.' };
  const texto = limpar_(d.texto, 250);
  if (!texto) return { ok: false, erro: 'Escreva uma mensagem.' };

  const cache = CacheService.getScriptCache(), num = s.dados[0];
  const chaveTempo = 'ultimo_' + num;
  if (cache.get(chaveTempo)) return { ok: false, erro: 'Calma! Espere alguns segundos entre as mensagens.' };
  // flood: no máximo CHAT_MAX_POR_MINUTO mensagens por minuto, e nada de repetir a mesma mensagem
  let janela = []; try { janela = JSON.parse(cache.get('janela_' + num) || '[]'); } catch (e) { janela = []; }
  const agora = Date.now(); janela = janela.filter(function (t) { return agora - t < 60000; });
  if (janela.length >= CHAT_MAX_POR_MINUTO) return { ok: false, erro: 'Você mandou muitas mensagens seguidas. Espere ' + Math.ceil((60000 - (agora - janela[0])) / 1000) + ' segundos.' };
  const normal = normalizarTexto_(texto);
  if (cache.get('ultimotexto_' + num) === normal) return { ok: false, erro: 'Você já mandou essa mensagem. Não repita, por favor.' };
  // ofensas: bloqueia a mensagem; depois de algumas, silencia automático
  if (temOfensa_(normal)) {
    const n = (Number(cache.get('ofensas_' + num)) || 0) + 1;
    cache.put('ofensas_' + num, String(n), 21600);
    if (n >= CHAT_OFENSAS_PARA_SILENCIAR) {
      s.aba.getRange(s.linha, C_MUDO_ATE).setValue(agora + CHAT_SILENCIO_AUTO_MIN * 60000);
      cache.put('ofensas_' + num, '0', 21600);
      cache.put('mudoauto_' + num, '1', CHAT_SILENCIO_AUTO_MIN * 60);
      avisoRadio_(ss, s.dados[2] + ' ficou sem rádio por ' + CHAT_SILENCIO_AUTO_MIN + ' minutos por linguagem ofensiva.');
      return { ok: false, erro: 'Você ficou sem rádio por ' + CHAT_SILENCIO_AUTO_MIN + ' minutos por insistir em linguagem ofensiva.' };
    }
    return { ok: false, erro: 'Sua mensagem não foi enviada: tem palavras ofensivas. Seja gentil no rádio (' + n + ' de ' + CHAT_OFENSAS_PARA_SILENCIAR + ' avisos).' };
  }
  cache.put(chaveTempo, '1', 4);
  janela.push(agora); cache.put('janela_' + num, JSON.stringify(janela), 120);
  cache.put('ultimotexto_' + num, normal, 600);

  ss.getSheetByName(ABA_CHAT).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), texto_(texto), '']);
  cache.remove('chat');
  return { ok: true };
}

function normalizarTexto_(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[0@4]/g, function (c) { return c === '0' ? 'o' : 'a'; }).replace(/1/g, 'i').replace(/3/g, 'e').replace(/5|\$/g, 's').replace(/7/g, 't')
    .replace(/[^a-z ]+/g, ' ').replace(/(.)\1+/g, '$1').replace(/\s+/g, ' ').trim();
}
function temOfensa_(normal) {
  const palavras = ' ' + normal + ' ', junto = normal.replace(/ /g, '');
  return PALAVRAS_PROIBIDAS.some(function (p) {
    const n = normalizarTexto_(p);
    if (palavras.indexOf(' ' + n + ' ') >= 0) return true;              // palavra inteira
    return n.length >= 5 && junto.indexOf(n.replace(/ /g, '')) >= 0;   // palavrões longos escritos com espaço ou grudados (c a r a l h o)
  });
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
  if (ss.getSheetByName(ABA_SILENCIO)) {
    const recl = linhas_(ss.getSheetByName(ABA_SILENCIO)).filter(function (l) { return String(l[7]) && !String(l[8]); });
    corpo += '\nRECLAMAÇÕES DE SILENCIADOS ESPERANDO VOCÊ (' + recl.length + ') — decida na aba Silenciados (certo ou abuso)\n';
    recl.forEach(function (l) { corpo += l[0] + ' | guarda ' + l[3] + ' silenciou ' + l[5] + '\n   Mensagens: ' + l[6] + '\n   Reclamação: ' + l[7] + '\n'; });
  }
  if (ss.getSheetByName(ABA_LEILOES)) {
    const lei = linhas_(ss.getSheetByName(ABA_LEILOES)).filter(function (l) { return new Date(l[1]) > desde; });
    corpo += '\nLEILÃO DO VÍDEO (' + lei.length + ')\n';
    lei.forEach(function (l) { corpo += l[0] + ' | ' + l[3] + (l[4] ? ' (@' + l[4] + ')' : '') + ' | ' + l[5] + ' moedas | frase: ' + (l[6] || '(ainda não escreveu)') + '\n'; });
  }
  if (ss.getSheetByName(ABA_CRIACOES)) {
    const cri = linhas_(ss.getSheetByName(ABA_CRIACOES)).filter(function (l) { return String(l[7] || 'pendente') === 'pendente'; });
    corpo += '\nIDEIAS DE ITEM/EMPRESA ESPERANDO APROVAÇÃO (' + cri.length + ') — na aba Criacoes escreva aprovado (e o nome_final) ou recusado\n';
    cri.forEach(function (l) { corpo += l[0] + ' | ' + l[4] + ' de ' + l[3] + ': ' + l[5] + '\n'; });
  }
  corpo += '\nTAXAS NO COFRE DA COLÔNIA: ' + (Number(props.getProperty('COFRE')) || 0) + ' moedas\n';
  corpo += '\nPlanilha completa: ' + ss.getUrl() + '\n';

  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
    '[Colônia] Resumo: ' + novos.length + ' sobreviventes, ' + ideias.length + ' ideias, R$ ' + reais.toFixed(2) + ' em moedas', corpo);
  props.setProperty('ULTIMO_RESUMO', String(agora.getTime()));
}

/* ---------- Torres de clã ---------- */
function garantirTorres_(ss) {
  const aba = ss.getSheetByName(ABA_TORRES), ids = linhas_(aba).map(function (l) { return String(l[0]); });
  TORRES.forEach(function (t) { if (ids.indexOf(t.id) < 0) aba.appendRow([t.id, t.nome, 'escondida', 0, TORRE_META, TORRE_PRECO, '{}', '', '', '', '', '', '', CLA_ENTRADA_PADRAO, '', '']); });
}
function torresLinhas_(ss) {
  const aba = ss.getSheetByName(ABA_TORRES); if (!aba) return [];
  return linhas_(aba).map(function (l, i) {
    const cfg = TORRES.filter(function (t) { return t.id === String(l[0]); })[0] || { x: 0, y: 0 };
    let contrib = {}; try { contrib = JSON.parse(String(l[6] || '{}')); } catch (e) { contrib = {}; }
    const st = String(l[2] || 'escondida');
    return { linha: i + 2, id: String(l[0]), nome: String(l[1]), x: cfg.x, y: cfg.y, status: st === 'escondida' ? 'escondida' : st, descoberta: st !== 'escondida',
      pontos: Number(l[3]) || 0, meta: Number(l[4]) || TORRE_META, preco: Number(l[5]) || TORRE_PRECO, contrib: contrib,
      recusaram: String(l[7] || '').split(',').filter(String), ofertaNumero: String(l[8] || ''), ofertaAte: Number(l[9]) || 0,
      donoNumero: String(l[10] || ''), dono: String(l[11] || ''), nomeCla: String(l[12] || ''), precoEntrada: Number(l[13]) || 0, descobridor: String(l[14] || ''), ofertaNome: '' };
  });
}
function torrePorId_(ss, id) {
  const t = torresLinhas_(ss).filter(function (x) { return x.id === String(id); })[0];
  if (t && t.ofertaNumero) { const o = linhaPorNumero_(ss, t.ofertaNumero); t.ofertaNome = o ? String(o.dados[2]) : ''; }
  return t;
}
function salvarTorre_(ss, t) {
  ss.getSheetByName(ABA_TORRES).getRange(t.linha, 3, 1, 14).setValues([[t.status, t.pontos, t.meta, t.preco, JSON.stringify(t.contrib), t.recusaram.join(','), t.ofertaNumero, t.ofertaAte, t.donoNumero, t.dono, t.nomeCla, t.precoEntrada, t.descobridor, t.descobertaEm || '']]);
}
function avisoRadio_(ss, texto) { ss.getSheetByName(ABA_CHAT).appendRow([new Date(), 0, 'NAVE', texto_(texto), '']); CacheService.getScriptCache().remove('chat'); }
function descobrirTorre_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const t = torrePorId_(ss, d.id);
  if (!t) return { ok: false, erro: 'Torre não encontrada.' };
  if (Math.hypot(Number(d.x) - t.x, Number(d.y) - t.y) > TORRE_RAIO + 10) return { ok: false, erro: 'Chegue mais perto da torre.' };
  if (t.descoberta) return { ok: true, nova: false, torre: t.id };
  t.status = 'bloqueada'; t.descobridor = String(s.dados[2]); t.descobertaEm = new Date().toISOString(); salvarTorre_(ss, t);
  avisoRadio_(ss, s.dados[2] + ' descobriu a ' + t.nome + '! Não fomos nós que construímos isso... existem outros seres neste planeta. Quem desbloquear a torre pode virar dono do primeiro clã.');
  CacheService.getScriptCache().remove('lista');
  return { ok: true, nova: true, torre: t.id };
}
function proximoDaTorre_(t) {
  return Object.keys(t.contrib).filter(function (n) { return t.recusaram.indexOf(n) < 0 && t.contrib[n] > 0; })
    .sort(function (a, b) { return t.contrib[b] - t.contrib[a]; })[0] || '';
}
function somarTorre_(ss, t, numero, n) {
  t.contrib[String(numero)] = (t.contrib[String(numero)] || 0) + n; t.pontos += n;
  if (t.pontos >= t.meta) abrirOfertaTorre_(ss, t); else salvarTorre_(ss, t);
}
function abrirOfertaTorre_(ss, t) {
  const n = proximoDaTorre_(t);
  if (!n) { salvarTorre_(ss, t); return; } // ninguém novo para oferecer: espera mais gente somar pontos
  t.status = 'oferta'; t.ofertaNumero = n; t.ofertaAte = Date.now() + TORRE_PRAZO_HORAS * 3600000; salvarTorre_(ss, t);
  const o = linhaPorNumero_(ss, n);
  avisoRadio_(ss, 'A ' + t.nome + ' foi desbloqueada! ' + (o ? o.dados[2] : 'Quem mais ajudou') + ' tem ' + TORRE_PRAZO_HORAS + ' horas para pagar ' + t.preco + ' moedas e virar dono do clã.');
  CacheService.getScriptCache().remove('lista');
}
function recusarTorre_(ss, t) {
  if (t.ofertaNumero && t.recusaram.indexOf(t.ofertaNumero) < 0) t.recusaram.push(t.ofertaNumero);
  t.status = 'bloqueada'; t.ofertaNumero = ''; t.ofertaAte = 0;
  t.meta = t.pontos + TORRE_PONTOS_EXTRA; t.preco = Math.max(TORRE_PRECO_MIN, t.preco - TORRE_DESCONTO);
  salvarTorre_(ss, t);
}
function torresVencidas_(ss) {
  torresLinhas_(ss).forEach(function (t) { if (t.status === 'oferta' && t.ofertaAte && Date.now() > t.ofertaAte) recusarTorre_(ss, t); });
}
function responderTorre_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const t = torrePorId_(ss, d.id);
  if (!t || t.status !== 'oferta' || t.ofertaNumero !== String(s.dados[0])) return { ok: false, erro: 'Essa oferta não é para você (ou já acabou).' };
  if (!d.aceitar) { recusarTorre_(ss, t); return perfil_(ss, d); }
  const moedas = Number(s.dados[C_MOEDAS - 1]) || 0;
  if (moedas < t.preco) return { ok: false, erro: 'Ser dono do clã custa ' + t.preco + ' moedas e você tem ' + moedas + '. Você ainda tem até ' + Utilities.formatDate(new Date(t.ofertaAte), 'America/Sao_Paulo', 'dd/MM HH:mm') + ' para juntar.' };
  const nome = limpar_(d.nomeCla, 30) || ('Clã da ' + t.nome);
  s.aba.getRange(s.linha, C_MOEDAS).setValue(moedas - t.preco);
  s.aba.getRange(s.linha, C_CLA).setValue(t.id);
  cobrarTaxa_(ss, t.preco, 'Dono do clã: ' + t.nome);
  t.status = 'dono'; t.donoNumero = String(s.dados[0]); t.dono = String(s.dados[2]); t.nomeCla = texto_(nome); t.ofertaNumero = ''; t.ofertaAte = 0;
  salvarTorre_(ss, t);
  avisoRadio_(ss, s.dados[2] + ' agora é dono da ' + t.nome + ' e fundou o clã "' + nome + '"!');
  return perfil_(ss, d);
}
function precoCla_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const t = torresLinhas_(ss).filter(function (x) { return x.status === 'dono' && x.donoNumero === String(s.dados[0]); })[0];
  if (!t) return { ok: false, erro: 'Você não é dono de clã.' };
  const preco = Math.floor(Number(d.preco));
  if (!(preco >= 0 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço de 0 a 100.000 moedas.' };
  t.precoEntrada = preco; salvarTorre_(ss, t);
  return { ok: true, preco: preco };
}
function entrarCla_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const t = torrePorId_(ss, d.id);
  if (!t || t.status !== 'dono') return { ok: false, erro: 'Esse clã ainda não existe.' };
  if (String(s.dados[C_CLA - 1]) === t.id) return { ok: false, erro: 'Você já está nesse clã.' };
  if (String(s.dados[C_CLA - 1])) return { ok: false, erro: 'Você já está em outro clã. Saia dele primeiro (cada um só pode estar em um clã).' };
  const moedas = Number(s.dados[C_MOEDAS - 1]) || 0;
  if (moedas < t.precoEntrada) return { ok: false, erro: 'A entrada no clã custa ' + t.precoEntrada + ' moedas e você tem ' + moedas + '.' };
  const taxa = Math.floor(t.precoEntrada * TAXA_CLA);
  s.aba.getRange(s.linha, C_MOEDAS).setValue(moedas - t.precoEntrada);
  s.aba.getRange(s.linha, C_CLA).setValue(t.id);
  creditar_(ss, t.donoNumero, t.precoEntrada - taxa); cobrarTaxa_(ss, taxa, 'Taxa de entrada no clã ' + t.nomeCla);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), 'Entrou no clã ' + t.nomeCla, t.precoEntrada]);
  return perfil_(ss, d);
}
function sairCla_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const id = String(s.dados[C_CLA - 1] || '');
  if (!id) return { ok: false, erro: 'Você não está em nenhum clã.' };
  const t = torrePorId_(ss, id);
  if (t && t.donoNumero === String(s.dados[0])) return { ok: false, erro: 'O dono não pode sair do próprio clã.' };
  s.aba.getRange(s.linha, C_CLA).setValue('');
  return perfil_(ss, d);
}
function torresPublicas_(ss, todas) {
  const nomes = {}; todas.forEach(function (l) { nomes[String(l[0])] = String(l[2]); });
  const membros = {}; todas.forEach(function (l) { const c = String(l[C_CLA - 1] || ''); if (c) membros[c] = (membros[c] || 0) + 1; });
  return torresLinhas_(ss).map(function (t) {
    const top = Object.keys(t.contrib).sort(function (a, b) { return t.contrib[b] - t.contrib[a]; }).slice(0, 5)
      .map(function (n) { return { nome: nomes[n] || ('#' + n), pontos: t.contrib[n], recusou: t.recusaram.indexOf(n) >= 0 }; });
    return { id: t.id, nome: t.nome, x: t.x, y: t.y, descoberta: t.descoberta, status: t.status, pontos: t.pontos, meta: t.meta, preco: t.preco,
      top: top, oferta: t.status === 'oferta' ? { nome: nomes[t.ofertaNumero] || '', ate: t.ofertaAte } : null,
      dono: t.dono, nomeCla: t.nomeCla, precoEntrada: t.precoEntrada, membros: membros[t.id] || 0, descobridor: t.descobridor };
  });
}

/* ---------- Outdoor: mesmas regras do rádio ---------- */
function regraOutdoor_(l, texto) {
  if ((Number(l[C_MUDO_ATE - 1]) || 0) > Date.now() || CacheService.getScriptCache().get('mudoauto_' + l[0])) return { ok: false, erro: 'Você está sem rádio agora, e as mesmas regras valem para o outdoor. Espere o tempo acabar.' };
  if (temOfensa_(normalizarTexto_(texto))) return { ok: false, erro: 'Essa frase tem palavras proibidas na colônia. O outdoor segue as mesmas regras do rádio.' };
  return null;
}
// Guarda tira do mapa uma frase ofensiva de outdoor (do dono ou do anúncio pago). Quem escreveu fica sem rádio por 5 min e pode reclamar.
function censurarOutdoor_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (funcaoDe_(s.dados) !== 'guarda') return { ok: false, erro: 'Só guardas podem tirar frases de outdoor.' };
  const dono = linhaPorNumero_(ss, d.numero);
  if (!dono || !tem_(String(dono.dados[C_ITENS - 1] || ''), 'outdoor')) return { ok: false, erro: 'Esse outdoor não existe mais.' };
  const o = outdoorDe_(dono.dados);
  let texto, autor;
  if (o.anuncio) { texto = o.anuncio.texto; autor = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return String(l[2]) === o.anuncio.autor; })[0]; }
  else { if (!o.texto) return { ok: false, erro: 'Esse outdoor está sem frase.' }; texto = o.texto; autor = dono.dados; }
  if (autor && String(autor[0]) === String(s.dados[0])) return { ok: false, erro: 'A frase é sua: troque você mesmo.' };
  if (o.anuncio) { dono.aba.getRange(dono.linha, C_OUT_ANUNCIO).setValue(''); dono.aba.getRange(dono.linha, C_OUT_ATE).setValue(0); }
  else dono.aba.getRange(dono.linha, C_OUTDOOR).setValue('');
  if (autor) { const a = linhaPorNumero_(ss, autor[0]); if (a) a.aba.getRange(a.linha, C_MUDO_ATE).setValue(Date.now() + SILENCIO_MINUTOS * 60000); }
  const id = 'S' + Date.now().toString(36).toUpperCase();
  ss.getSheetByName(ABA_SILENCIO).appendRow([id, new Date(), s.dados[0], texto_(String(s.dados[2])), autor ? autor[0] : '', texto_(String(autor ? autor[2] : o.anuncio.autor)), texto_('OUTDOOR de ' + o.dono + ': ' + texto), '', '', '']);
  avisoRadio_(ss, 'O guarda ' + s.dados[2] + ' tirou uma frase do outdoor de ' + o.dono + '.');
  return { ok: true };
}

/* ---------- Guardas: silenciar no rádio ---------- */
function silenciar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (funcaoDe_(s.dados) !== 'guarda') return { ok: false, erro: 'Só guardas podem silenciar alguém no rádio.' };
  const alvo = linhaPorNumero_(ss, d.numero);
  if (!alvo) return { ok: false, erro: 'Sobrevivente não encontrado.' };
  if (String(alvo.dados[0]) === String(s.dados[0])) return { ok: false, erro: 'Você não pode silenciar a si mesmo.' };
  if ((Number(alvo.dados[C_MUDO_ATE - 1]) || 0) > Date.now()) return { ok: false, erro: alvo.dados[2] + ' já está silenciado.' };
  const msgs = linhas_(ss.getSheetByName(ABA_CHAT)).filter(function (l) { return String(l[1]) === String(alvo.dados[0]); }).slice(-5).map(function (l) { return String(l[3]); }).join(' / ');
  alvo.aba.getRange(alvo.linha, C_MUDO_ATE).setValue(Date.now() + SILENCIO_MINUTOS * 60000);
  const id = 'S' + Date.now().toString(36).toUpperCase();
  ss.getSheetByName(ABA_SILENCIO).appendRow([id, new Date(), s.dados[0], texto_(String(s.dados[2])), alvo.dados[0], texto_(String(alvo.dados[2])), texto_(msgs), '', '', '']);
  avisoRadio_(ss, 'O guarda ' + s.dados[2] + ' silenciou ' + alvo.dados[2] + ' por ' + SILENCIO_MINUTOS + ' minutos.');
  return { ok: true, nome: String(alvo.dados[2]) };
}
function ultimoSilencio_(ss, numero) {
  const aba = ss.getSheetByName(ABA_SILENCIO); if (!aba) return null;
  const ls = linhas_(aba); for (let i = ls.length - 1; i >= 0; i--) if (String(ls[i][4]) === String(numero))
    return { linha: i + 2, id: String(ls[i][0]), guarda: String(ls[i][3]), reclamacao: String(ls[i][7] || ''), decisao: String(ls[i][8] || '') };
  return null;
}
function reclamar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const sil = ultimoSilencio_(ss, s.dados[0]);
  if (!sil) return { ok: false, erro: 'Você não foi silenciado.' };
  if (sil.reclamacao) return { ok: false, erro: 'Você já reclamou. A colônia vai analisar o rádio e decidir.' };
  const texto = limpar_(d.texto, 300);
  if (texto.length < 5) return { ok: false, erro: 'Explique em poucas palavras por que foi injusto.' };
  ss.getSheetByName(ABA_SILENCIO).getRange(sil.linha, 8).setValue(texto_(texto));
  return { ok: true };
}
function processarSilencios_(ss) {
  const aba = ss.getSheetByName(ABA_SILENCIO);
  linhas_(aba).forEach(function (l, i) {
    const dec = String(l[8] || '').trim().toLowerCase();
    if (!dec || String(l[9])) return;
    const g = linhaPorNumero_(ss, l[2]);
    if (g && dec === 'certo') creditar_(ss, l[2], GUARDA_BONUS);
    if (g && dec === 'abuso' && funcaoDe_(g.dados) === 'guarda') { g.aba.getRange(g.linha, C_FUNCAO).setValue('livre'); g.aba.getRange(g.linha, C_FUNCAO_DATA).setValue(0); }
    if (dec === 'abuso') { const a = linhaPorNumero_(ss, l[4]); if (a) a.aba.getRange(a.linha, C_MUDO_ATE).setValue(0); }
    aba.getRange(i + 2, 10).setValue(dec === 'certo' ? 'bônus de ' + GUARDA_BONUS + ' pago' : dec === 'abuso' ? 'guarda perdeu a função' : 'ok');
  });
}

/* ---------- Criar item e criar empresa (fichas do baú) ---------- */
function criar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const tipo = d.tipo === 'empresa' ? 'empresa' : 'item', ficha = 'ficha_' + tipo, preco = tipo === 'empresa' ? CRIAR_EMPRESA_PRECO : CRIAR_ITEM_PRECO;
  const lista = String(s.dados[C_ITENS - 1] || '').split(',').filter(String);
  if (lista.indexOf(ficha) < 0) return { ok: false, erro: 'Você precisa da ficha "' + (tipo === 'empresa' ? 'Criar empresa' : 'Criar item') + '". Ela aparece no baú do dia ou no mercado dos sobreviventes.' };
  if (tipo === 'empresa' && !lista.some(function (i) { return /^lote_\d+$/.test(i); })) return { ok: false, erro: 'Para abrir uma empresa você precisa ter um terreno.' };
  const texto = limpar_(d.texto, 400);
  if (texto.length < 10) return { ok: false, erro: 'Descreva melhor a sua ideia (pelo menos 10 letras).' };
  const moedas = Number(s.dados[C_MOEDAS - 1]) || 0;
  if (moedas < preco) return { ok: false, erro: 'Custa ' + preco + ' moedas e você tem ' + moedas + '.' };
  tirarItem_(lista, ficha);
  s.aba.getRange(s.linha, C_ITENS).setValue(lista.join(','));
  s.aba.getRange(s.linha, C_MOEDAS).setValue(moedas - preco);
  const id = 'C' + Date.now().toString(36).toUpperCase();
  ss.getSheetByName(ABA_CRIACOES).appendRow([id, new Date(), s.dados[0], texto_(String(s.dados[2])), tipo, texto_(texto), preco, 'pendente', '', '']);
  cobrarTaxa_(ss, preco, 'Criar ' + tipo + ' (' + id + ')');
  return perfil_(ss, d);
}
function processarCriacoes_(ss) {
  const aba = ss.getSheetByName(ABA_CRIACOES);
  linhas_(aba).forEach(function (l, i) {
    const st = String(l[7] || '').trim().toLowerCase();
    if (String(l[9]) || (st !== 'aprovado' && st !== 'recusado')) return;
    const p = linhaPorNumero_(ss, l[2]); if (!p) return;
    const lista = String(p.dados[C_ITENS - 1] || '').split(',').filter(String);
    if (st === 'aprovado') lista.push((String(l[4]) === 'empresa' ? 'empresa_' : 'criado_') + l[0]);
    else { lista.push('ficha_' + (String(l[4]) === 'empresa' ? 'empresa' : 'item')); creditar_(ss, l[2], Number(l[6]) || 0); }
    p.aba.getRange(p.linha, C_ITENS).setValue(lista.join(','));
    aba.getRange(i + 2, 10).setValue(st === 'aprovado' ? 'entregue' : 'devolvido');
  });
}
function criadosPublicos_(ss) {
  const r = {};
  linhas_(ss.getSheetByName(ABA_CRIACOES)).forEach(function (l) {
    if (String(l[7] || '').trim().toLowerCase() !== 'aprovado') return;
    r[(String(l[4]) === 'empresa' ? 'empresa_' : 'criado_') + l[0]] = { nome: String(l[8] || l[5]).slice(0, 40), tipo: String(l[4]), dono: String(l[3]) };
  });
  return r;
}

/* ---------- Leilão do vídeo ---------- */
function proximoFechamento_(agora) {
  const dia = Utilities.formatDate(new Date(agora), 'America/Sao_Paulo', 'yyyy-MM-dd');
  let f = new Date(dia + 'T' + ('0' + LEILAO_HORA).slice(-2) + ':00:00-03:00').getTime();
  if (f <= agora) f += 86400000;
  return f;
}
function leilaoAtual_() {
  const pr = PropertiesService.getScriptProperties();
  let a = null; try { a = JSON.parse(pr.getProperty('LEILAO') || 'null'); } catch (e) { a = null; }
  if (!a) { a = { fecha: proximoFechamento_(Date.now()), topo: null }; pr.setProperty('LEILAO', JSON.stringify(a)); }
  return a;
}
function salvarLeilao_(a) { PropertiesService.getScriptProperties().setProperty('LEILAO', JSON.stringify(a)); }
function fecharLeilao_(ss) {
  const a = leilaoAtual_();
  if (Date.now() < a.fecha) return a;
  const id = Utilities.formatDate(new Date(a.fecha), 'America/Sao_Paulo', 'yyyy-MM-dd');
  if (a.topo) {
    ss.getSheetByName(ABA_LEILOES).appendRow([id, new Date(a.fecha), a.topo.numero, texto_(a.topo.nome), texto_(a.topo.insta || ''), a.topo.valor, '', 'esperando frase']);
    cobrarTaxa_(ss, a.topo.valor, 'Leilão do vídeo ' + id);
    avisoRadio_(ss, a.topo.nome + ' venceu o leilão do vídeo com ' + a.topo.valor + ' moedas! O @ vai ser divulgado no próximo vídeo.');
  }
  const novo = { fecha: proximoFechamento_(Date.now()), topo: null }; salvarLeilao_(novo);
  CacheService.getScriptCache().remove('lista');
  return novo;
}
function lance_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para dar um lance.' };
  const a = fecharLeilao_(ss), valor = Math.floor(Number(d.valor));
  const minimo = a.topo ? a.topo.valor + LEILAO_AUMENTO : LEILAO_MINIMO;
  if (!(valor >= minimo)) return { ok: false, erro: 'O lance mínimo agora é ' + minimo + ' moedas.' };
  const meu = a.topo && String(a.topo.numero) === String(s.dados[0]);
  const moedas = Number(s.dados[C_MOEDAS - 1]) || 0, disponivel = moedas + (meu ? a.topo.valor : 0);
  if (disponivel < valor) return { ok: false, erro: 'Você tem ' + disponivel + ' moedas para esse lance.' };
  if (a.topo && !meu) creditar_(ss, a.topo.numero, a.topo.valor); // quem foi superado recebe de volta
  s.aba.getRange(s.linha, C_MOEDAS).setValue(disponivel - valor);
  const insta = limpar_(d.instagram, 31).replace(/^@*/, '') || String(s.dados[3] || '');
  a.topo = { numero: s.dados[0], nome: String(s.dados[2]), insta: insta, valor: valor }; salvarLeilao_(a);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), 'Lance no leilão do vídeo (devolvido se for superado)', valor]);
  const p = perfil_(ss, d); p.leilao = leilaoPublico_(ss); return p;
}
function fraseLeilao_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const aba = ss.getSheetByName(ABA_LEILOES), ls = linhas_(aba);
  for (let i = ls.length - 1; i >= 0; i--) {
    if (String(ls[i][2]) !== String(s.dados[0]) || String(ls[i][6])) continue;
    const frase = limpar_(d.frase, 300);
    if (frase.length < 5) return { ok: false, erro: 'Escreva o que você quer divulgar.' };
    const insta = limpar_(d.instagram, 31).replace(/^@*/, '');
    aba.getRange(i + 2, 7).setValue(texto_(frase)); aba.getRange(i + 2, 8).setValue('pronto para o vídeo');
    if (insta) aba.getRange(i + 2, 5).setValue(texto_(insta));
    CacheService.getScriptCache().remove('lista');
    return { ok: true };
  }
  return { ok: false, erro: 'Você não tem leilão vencido esperando frase.' };
}
function leilaoPublico_(ss) {
  const a = leilaoAtual_(), ls = linhas_(ss.getSheetByName(ABA_LEILOES)), u = ls[ls.length - 1];
  return { fecha: a.fecha, topo: a.topo ? { nome: a.topo.nome, valor: a.topo.valor } : null, minimo: a.topo ? a.topo.valor + LEILAO_AUMENTO : LEILAO_MINIMO, aumento: LEILAO_AUMENTO,
    ultimo: u ? { id: String(u[0]), nome: String(u[3]), insta: String(u[4] || ''), valor: Number(u[5]) || 0, temFrase: !!String(u[6] || ''), numero: String(u[2]) } : null };
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
  return aba.getRange(2, 1, aba.getLastRow() - 1, Math.max(aba.getLastColumn(), 41)).getValues();
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
