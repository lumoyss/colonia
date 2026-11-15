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
// Líder da nave até a primeira eleição (22/11). Depois a eleição escolhe.
const LIDER_NOME = 'Luvixo';

const ABA_SOBREVIVENTES = 'Sobreviventes';
const ABA_IDEIAS = 'Ideias';
const ABA_TERRENOS = 'Terrenos';
const ABA_PEDIDOS = 'Pedidos';
const ABA_COMPRAS = 'Compras';
const ABA_CHAT = 'Chat';
const ABA_OFERTAS = 'Ofertas';
const ABA_ALUGUEIS = 'Alugueis';
const ABA_OBRAS = 'Obras';
const ABA_ACOMPANHA = 'Acompanhamentos';
const ABA_TORRES = 'Torres';
const ABA_SILENCIO = 'Silenciados';
const ABA_CRIACOES = 'Criacoes';
const ABA_LEILOES = 'Leiloes';
const ABA_AVISOS = 'Avisos';
const ABA_PAUTAS = 'Pautas', ABA_ASSEMBLEIA = 'Assembleia', ABA_VOTOS = 'Votos', ABA_ENTRADAS = 'EntradasAssembleia';
/* ---------- ASSEMBLEIA ---------- */
const TICKETS_CADASTRO = { ticket_assembleia: 4, ticket_pauta: 1 }; // quem acorda ganha 5 tickets
const PAUTAS_POR_DIA = 3, VOTACAO_FECHA_HORA = 22;
/* ---------- OFERTA DE BOAS-VINDAS ---------- */
const OFERTA_REAIS = 2, OFERTA_MOEDAS = 2000, OFERTA_CAIXA_DIAS = 5, OFERTA_ROUPA = 'jaqueta_orion', OFERTA_MINUTOS = 60;
const OFERTA_DEPOIS_MIN = 15; // aparece ao abrir o Mercado depois de 15 min de jogo
const AVISOS_LER = 400;   // o sininho lê só os últimos avisos da planilha (mais rápido)
const AVISOS_POR_PESSOA = 20;
const TIPOS_IDEIA = ['historia', 'profissao', 'lugar', 'outro'];

// Colunas da aba Sobreviventes (1 = A)
const C_NUMERO = 1, C_NOME = 3, C_INSTA = 4, C_PROF = 5, C_VISUAL = 7, C_MOEDAS = 8, C_CHAVE = 9, C_ITENS = 10, C_BANIDO = 11;
const C_ON_DIA = 12, C_ON_MIN = 13, C_ON_ULTIMO = 14, C_TURNO = 15, C_PROGRESSO = 16, C_DESCANSO = 17, C_RECON = 18, C_OUTDOOR = 19;
const C_VESTE = 20, C_GAS = 21, C_OBJETIVO = 22, C_AMIGOS = 23, C_MINERAR = 24, C_DATA = 2, C_HIST = 6;
const C_OUT_PRECO = 25, C_OUT_ANUNCIO = 26, C_OUT_AUTOR = 27, C_OUT_ATE = 28;
const C_FUNCAO = 29, C_FUNCAO_DATA = 30, C_PONTOS = 31, C_PONTOS_SEM = 32, C_FOME = 33, C_DOENTE_ATE = 34, C_AR = 35, C_AR_TS = 36,
  C_PLANTAO = 37, C_MEDICO_PRECO = 38, C_EXTRA = 39, C_CLA = 40, C_MUDO_ATE = 41, C_OUT_OFERTA = 42, C_ANUNCIO_OFERTA = 43,
  C_GUARDA_DIA = 44, C_BOOST_ATE = 45, C_OFERTA_ATE = 46, C_CAIXA_ATE = 47,
  C_SEG_PRECO = 48, C_INVASAO = 49, C_VISTO = 50, C_PESQUISA = 51, C_TITULO = 52, C_CHECKIN = 53, C_VASSOURA_ATE = 54, C_MINERACAO = 55, C_APOIADOR = 56, C_CONSERTO_DIA = 57, C_EMAIL = 58, C_EMAIL_DIA = 59, C_PICARETA_VELHA = 60, C_REDE = 61;
// E-MAIL (opcional, com consentimento no cadastro): só avisos importantes, no máximo 1 por pessoa por dia.
// A conta gratuita do Google manda para no máximo 100 pessoas por dia; paramos com folga.
const EMAIL_FOLGA = 10, EMAIL_NOME = 'Nave Orion';
// Depois de 4 horas de conserto no dia, as moedas passam a cair 1 vez por minuto em vez de a cada 15 s (1/4); os pontos continuam inteiros. Decisão do Lucas 14/11.
const CONSERTO_CHEIO_MIN = 240;
const PROTECAO_NOVATO_DIAS = 3; // quem acordou há menos de 3 dias não pode ser invadido
const FERRAMENTA_DIAS = 7; // caixa de ferramentas e vassoura valem 7 dias
// online_dia (col. 12) guarda o último minuto contado; online_minutos (col. 13) soma o tempo online total.

/* ---------- TÍTULOS DE NOBREZA ---------- */
// Horas online + Assembleias de que participou + pagamento em moedas. Um título de cada vez, em ordem.
// Do Cavaleiro em diante precisa do item exclusivo do título (vem no baú especial do check-in, 1 por semana completa).
const TITULOS = [
  { id: 'escudeiro', nome: 'Escudeiro', fem: 'Escudeira', horas: 1, assembleias: 1, preco: 50 },
  { id: 'cavaleiro', nome: 'Cavaleiro', fem: 'Princesa', horas: 15, assembleias: 5, preco: 300, item: true },
  { id: 'barao', nome: 'Barão', fem: 'Baronesa', horas: 40, assembleias: 15, preco: 500, item: true },
  { id: 'conde', nome: 'Conde', fem: 'Condessa', horas: 100, assembleias: 30, preco: 1000, item: true },
  { id: 'duque', nome: 'Duque', fem: 'Duquesa', horas: 200, assembleias: 60, preco: 2000, item: true }
];
// Itens exclusivos com o nome da pessoa (id: reliquia_<titulo>_<numero>). Podem ser vendidos como item de colecionador,
// e quem comprar também pode pegar o título, pagando mais caro.
const RELIQUIAS = {
  cavaleiro: { masc: 'Espada de Cavaleiro de ', fem: 'Espada de Princesa de ' },
  barao: { masc: 'Pistola laser do Barão ', fem: 'Pistola laser da Baronesa ' },
  conde: { masc: 'Insígnia do Conde ', fem: 'Insígnia da Condessa ' },
  duque: { masc: 'Miniatura da Nave Orion do Duque ', fem: 'Miniatura da Nave Orion da Duquesa ' }
};
const ORDEM_RELIQUIAS = ['cavaleiro', 'barao', 'conde', 'duque'];
const TITULO_ITEM_COMPRADO_X = 3; // com item exclusivo comprado de outra pessoa, o título custa 3x
// Quem compra o item de outra pessoa também pode usar para o título, pagando TITULO_ITEM_COMPRADO_X vezes o preço.
/* ---------- CHECK-IN DIÁRIO (7 dias seguidos; faltou um dia, volta ao dia 1) ---------- */
const CHECKIN_MOEDAS = [20, 30, 40, 50, 60, 80, 150]; // dia 7 = baú especial (+ item exclusivo da semana)

/* ---------- CENTRO DE PESQUISA (dentro da nave) ---------- */
// Recursos do planeta vendidos para a nave: moedas + pontos de pesquisa (1 ponto por moeda).
const PESQUISA = { semente: 15, minerio: 35, peca: 40, cristal: 100, fossil: 100 };
const PESQUISA_PONTOS_POR_MOEDA = 1;

/* ---------- INVASÃO DE TERRENO e SEGURANÇA ---------- */
// Ficar 15 min no terreno de outra pessoa leva 5% das moedas dela (ou 1 item simples).
// Terreno de quem sumiu há 7 dias fica livre para ser registrado de novo (perde a construção).
const INVASAO_MINUTOS = 15, INVASAO_PORCENTO = 5, INVASAO_INTERVALO_HORAS = 24, ABANDONO_DIAS = 7;
const ABA_INVASOES = 'Invasoes', ABA_SEGURANCA = 'Seguranca', SEGURANCA_HORAS = 24;
const ITENS_INVADIVEIS = ['sucata', 'parafusos', 'garrafa', 'relogio', 'radio_velho', 'moeda_antiga', 'semente', 'minerio', 'fossil', 'comida', 'racao', 'refeicao', 'bone', 'calca', 'chapeu', 'colete', 'vestido'];

/* ---------- MISSÃO: consertar a nave (ganha moedas com o site aberto) ---------- */
// Conserto: paga a cada 15 segundos (o site manda 1 sinal por minuto = 4 pagamentos de 15 s)
const TICKS_POR_MINUTO = 4;
const CONSERTO_MOEDAS_SEM_CAIXA = 1, CONSERTO_MOEDAS_COM_CAIXA = 2;   // moedas a cada 15 s
const CONSERTO_PONTOS = 1, CONSERTO_PONTOS_MECANICO_CAIXA = 3;       // pontos da nave a cada 15 s
const TURNO_MINUTOS = 60;       // depois de 1 hora seguida trabalhando, cansa
const DESCANSO_EM_CASA = 5;     // quem tem casa (dono ou aluguel) e descansa em casa: 5 minutos
const DESCANSO_COM_BASE = 10;   // quem tem casa mas fica fora (minerando, explorando): 10 minutos
const DESCANSO_SEM_BASE = 20;   // quem não tem casa descansa 20 minutos na nave
// Lucas 14/11: ao chegar no cansaço máximo, chance de ficar doente (bem alimentado = chance menor)
const DOENCA_CHANCE = 0.40, DOENCA_CHANCE_ALIMENTADO = 0.10;
// Médico acompanhante: o médico de plantão acompanha alguém por 1 hora (grátis para o paciente);
// o paciente não cansa nem adoece, e a nave paga o médico por minuto trabalhado do paciente.
const ACOMPANHA_MINUTOS = 60, ACOMPANHA_MOEDAS_HORA = 60, ACOMPANHA_MAX = 4, ACOMPANHA_PEDIDO_MIN = 10;
const BOOST_MINUTOS = 30;       // curado pelo médico do cansaço: trabalha 30 minutos direto sem cansar
const GUARDA_MOEDAS_MIN = 3, GUARDA_BONUS_HORA = 70; // guarda: 3 moedas por minuto online + 70 a cada hora completa (o tempo do dia soma até a meia-noite)
const GUARDAS_MAX = 5, MEDICOS_ONLINE_MAX = 6;
const LIMITE_MINUTOS_DIA = 1440; // sem limite por dia (o descanso já segura)
// Gás de oxigênio: sem gás o sobrevivente fica doente e não trabalha nem minera.
const GAS_PRECO = 30;           // moedas; enche o tanque
const AR_MAX = 1440;            // o tanque cheio dura 24 horas parado; trabalhando gasta o dobro
const GAS_GRATIS_NO_CADASTRO = true; // quem acorda ganha o primeiro tanque cheio
// Comida: precisa comer a cada 4 horas de trabalho; quem passa disso fica doente
const FOME_LIMITE = 240;
const DOENTE_MINUTOS = 60;      // doente fica 1 hora sem trabalhar (ou chama um médico)
const RACAO_PRECO = 20;         // ração da nave, para ninguém ficar sem comida
// META DA NAVE: todo mundo consertando junto
const META_NAVE = 1000000, ETAPA_NAVE = 50000;
// Lucas 14/11: metas curtas dentro de cada etapa de 50 mil; a última (50 mil) é a meta grande.
// Ao bater a meta grande da etapa 1, o plano é expandir o mapa e criar mais terrenos.
const METAS_PARTES = [2000, 5000, 10000, 18000, 30000, 50000];
const METAS_NOMES = [
  ['Estabilizar o oxigênio da área de hibernação', 'Religar as luzes dos corredores', 'Consertar o rádio de longo alcance', 'Abrir o hangar e ligar o scanner do planeta', 'Ligar o reator auxiliar', 'Reativar o motor principal'],
  ['Limpar os filtros de ar', 'Consertar os elevadores da nave', 'Recalibrar os sensores externos', 'Reforçar o casco', 'Reabrir a estufa da nave', 'Ligar o escudo da nave']
];
function metaNome_(etapa, i) { const l = METAS_NOMES[etapa - 1]; return l ? l[i] : 'Reparo ' + (i + 1) + ' da etapa ' + etapa; }
function metasNave_(pontos) {
  const etapa = Math.floor(pontos / ETAPA_NAVE) + 1, base = (etapa - 1) * ETAPA_NAVE, feitas = [];
  let proxima = null;
  METAS_PARTES.forEach(function (p, i) {
    const alvo = base + p * ETAPA_NAVE / 50000, nome = metaNome_(etapa, i);
    if (pontos >= alvo) feitas.push(nome); else if (!proxima) proxima = { nome: nome, alvo: alvo, desde: i ? base + METAS_PARTES[i - 1] * ETAPA_NAVE / 50000 : base, grande: i === METAS_PARTES.length - 1 };
  });
  return { etapa: etapa, feitas: feitas, proxima: proxima };
}
// PROFISSÕES
const FUNCOES = {
  mecanico:     { nome: 'Mecânico(a)', desc: 'O melhor para consertar a nave. Ganha: 1 moeda a cada 15 s consertando (2 com caixa de ferramentas) e, com a caixa, vale 3 pontos da nave a cada 15 s (os outros fazem 1).' },
  engenheiro:   { nome: 'Engenheiro(a)', desc: 'Constrói as casas e prédios e instala outdoors. Ganha: a mão de obra que o dono paga (+1.000 por casa, +3.000 por prédio, +100 por outdoor), e conserta a nave como todo mundo enquanto não tem obra. A própria casa ele constrói sem pagar mão de obra.' },
  agricultor:   { nome: 'Agricultor(a) e cozinheiro(a)', desc: 'Produz comida para a colônia. Ganha: 1 comida a cada 10 minutos cultivando, que você vende no mercado dos sobreviventes pelo preço que quiser (todo mundo precisa comer). Sem limite de vagas.' },
  minerador:    { nome: 'Minerador(a)', desc: 'Especialista em mineração. Ganha: minera na borda pedregosa do mapa com metade da espera (precisa de picareta) e vende o que achar. Também conserta a nave.' },
  explorador:   { nome: 'Explorador(a)', desc: 'Descobre o planeta. Ganha: vê o sinal das torres escondidas, desbloqueia torres 2x mais rápido (chance de virar dono de clã) e conserta a nave.' },
  medico:       { nome: 'Médico(a)', desc: 'Cura na hora quem ficou doente ou cansado (e o cansado ganha 30 minutos trabalhando direto). Ganha: o preço da consulta que você escolher (mínimo 50). Também acompanha até 4 pessoas por 1 hora enquanto elas trabalham (elas não cansam nem adoecem) e a nave paga 60 moedas por hora por paciente. Precisa ficar de plantão. Até 6 médicos de plantão ao mesmo tempo. Não conserta a nave.' },
  guarda:       { nome: 'Guarda', desc: 'Cuida do rádio e dos outdoors. Ganha: 3 moedas por minuto com o site aberto, +70 a cada hora completa (o tempo do dia soma até a meia-noite) e +20 por cada flagra. Máximo de 5 guardas.' },
  desempregado: { nome: 'Desempregado(a)', desc: 'Sem emprego fixo. Não ganha consertando, mas não gasta ar nem sente fome (não fica doente). Ganha vendendo coisas e fazendo bicos para os outros.' },
  livre:        { nome: 'Profissão livre', desc: 'Faz de tudo um pouco. Ganha: 1 moeda a cada 15 s consertando a nave (2 com caixa de ferramentas) e pode vender o que achar no mapa e nos baús.' }
};
const MAPA_PROFISSAO = { 'Mecânica(o)': 'mecanico', 'Engenheira(o)': 'engenheiro', 'Agricultor(a)': 'agricultor', 'Cozinheira(o)': 'agricultor',
  'Minerador(a)': 'minerador', 'Explorador(a)': 'explorador', 'Médica(o)': 'medico', 'Guarda': 'guarda', 'Desempregado(a)': 'desempregado' };
const TROCA_FUNCAO_DIAS = 1;        // Lucas 14/11: a profissão dura 1 dia; depois pode trocar
const KIT_TEMPORARIO_HORAS = 24; // quem acorda ganha um kit de ferramentas temporário; depois precisa comprar o kit
const VAGAS = {};               // (antigo: vagas por número de sobreviventes)
const VAGAS_MAX = { guarda: GUARDAS_MAX }; // número máximo de pessoas na profissão
const MEDICO_MIN = 50;          // preço mínimo da consulta
const PLANTAO_SEGUNDOS = 180;   // conta como online quem mandou sinal nos últimos 3 minutos
// OBRAS: casa precisa de engenheiro
const MAO_DE_OBRA = { base: 1000, base_grande: 3000, outdoor: 100 };
const OBRA_MINUTOS = 10;        // tempo que o engenheiro fica construindo
const OBRA_PRAZO_HORAS = 24;    // sem engenheiro até lá, a nave constrói sozinha
// Picareta: minerar fora da zona dos terrenos
const PICARETA_VELHA_USOS = 60;   // Lucas 14/11: todo mundo chega com uma picareta velha que aguenta 60 mineradas
const MINERAR_SEGUNDOS = 30;       // tempo entre uma minerada e outra
const MINERAR_CHANCE = 0.2;     // chance de achar um recurso (Lucas 14/11: era 40%)
// Mineração cansa: depois de MINERAR_LIMITE tentativas, descansa MINERAR_DESCANSO_MIN minutos (ou chama médico, que cobra MEDICO_MINERACAO_X vezes)
const MINERAR_LIMITE = 60, MINERAR_DESCANSO_MIN = 40, MEDICO_MINERACAO_X = 2;
// O que sai na mineração (quando acha algo): 80% item simples da Terra, 15% cristal, 4% peça vital da nave, 1% item raro alienígena
const MINERACAO = { terra: 0.80, cristal: 0.15, pecaNave: 0.04, raro: 0.01 };
const ITENS_TERRA = [
  { id: 'sucata', nome: 'Sucata de metal' }, { id: 'parafusos', nome: 'Parafusos velhos' }, { id: 'garrafa', nome: 'Garrafa da Terra' },
  { id: 'relogio', nome: 'Relógio quebrado' }, { id: 'radio_velho', nome: 'Rádio velho' }, { id: 'moeda_antiga', nome: 'Moeda antiga da Terra' }
];
const ITENS_ALIEN = [{ id: 'espada_alien', nome: 'Espada alienígena' }, { id: 'armadura_alien', nome: 'Armadura alienígena' }];
const PECA_NAVE_PONTOS_MIN = 30, PECA_NAVE_PONTOS_MAX = 50, PECA_NAVE_MOEDAS = 10; // Lucas 14/11: instalar a peça dá também umas moedas
function achados_() { return RECURSOS.concat(ITENS_TERRA, ITENS_ALIEN, [{ id: 'peca_nave', nome: 'Peça vital da nave' }]); }
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
  moedas600: { nome: '600 moedas', reais: 2, moedas: 600 },
  moedas1600: { nome: '1.600 moedas', reais: 5, moedas: 1600 },
  moedas4000: { nome: '4.000 moedas', reais: 9.99, moedas: 4000 },
  moedas20000: { nome: '20.000 moedas', reais: 47, moedas: 20000 }
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
const BAU_MOEDAS = 250;              // moedas que vêm no baú
const BAU_CHANCE_FICHA_ITEM = 0.25;  // chance de vir a ficha "Criar item"
const BAU_CHANCE_FICHA_EMPRESA = 0.05; // chance de vir a ficha "Criar empresa"
// BAÚ PEQUENO: aparece a cada 14 a 16 minutos num lugar do mapa, só com moedas
const BAUZINHO_MINUTOS = 15, BAUZINHO_VARIA_SEG = 60, BAUZINHO_MIN = 20, BAUZINHO_MAX = 70, BAUZINHO_MAX_MAPA = 2;
const CRIAR_ITEM_PRECO = 1000;        // moedas para usar a ficha de criar item
const CRIAR_EMPRESA_PRECO = 20000;    // moedas para usar a ficha de criar empresa (precisa ter terreno)

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
  { id: 'T6', nome: 'Torre do Sul', x: 440, y: 512 },
  { id: 'T7', nome: 'Torre Ametista', x: 64, y: 286 }
];
const TORRE_META = 10000, TORRE_PONTOS_EXTRA = 500, TORRE_RAIO = 40;
const TORRE_PRECO = 3000, TORRE_PRECO_MIN = 2400, TORRE_DESCONTO = 10, TORRE_PRAZO_HORAS = 12;
const CLA_ENTRADA_PADRAO = 100;      // preço para entrar no clã (o dono muda)
const TAXA_CLA = 0.10;               // 10% da entrada no clã fica com a colônia
// GUARDAS: silenciam no rádio; quem foi silenciado pode reclamar.
// Você decide na aba Silenciados: escreva "certo" ou "abuso" na coluna decisao.
const SILENCIO_MINUTOS = 5, GUARDA_BONUS = 20;
// RÁDIO: proteção automática contra ofensas e flood
const CHAT_MAX_POR_MINUTO = 8;       // mais que isso em 1 minuto é bloqueado
const CHAT_OFENSAS_PARA_SILENCIAR = 3; // 3 mensagens ofensivas bloqueadas = silenciado automático
const CHAT_SILENCIO_AUTO_MIN = 10;
const CHAT_OFENSA_VISIVEL_SEG = 120; // mensagem ofensiva fica no rádio por 2 min para um guarda pegar; depois some sozinha
// Palavras bloqueadas no rádio (sem acento, minúsculas). Pode acrescentar ou tirar à vontade.
const PALAVRAS_PROIBIDAS = ['porra', 'caralho', 'krl', 'crl', 'merda', 'puta', 'puto', 'putaria', 'fdp', 'pqp', 'cu', 'cuzao', 'buceta', 'boceta',
  'xoxota', 'xereca', 'viado', 'bicha', 'sapatao', 'traveco', 'arrombado', 'arrombada', 'otario', 'otaria', 'idiota', 'imbecil', 'babaca',
  'cretino', 'cretina', 'retardado', 'retardada', 'mongol', 'vagabundo', 'vagabunda', 'vadia', 'corno', 'corna', 'desgracado', 'desgracada',
  'foda', 'fodase', 'foder', 'fuder', 'fudido', 'fudida', 'punheta', 'pica', 'vsf', 'vtnc', 'tnc', 'escroto', 'escrota', 'nojento', 'nojenta', 'lixo humano'];
// LEILÃO DO VÍDEO: quem der o maior lance tem o @ divulgado no vídeo.
// Quem é superado recebe as moedas de volta na hora. Fecha todo dia às LEILAO_HORA (horário de Brasília).
// O vencedor escreve a frase do que quer divulgar; aparece no e-mail diário e na aba Leiloes.
const LEILAO_HORA = 20, LEILAO_MINIMO = 50, LEILAO_AUMENTO = 10;
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
  { id: 'outdoor_guardado', cat: 'Residência', nome: 'Outdoor desmontado', preco: 300, oculto: true,
    desc: 'Um outdoor guardado no inventário. Monte de novo num terreno sem construção (Mercado → IMÓVEIS) ou venda para outro sobrevivente.' },
  { id: 'gas', cat: 'Oxigênio e comida', nome: 'Gás de oxigênio', preco: GAS_PRECO, gas: true,
    desc: 'Enche o seu tanque de ar: dura 24 horas parado ou 12 horas trabalhando. Sem ar o seu sobrevivente fica doente.' },
  { id: 'racao', cat: 'Oxigênio e comida', nome: 'Ração da nave', preco: RACAO_PRECO, consumivel: true, comida: FOME_LIMITE,
    desc: 'Sacia a fome por 4 horas de trabalho. A comida dos agricultores costuma sair mais barata no mercado dos sobreviventes.' },
  { id: 'bone', cat: 'Roupas', nome: 'Boné', preco: 15, slot: 'cabeca', desc: 'Um boné vermelho.' },
  { id: 'calca', cat: 'Roupas', nome: 'Calça jeans', preco: 50, slot: 'pernas', desc: 'Calça azul por cima do traje.' },
  { id: 'chapeu', cat: 'Roupas', nome: 'Chapéu', preco: 40, slot: 'cabeca', desc: 'Chapéu de explorador.' },
  { id: 'colete', cat: 'Roupas', nome: 'Colete', preco: 80, slot: 'tronco', desc: 'Colete de couro por cima do traje.' },
  { id: 'vestido', cat: 'Roupas', nome: 'Vestido', preco: 100, slot: 'tronco,pernas', desc: 'Vestido vermelho.' },
  { id: 'capacete_dourado', cat: 'Roupa dourada', nome: 'Capacete dourado', preco: 1200, slot: 'capacete', desc: 'Capacete de ouro que todo mundo vê no mapa.' },
  { id: 'bota_dourada', cat: 'Roupa dourada', nome: 'Bota dourada', preco: 1000, slot: 'pes', desc: 'Botas de ouro.' },
  { id: 'calca_dourada', cat: 'Roupa dourada', nome: 'Calça dourada', preco: 1800, slot: 'pernas', desc: 'Calça de ouro.' },
  { id: 'blusa_dourada', cat: 'Roupa dourada', nome: 'Blusa dourada', preco: 2000, slot: 'tronco', desc: 'Blusa de ouro.' },
  { id: 'mochila', cat: 'Acessórios', nome: 'Mochila de oxigênio', preco: 150, slot: 'costas', desc: 'Tanque extra de ar: com ela o seu ar dura o dobro (48 horas parado, 24 horas trabalhando) e você gasta menos gás. Aparece nas costas do bonequinho.' },
  { id: 'picareta', cat: 'Ferramentas', nome: 'Picareta', preco: 300,
    desc: 'Leve o seu bonequinho para fora da zona dos terrenos (a borda pedregosa do mapa) e minere. Dá para achar recursos e, às vezes, itens especiais.' },
  { id: 'ferramentas', cat: 'Ferramentas', nome: 'Caixa de ferramentas', preco: 150, dias: FERRAMENTA_DIAS, coluna: C_CAIXA_ATE,
    desc: 'Vale 7 dias. Com ela você ganha o dobro consertando a nave (2 moedas a cada 15 s) e o mecânico vale 3 pontos. Quem acorda ganha uma caixa emprestada por 1 dia.' },
  { id: 'vassoura', cat: 'Ferramentas', nome: 'Vassoura', preco: 150, dias: FERRAMENTA_DIAS, coluna: C_VASSOURA_ATE,
    desc: 'Vale 7 dias. Limpar a torre do clã com a vassoura dá o dobro de pontos.' },
  { id: 'ticket_assembleia', cat: 'Assembleia', nome: 'Ticket da Assembleia', preco: 0, oculto: true,
    desc: 'Use para entrar na Assembleia do dia (comentar e votar nas pautas) ou para mandar uma ideia direto para a história. Dá para vender para outros sobreviventes.' },
  { id: 'ticket_pauta', cat: 'Assembleia', nome: 'Ticket de Pauta', preco: 0, oculto: true,
    desc: 'Raro! Use para criar uma pauta na Assembleia (com enquete) ou para mandar uma ideia direto para a história. Dá para vender para outros sobreviventes.' },
  { id: 'jaqueta_orion', cat: 'Roupas', nome: 'Jaqueta Orion', preco: 0, oculto: true, slot: 'tronco', desc: 'Roupa exclusiva da oferta de boas-vindas. Ninguém consegue no Mercado da nave.' },
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
// ZERAR O JOGO (usar só antes do lançamento): apaga todos os sobreviventes, terrenos, casas, mercado, rádio, Assembleia etc.
// Mantém só os cabeçalhos das abas e a aba Pedidos (registro dos pagamentos reais).
// FAÇA ANTES UMA CÓPIA DA PLANILHA (Arquivo > Fazer uma cópia). No editor: escolha resetarJogo e clique em Executar.
function resetarJogo() {
  const ss = planilha_();
  ss.getSheets().forEach(function (aba) {
    if (aba.getName() === ABA_PEDIDOS) return;
    const n = aba.getLastRow();
    if (n > 1) aba.deleteRows(2, n - 1);
  });
  const props = PropertiesService.getScriptProperties(), todas = props.getProperties();
  Object.keys(todas).forEach(function (k) { if (k !== 'PLANILHA_ID') props.deleteProperty(k); });
  try { CacheService.getScriptCache().removeAll(['lista']); } catch (e) { /* segue */ }
  setup();
  Logger.log('Jogo zerado. Pode publicar e começar do zero.');
}

function setup() {
  const ss = planilha_();
  colunas_(garantirAba_(ss, ABA_SOBREVIVENTES), ['numero', 'data', 'nome', 'instagram', 'profissao', 'historia', 'visual', 'moedas', 'chave', 'itens', 'banido', 'online_dia', 'online_minutos', 'online_ultimo', 'turno_minutos', 'progresso_moeda', 'descanso_ate', 'reconhecimento', 'outdoor', 'vestindo', 'gas_dia', 'objetivo', 'amigos', 'minerou', 'outdoor_preco', 'anuncio', 'anuncio_autor', 'anuncio_ate', 'funcao', 'funcao_desde', 'pontos', 'pontos_semana', 'fome_min', 'doente_ate', 'ar_min', 'ar_quando', 'plantao', 'preco_consulta', 'extra', 'cla', 'silenciado_ate', 'outdoor_oferta', 'anuncio_oferta', 'guarda_dia', 'boost_ate', 'oferta_boas_vindas_ate', 'caixa_ate', 'seguranca_preco', 'invasao', 'visto', 'pesquisa', 'titulo', 'checkin', 'vassoura_ate', 'mineracao', 'apoiador', 'conserto_dia', 'email', 'email_enviado_dia', 'picareta_velha_usos', 'rede']);
  colunas_(garantirAba_(ss, ABA_INVASOES), ['data', 'lote', 'invasor_numero', 'invasor', 'dono_numero', 'dono', 'levou']);
  colunas_(garantirAba_(ss, ABA_SEGURANCA), ['data', 'dono_numero', 'dono', 'guarda_numero', 'guarda', 'preco', 'ate']);
  colunas_(garantirAba_(ss, ABA_IDEIAS), ['data', 'autor', 'tipo', 'texto', 'id', 'numero', 'gostei']);
  colunas_(garantirAba_(ss, ABA_TERRENOS), ['codigo', 'data', 'nome_do_lugar', 'dono', 'instagram', 'plano', 'valor', 'status', 'ref', 'aluguel_semana', 'dono_numero', 'item']);
  colunas_(garantirAba_(ss, ABA_PEDIDOS), ['codigo', 'data', 'numero', 'nome', 'pacote', 'reais', 'moedas', 'status', 'ref']);
  colunas_(garantirAba_(ss, ABA_COMPRAS), ['data', 'numero', 'nome', 'item', 'preco_moedas']);
  colunas_(garantirAba_(ss, ABA_CHAT), ['data', 'numero', 'nome', 'texto', 'status']);
  colunas_(garantirAba_(ss, ABA_AVISOS), ['data', 'numero', 'texto']);
  colunas_(garantirAba_(ss, ABA_PAUTAS), ['id', 'data', 'dia', 'autor_numero', 'autor', 'titulo', 'texto', 'opcoes', 'virou_video']);
  colunas_(garantirAba_(ss, ABA_ASSEMBLEIA), ['data', 'pauta', 'numero', 'nome', 'texto']);
  colunas_(garantirAba_(ss, ABA_VOTOS), ['data', 'pauta', 'numero', 'opcao']);
  colunas_(garantirAba_(ss, ABA_ENTRADAS), ['dia', 'numero', 'como']);
  ticketsIniciais_(ss);
  colunas_(garantirAba_(ss, ABA_OBRAS), ['id', 'data', 'dono_numero', 'dono', 'item', 'nome_da_casa', 'mao_de_obra', 'status', 'engenheiro_numero', 'engenheiro', 'progresso', 'ultimo_sinal']);
  colunas_(garantirAba_(ss, ABA_ACOMPANHA), ['id', 'data', 'medico_numero', 'medico', 'paciente_numero', 'paciente', 'status', 'inicio', 'ate', 'moedas_pagas']);
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
  if (p.sairemail) return ContentService.createTextOutput(sairEmail_(p.sairemail, p.t));
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
  const engOnline = todas.filter(function (l) { return funcaoDe_(l) === 'engenheiro' && agoraGet - (Number(l[C_PLANTAO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000; });
  const engenheiros = engOnline.length;
  const obrasTodas = ss.getSheetByName(ABA_OBRAS) ? linhasObras_(ss) : [];
  const engenheirosLista = engOnline.map(function (l) { return { numero: l[0], nome: String(l[2]), ocupado: obrasTodas.some(function (o) { return o.eng === String(l[0]) && o.status === 'em obra'; }) }; });
  const contagem = {}; todas.forEach(function (l) { const f = funcaoDe_(l); contagem[f] = (contagem[f] || 0) + 1; });
  const funcoes = Object.keys(FUNCOES).map(function (k) { return { id: k, nome: FUNCOES[k].nome, desc: FUNCOES[k].desc, pessoas: contagem[k] || 0, vagas: VAGAS_MAX[k] || 0 }; });
  const outdoors = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return tem_(String(l[C_ITENS - 1] || ''), 'outdoor'); }).map(outdoorDe_);
  const mercado = {
    pacotes: Object.keys(PACOTES).map(function (k) { return { id: k, nome: PACOTES[k].nome, reais: PACOTES[k].reais, moedas: PACOTES[k].moedas }; }),
    missao: { porMoeda: 1, moedasSemCaixa: CONSERTO_MOEDAS_SEM_CAIXA, moedasComCaixa: CONSERTO_MOEDAS_COM_CAIXA, turno: TURNO_MINUTOS, descansoCasa: DESCANSO_EM_CASA, descansoBase: DESCANSO_COM_BASE, descansoSemBase: DESCANSO_SEM_BASE, boost: BOOST_MINUTOS, limite: LIMITE_MINUTOS_DIA },
    minerar: { segundos: MINERAR_SEGUNDOS }, vida: { arMax: AR_MAX, fomeLimite: FOME_LIMITE, doente: DOENTE_MINUTOS, medicoMin: MEDICO_MIN, trocaDias: TROCA_FUNCAO_DIAS, obraMinutos: OBRA_MINUTOS, obraPrazo: OBRA_PRAZO_HORAS, maoDeObra: MAO_DE_OBRA }, aluguelDias: ALUGUEL_DIAS, ideiaPrecisaBase: IDEIA_PRECISA_BASE, anuncioHoras: ANUNCIO_HORAS,
    taxas: { anuncio: TAXA_ANUNCIO, aluguel: TAXA_ALUGUEL, terreno: TAXA_TERRENO, cla: TAXA_CLA },
    torre: { meta: TORRE_META, raio: TORRE_RAIO, preco: TORRE_PRECO, precoMin: TORRE_PRECO_MIN, prazo: TORRE_PRAZO_HORAS, extra: TORRE_PONTOS_EXTRA },
    criar: { item: CRIAR_ITEM_PRECO, empresa: CRIAR_EMPRESA_PRECO }, silencioMin: SILENCIO_MINUTOS,
    itens: ITENS.map(function (i) { return { id: i.id, cat: i.cat, oculto: !!i.oculto, nome: i.nome, preco: i.preco, desc: i.desc, base: !!i.base, terreno: !!(i.base || i.terreno), fixo: !!(i.base || i.fixo || i.gas || i.consumivel), gas: !!i.gas, consumivel: !!i.consumivel, maoDeObra: MAO_DE_OBRA[i.id] || 0, slot: i.slot || '', vagas: i.vagas || 0 }; }),
    recursos: achados_(),
    cofre: Number(PropertiesService.getScriptProperties().getProperty('COFRE')) || 0,
    terrenos: { x0: LOTE_X0, y0: LOTE_Y0, l: LOTE_L, a: LOTE_A, colunas: LOTE_COLUNAS, linhas: LOTE_LINHAS, nave: LOTES_DA_NAVE, preco: TERRENO_PRECO, minutos: TERRENO_MINUTOS, porPessoa: TERRENOS_POR_PESSOA }
  };
  const ofertas = linhas_(ss.getSheetByName(ABA_OFERTAS)).filter(function (l) { return l[6] === 'aberta'; }).slice(-100).reverse().map(function (l) {
    return { id: l[0], vendedor: l[3], item: l[4], preco: l[5], qtd: qtdOferta_(l), nomeItem: /^reliquia_/.test(String(l[4])) ? nomeReliquia_(ss, String(l[4])) : undefined };
  });
  const b = bauDeHoje_(), aberto = PropertiesService.getScriptProperties().getProperty('BAU_' + b.dia);
  const bau = { dia: b.dia, hora: b.hora, aparece: b.aparece, x: Date.now() >= b.aparece ? b.x : null, y: Date.now() >= b.aparece ? b.y : null, abertoPor: aberto ? JSON.parse(aberto).nome : '' };
  const resposta = { ok: true, bauzinhos: bauzinhos_().lista, total: sobreviventes.length, sobreviventes: sobreviventes.slice(-600), ideias: ideias, terrenos: terrenos, mercado: mercado, chat: true, alugueis: alugueis, outdoors: outdoors,
    nave: { pontos: pontosNave, meta: META_NAVE, etapa: ETAPA_NAVE, metas: metasNave_(pontosNave) }, ranking: rankings_(todas), medicos: medicos, engenheirosOnline: engenheiros, engenheiros: engenheirosLista, lider: LIDER_NOME, guardas: guardasSeguranca_(todas), titulos: TITULOS, checkinMoedas: CHECKIN_MOEDAS, pesquisa: { precos: PESQUISA, pontosPorMoeda: PESQUISA_PONTOS_POR_MOEDA, total: Number(PropertiesService.getScriptProperties().getProperty('PESQUISA_TOTAL')) || 0, ranking: todas.map(function (l) { return { nome: String(l[2]), pontos: Number(l[C_PESQUISA - 1]) || 0 }; }).filter(function (x) { return x.pontos > 0; }).sort(function (a, b) { return b.pontos - a.pontos; }).slice(0, 10) },
    obras: ss.getSheetByName(ABA_OBRAS) ? obrasAbertas_(ss) : [], funcoes: funcoes,
    obrasMapa: ss.getSheetByName(ABA_OBRAS) ? linhasObras_(ss).filter(function (o) { return (o.status === 'aguardando' || o.status === 'em obra') && o.item !== 'outdoor'; })
      .map(function (o) { return { dono: o.donoNome, item: o.item, status: o.status, progresso: o.progresso, total: OBRA_MINUTOS, eng: o.engNome }; }) : [],
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
      reconhecer: reconhecer_, registrar_terreno: registrarTerreno_, outdoor: trocarOutdoor_, outdoor_preco: precoOutdoor_, tirar_outdoor: tirarOutdoor_, anunciar: anunciar_, outdoor_oferta: outdoorOferta_,
      curtir: curtir_, trabalhar: trabalhar_, comer: comer_, funcao: trocarFuncao_, plantao: plantao_, chamar_medico: chamarMedico_, acompanhar: acompanhar_, responder_acompanhamento: responderAcompanhamento_, assembleia: assembleia_, entrar_assembleia: entrarAssembleia_, criar_pauta: criarPauta_, falar_assembleia: falarAssembleia_, votar: votar_, oferta: ativarOferta_, descansar_casa: descansarEmCasa_, usar_peca: usarPecaNave_, invadir: invadir_, email: mudarEmail_, pesquisar: pesquisar_, titulo: pegarTitulo_, checkin: checkin_, seguranca_preco: precoSeguranca_, contratar_seguranca: contratarSeguranca_, chamar_engenheiro: chamarEngenheiro_, aceitar_obra: aceitarObra_, vestir: vestir_, minerar: minerar_, aluguel_preco: precoAluguel_, alugar: alugar_, amigo: amigo_, objetivo: mudarObjetivo_,
      descobrir_torre: descobrirTorre_, torre_responder: responderTorre_, cla_preco: precoCla_, entrar_cla: entrarCla_, sair_cla: sairCla_,
      silenciar: silenciar_, censurar_outdoor: censurarOutdoor_, reclamar: reclamar_, criar: criar_, lance: lance_, leilao_frase: fraseLeilao_, bauzinho: abrirBauzinho_ };
    const f = acoes[dados.acao];
    const r = f ? f(ss, dados) : { ok: false, erro: 'Ação desconhecida.' };
    if (r.ok && ['perfil', 'entrar', 'chat', 'consertar', 'trabalhar', 'plantao', 'reconhecer', 'amigo', 'objetivo', 'assembleia', 'entrar_assembleia', 'falar_assembleia', 'votar', 'checkin', 'invadir', 'descansar_casa', 'minerar', 'oferta', 'pesquisar'].indexOf(dados.acao) < 0) CacheService.getScriptCache().remove('lista');
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
  const email = emailValido_(d.email);
  if (d.email && String(d.email).trim() && !email) return { ok: false, erro: 'Esse e-mail não parece certo.' };
  if (email && !d.aceitaEmail) return { ok: false, erro: 'Marque a caixinha para aceitar receber avisos por e-mail (ou deixe o e-mail em branco).' };

  if (nome.length < 2) return { ok: false, erro: 'Escolha um nome com pelo menos 2 letras.' };
  if (!profissao) return { ok: false, erro: 'Escolha uma profissão.' };
  // Lucas 14/11: o jogador escolhe se veio do Instagram ou do TikTok
  const rede = String(d.rede || 'instagram').toLowerCase() === 'tiktok' ? 'tiktok' : 'instagram', nomeRede = rede === 'tiktok' ? 'TikTok' : 'Instagram';
  if (INSTAGRAM_OBRIGATORIO && !instagram) return { ok: false, erro: 'Coloque o seu @ do ' + nomeRede + ': cada @ acorda um sobrevivente.' };
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) return { ok: false, erro: 'Esse @ do ' + nomeRede + ' não parece certo.' };

  const aba = ss.getSheetByName(ABA_SOBREVIVENTES);
  const existentes = linhas_(aba);
  const nomeMin = nome.toLowerCase();
  if (existentes.some(function (l) { return String(l[2]).toLowerCase() === nomeMin; })) {
    return { ok: false, erro: 'Já existe um sobrevivente chamado ' + nome + '. Tente outro nome.' };
  }
  if (instagram && existentes.some(function (l) { return String(l[3]).toLowerCase() === '@' + instagram.toLowerCase() && (String(l[C_REDE - 1] || 'instagram') === rede); })) {
    return { ok: false, erro: 'Esse @ já tem um sobrevivente na colônia.' };
  }

  const numero = existentes.length ? Math.max.apply(null, existentes.map(function (l) { return Number(l[0]) || 0; })) + 1 : 1;
  const chave = gerarChave_();
  const linha = [numero, new Date(), texto_(nome), instagram ? texto_('@' + instagram) : '', texto_(profissao), texto_(historia), texto_(visual), 0, chave, ticketsTexto_(), ''];
  while (linha.length < C_EXTRA) linha.push('');
  if (GAS_GRATIS_NO_CADASTRO) { linha[C_AR - 1] = AR_MAX; linha[C_AR_TS - 1] = Date.now(); }
  linha[C_FUNCAO - 1] = MAPA_PROFISSAO[d.profissao] || (d.funcao && FUNCOES[d.funcao] ? d.funcao : 'livre');
  const fv = linha[C_FUNCAO - 1];
  if (VAGAS_MAX[fv] && existentes.filter(function (l) { return funcaoDe_(l) === fv; }).length >= VAGAS_MAX[fv])
    return { ok: false, erro: 'Não há vagas de ' + FUNCOES[fv].nome + ' agora. Escolha outra profissão (dá para trocar depois).' };
  linha[C_FUNCAO_DATA - 1] = Date.now();
  linha[C_OBJETIVO - 1] = texto_(objetivo);
  if (email) { while (linha.length < C_EMAIL) linha.push(''); linha[C_EMAIL - 1] = email; }
  if (rede !== 'instagram') { while (linha.length < C_REDE) linha.push(''); linha[C_REDE - 1] = rede; }
  aba.appendRow(linha);
  return { ok: true, numero: numero, chave: chave, moedas: 0, itens: ticketsTexto_(), gas: GAS_GRATIS_NO_CADASTRO, objetivo: objetivo };
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
  return { ok: true, numero: l[0], nome: l[2], instagram: l[3], rede: String(l[C_REDE - 1] || 'instagram'), profissao: l[4], visual: String(l[6] || ''),
    moedas: Number(l[C_MOEDAS - 1]) || 0, itens: String(l[C_ITENS - 1] || ''), chave: String(l[C_CHAVE - 1]), outdoor: String(l[C_OUTDOOR - 1] || ''), veste: vesteDe_(l), gas: temGas_(l), ar: arDe_(l), fome: Number(l[C_FOME - 1]) || 0, doenteAte: Number(l[C_DOENTE_ATE - 1]) || 0,
    kitAte: kitAte_(l), funcao: funcaoDe_(l), funcaoDesde: Number(l[C_FUNCAO_DATA - 1]) || 0, pontos: Number(l[C_PONTOS - 1]) || 0, precoConsulta: Number(l[C_MEDICO_PRECO - 1]) || MEDICO_MIN,
    objetivo: String(l[C_OBJETIVO - 1] || ''), cla: String(l[C_CLA - 1] || ''), mudoAte: Number(l[C_MUDO_ATE - 1]) || 0,
    amigos: String(l[C_AMIGOS - 1] || ''), mineracaoAte: mineracaoDe_(l).ate, picaretaVelha: picaretaVelha_(l), descansoAte: Number(l[C_DESCANSO - 1]) || 0, boostAte: Number(l[C_BOOST_ATE - 1]) || 0, ofertaAte: Number(l[C_OFERTA_ATE - 1]) || 0 };
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
  p.avisos = avisosDe_(ss, p.numero);
  if (Date.now() - (Number(s.dados[C_VISTO - 1]) || 0) > 5 * 60000) s.aba.getRange(s.linha, C_VISTO).setValue(Date.now());
  const seg = segurancaDe_(ss, p.numero); p.segurancaAte = seg ? seg.ate : 0; p.segurancaGuarda = seg ? seg.guarda : '';
  p.precoSeguranca = Number(s.dados[C_SEG_PRECO - 1]) || 0;
  p.pesquisa = Number(s.dados[C_PESQUISA - 1]) || 0;
  const ultimoMin = Number(s.dados[C_ON_DIA - 1]) || 0, agoraP = Date.now();
  if (agoraP - ultimoMin >= 55000) { // soma o tempo online (o site pede o perfil a cada 3 minutos)
    const gap = agoraP - ultimoMin, minutos = (Number(s.dados[C_ON_MIN - 1]) || 0) + (gap < 6 * 60000 ? Math.round(gap / 60000) : 0);
    s.aba.getRange(s.linha, C_ON_DIA).setValue(agoraP); s.aba.getRange(s.linha, C_ON_MIN).setValue(minutos); s.dados[C_ON_MIN - 1] = minutos;
  }
  p.horasOnline = Math.floor((Number(s.dados[C_ON_MIN - 1]) || 0) / 60); p.assembleias = assembleiasDe_(ss, p.numero);
  p.titulo = String(s.dados[C_TITULO - 1] || '');
  const ac = acompanhamentoDe_(ss, p.numero, Date.now()); p.acompanhadoAte = ac.ativo ? ac.ativo.ate : 0; p.acompanhadoPor = ac.ativo ? ac.ativo.medNome : ''; p.pedidosAcompanhamento = ac.pedidos; p.pacientes = ac.pacientes;
  p.email = String(s.dados[C_EMAIL - 1] || ''); p.vassouraAte = Number(s.dados[C_VASSOURA_ATE - 1]) || 0; p.checkin = checkinEstado_(s.dados); p.reliquias = nomesReliquias_(ss, p.itens);
  return p;
}

function ideia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente para mandar ideias.' };
  const texto = limpar_(d.texto, 500);
  if (texto.length < 3) return { ok: false, erro: 'Escreva sua ideia antes de enviar.' };
  const residente = temCasa_(String(s.dados[C_ITENS - 1] || '')) || !!moradiaAlugada_(ss, s.dados[0]);
  let gastou = '';
  if (IDEIA_PRECISA_BASE && !residente) {
    const lista = String(s.dados[C_ITENS - 1] || '').split(',').filter(String);
    gastou = lista.indexOf('ticket_assembleia') >= 0 ? 'ticket_assembleia' : lista.indexOf('ticket_pauta') >= 0 ? 'ticket_pauta' : '';
    if (!gastou) return { ok: false, erro: 'Para mandar uma ideia você precisa de 1 ticket da Assembleia (ou ter casa própria ou alugada). Tickets saem nos baús e no mercado entre jogadores.' };
    tirarItem_(lista, gastou); s.aba.getRange(s.linha, C_ITENS).setValue(lista.join(','));
  }
  const autor = String(s.dados[C_NOME - 1]);
  const tipo = TIPOS_IDEIA.indexOf(d.tipo) >= 0 ? d.tipo : 'outro';
  if (texto.length < 3) return { ok: false, erro: 'Escreva sua ideia antes de enviar.' };
  ss.getSheetByName(ABA_IDEIAS).appendRow([new Date(), texto_(autor), tipo, texto_(texto), 'I' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase(), s.dados[0], '']);
  const p = perfilDe_(acharSobrevivente_(ss, d)); p.gastou = gastou; return p;
}

/* ---------- Mercado: comprar moedas com Pix (InfinitePay) ---------- */
function pedirMoedas_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente antes de adquirir moedas.' };
  let pac = PACOTES[d.pacote];
  if (d.pacote === 'boasvindas') {
    const ate = Number(s.dados[C_OFERTA_ATE - 1]) || 0;
    if (ate === -1) return { ok: false, erro: 'Você já aproveitou a oferta de boas-vindas.' };
    if (ate < Date.now()) return { ok: false, erro: 'A oferta de boas-vindas já acabou.' };
    pac = { nome: 'Oferta de boas-vindas', reais: OFERTA_REAIS, moedas: OFERTA_MOEDAS };
  }
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
        if (!Number(lsS[j][C_APOIADOR - 1])) sobr.getRange(j + 2, C_APOIADOR).setValue(Date.now());
        avisoRadio_(ss, '🚀 ' + lsS[j][2] + ' trouxe suprimentos para a nave! Obrigado, Apoiador(a) da Nave!');
        if (String(ls[i][4]) === 'boasvindas') {
          sobr.getRange(j + 2, C_OFERTA_ATE).setValue(-1);
          sobr.getRange(j + 2, C_CAIXA_ATE).setValue(Math.max(Date.now(), Number(lsS[j][C_CAIXA_ATE - 1]) || 0) + OFERTA_CAIXA_DIAS * 86400000);
          const it = String(lsS[j][C_ITENS - 1] || '').split(',').filter(String); it.push(OFERTA_ROUPA);
          sobr.getRange(j + 2, C_ITENS).setValue(it.join(','));
          avisar_(ss, lsS[j][0], '🎁 Oferta de boas-vindas recebida: +' + OFERTA_MOEDAS + ' moedas, caixa de ferramentas por ' + OFERTA_CAIXA_DIAS + ' dias e a Jaqueta Orion!');
        }
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
  if (item.oculto) return { ok: false, erro: 'Esse item não é vendido na loja da nave. Procure no mercado dos sobreviventes.' };

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
  if (item.dias) { // ferramenta por tempo: soma 7 dias
    if (p.moedas < item.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + item.preco + '.' };
    const ate = Math.max(Date.now(), Number(s.dados[item.coluna - 1]) || 0) + item.dias * 86400000;
    p.moedas -= item.preco; s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas); s.aba.getRange(s.linha, item.coluna).setValue(ate);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome + ' (' + item.dias + ' dias)', item.preco]);
    if (item.id === 'ferramentas') p.kitAte = kitAte_(linhaPorNumero_(ss, p.numero).dados); else p.vassouraAte = ate;
    p.ate = ate; return p;
  }
  if (meus.indexOf(item.id) >= 0) return { ok: false, erro: 'Você já tem esse item.' };
  if (item.id === 'outdoor') { const fr = limpar_(d.lugar, 40), proib = fr && regraOutdoor_(s.dados, fr); if (proib) return proib; }
  if (item.id === 'outdoor' && meus.indexOf('outdoor_guardado') >= 0) { // monta o outdoor guardado, sem pagar de novo
    if (!meus.some(function (i) { return /^lote_/.test(i); })) return { ok: false, erro: 'Para montar o outdoor você precisa de um terreno.' };
    if (temCasa_(p.itens)) return { ok: false, erro: 'O outdoor só pode ficar num terreno sem construção. Seu terreno já tem casa.' };
    const fr = limpar_(d.lugar, 40); if (!fr) return { ok: false, erro: 'Escreva a frase do seu outdoor.' };
    tirarItem_(meus, 'outdoor_guardado'); meus.push('outdoor'); p.itens = meus.join(','); salvarPerfil_(s, p);
    s.aba.getRange(s.linha, C_OUTDOOR).setValue(texto_(fr)); p.outdoor = fr; p.montado = true;
    return p;
  }
  const obra = item.base || item.id === 'outdoor', souEng = p.funcao === 'engenheiro', mao = obra && !souEng ? (MAO_DE_OBRA[item.id] || 0) : 0; // engenheiro constrói a própria obra de graça
  if (obra && obrasDe_(ss, p.numero).length) return { ok: false, erro: 'Você já tem uma obra em andamento. Espere ela terminar.' };
  if (p.moedas < item.preco + mao) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + (item.preco + mao) + (mao ? ' (' + (item.base ? 'casa' : 'outdoor') + ' + mão de obra do engenheiro)' : '') + '.' };

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

  if (obra) { // a casa (ou o outdoor) vira uma obra: espera um engenheiro
    p.moedas -= item.preco + mao;
    s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas);
    const id = 'OB' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
    // Lucas 14/11: o engenheiro constrói a própria casa de graça (ele mesmo vira o engenheiro da obra)
    ss.getSheetByName(ABA_OBRAS).appendRow([id, new Date(), p.numero, texto_(String(p.nome)), item.id, texto_(item.base ? lugar : frase), mao, souEng ? 'em obra' : 'aguardando', souEng ? p.numero : '', souEng ? texto_(String(p.nome)) : '', 0, souEng ? Date.now() : 0]);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), item.nome + ' (obra)', item.preco + mao]);
    if (souEng) s.aba.getRange(s.linha, C_PLANTAO).setValue(Date.now());
    p.obra = souEng ? { id: id, item: item.id, status: 'em obra', progresso: 0, total: OBRA_MINUTOS, propria: true } : { id: id, item: item.id, status: 'aguardando' };
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
  if ((Number(l[C_CAIXA_ATE - 1]) || 0) > Date.now()) return true;
  const desde = new Date(l[C_DATA - 1]).getTime();
  return !isNaN(desde) && Date.now() - desde < KIT_TEMPORARIO_HORAS * 3600000;
}
function kitAte_(l) { return tem_(String(l[C_ITENS - 1] || ''), 'ferramentas') ? -1 : Math.max(new Date(l[C_DATA - 1]).getTime() + KIT_TEMPORARIO_HORAS * 3600000, Number(l[C_CAIXA_ATE - 1]) || 0); }
function estaDoente_(l) { return funcaoDe_(l) !== 'desempregado' && Number(l[C_DOENTE_ATE - 1]) > Date.now(); }
// Um minuto de trabalho. modo: consertar, vigiar, cultivar, cozinhar, construir.
function trabalhar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const l = s.dados, agora = Date.now(), cel = function (c, v) { s.aba.getRange(s.linha, c).setValue(v); };
  const modo = ['consertar', 'vigiar', 'cultivar', 'cozinhar', 'construir', 'torre'].indexOf(d.modo) >= 0 ? d.modo : 'consertar';
  const funcao = funcaoDe_(l), desemp = funcao === 'desempregado';
  const permitido = { consertar: funcao !== 'medico', vigiar: funcao === 'guarda', cultivar: funcao === 'agricultor', cozinhar: funcao === 'agricultor', construir: funcao === 'engenheiro', torre: true };
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

  // médico acompanhante: só vale enquanto o médico está de plantão
  const acomp = !desemp ? acompanhamentoDe_(ss, l[0], agora) : { ativo: null, pedidos: [], pacientes: [] };
  let acompMed = null;
  if (acomp.ativo) { const mL = linhaPorNumero_(ss, acomp.ativo.med); if (mL && medicoOnline_(mL.dados, agora)) acompMed = acomp.ativo; }
  if (acompMed) {
    const pagar = Math.round(ACOMPANHA_MOEDAS_HORA / 60);
    creditar_(ss, acompMed.med, pagar); acompMed.aba.getRange(acompMed.linha, 10).setValue(acompMed.pago + pagar);
  }
  const boost = (Number(l[C_BOOST_ATE - 1]) || 0) > agora || !!acompMed;
  if (modo !== 'vigiar' && !boost) turno++;
  progresso++;
  if (!desemp) { fome++; if (!tem_(String(l[C_ITENS - 1] || ''), 'mochila') || progresso % 2 === 0) ar = Math.max(0, ar - 1); cel(C_FOME, fome); cel(C_AR, ar); cel(C_AR_TS, agora); }
  let horaGuarda = 0, consertoHoje = 0;
  if (modo === 'consertar') {
    const caixa = temKit_(l);
    pontos = (funcao === 'mecanico' && caixa ? CONSERTO_PONTOS_MECANICO_CAIXA : CONSERTO_PONTOS) * TICKS_POR_MINUTO;
    const hojeC = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'), cd = String(l[C_CONSERTO_DIA - 1] || '').split('|');
    consertoHoje = (cd[0] === hojeC ? Number(cd[1]) || 0 : 0) + 1;
    cel(C_CONSERTO_DIA, hojeC + '|' + consertoHoje);
    if (!desemp) ganhou = (caixa ? CONSERTO_MOEDAS_COM_CAIXA : CONSERTO_MOEDAS_SEM_CAIXA) * TICKS_POR_MINUTO;
    if (consertoHoje > CONSERTO_CHEIO_MIN) ganhou = Math.floor(ganhou / TICKS_POR_MINUTO);
    somarPontos_(s, l, pontos);
  } else if (modo === 'vigiar') {
    ganhou = GUARDA_MOEDAS_MIN;
    const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'), gd = String(l[C_GUARDA_DIA - 1] || '').split('|');
    const minHoje = (gd[0] === hoje ? Number(gd[1]) || 0 : 0) + 1;
    cel(C_GUARDA_DIA, hoje + '|' + minHoje);
    if (minHoje % 60 === 0) { ganhou += GUARDA_BONUS_HORA; horaGuarda = GUARDA_BONUS_HORA; }
  } else if (modo === 'cultivar') {
    if (progresso % 10 === 0) produziu = 'comida';
  } else if (modo === 'cozinhar') {
    if (progresso % 5 === 0) produziu = 'refeicao';
  } else if (modo === 'construir') {
    avancarObra_(ss, obra, l);
  } else if (modo === 'torre') {
    pontos = (funcao === 'explorador' ? 2 : 1) * ((Number(l[C_VASSOURA_ATE - 1]) || 0) > agora ? 2 : 1);
    somarTorre_(ss, torre, l[0], pontos);
  }
  if (produziu) {
    let lista = String(l[C_ITENS - 1] || '').split(',').filter(String);
    if (produziu === 'refeicao') tirarItem_(lista, 'comida');
    lista.push(produziu); cel(C_ITENS, lista.join(','));
  }
  let est = 'trabalhando', restante = 0;
  let causa = '';
  if (modo !== 'vigiar' && turno >= TURNO_MINUTOS) {
    turno = 0; est = 'cansado';
    restante = (temBase ? DESCANSO_COM_BASE : DESCANSO_SEM_BASE) * 60;
    cel(C_DESCANSO, agora + restante * 1000);
    // cansaço máximo: chance de adoecer (quem comeu direito tem menos chance)
    const alimentado = fome < FOME_LIMITE / 2;
    if (!desemp && Math.random() < (alimentado ? DOENCA_CHANCE_ALIMENTADO : DOENCA_CHANCE)) {
      est = 'doente'; causa = 'cansaco'; restante = DOENTE_MINUTOS * 60; cel(C_DOENTE_ATE, agora + DOENTE_MINUTOS * 60000); cel(C_DESCANSO, 0);
    }
  }
  if (ganhou) { moedas += ganhou; cel(C_MOEDAS, moedas); }
  cel(C_ON_ULTIMO, agora); cel(C_TURNO, turno); cel(C_PROGRESSO, progresso);
  return r(est, restante, { causa: causa || undefined, acompanhadoAte: acompMed ? acompMed.ate : 0, acompanhadoPor: acompMed ? acompMed.medNome : '', pedidosAcompanhamento: acomp.pedidos, consertoHoje: consertoHoje, consertoCheio: CONSERTO_CHEIO_MIN, horaGuarda: horaGuarda, boostAte: boost ? Number(l[C_BOOST_ATE - 1]) : 0, temCaixa: modo === 'consertar' ? temKit_(l) : undefined });
}
function somarPontos_(s, l, n) {
  s.aba.getRange(s.linha, C_PONTOS).setValue((Number(l[C_PONTOS - 1]) || 0) + n);
  const sem = String(l[C_PONTOS_SEM - 1] || '').split('|'), chave = semana_();
  s.aba.getRange(s.linha, C_PONTOS_SEM).setValue(chave + '|' + ((sem[0] === chave ? Number(sem[1]) || 0 : 0) + n));
  const pr = PropertiesService.getScriptProperties(), antes = Number(pr.getProperty('PONTOS_NAVE')) || 0, depois = antes + n;
  pr.setProperty('PONTOS_NAVE', String(depois));
  const m = metasNave_(antes).proxima;
  if (m && depois >= m.alvo) {
    try {
      avisoRadio_(planilha_(), (m.grande ? '🚀🎉 META GRANDE BATIDA: ' : '✅ Meta da nave batida: ') + m.nome + '! (' + m.alvo.toLocaleString('pt-BR') + ' pontos)' + (m.grande ? ' Obrigado, sobreviventes! Grandes novidades vêm aí.' : ''));
      CacheService.getScriptCache().remove('lista');
    } catch (e) { /* segue */ }
  }
}
// Quem tem casa e vai descansar em casa: o descanso cai de 10 para 5 minutos
function descansarEmCasa_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const l = s.dados, agora = Date.now(), ate = Number(l[C_DESCANSO - 1]) || 0;
  if (!(temCasa_(String(l[C_ITENS - 1] || '')) || !!moradiaAlugada_(ss, l[0]))) return { ok: false, erro: 'Você não tem casa nem mora de aluguel.' };
  if (ate <= agora) return { ok: false, erro: 'Você não está descansando.' };
  const novo = Math.min(ate, ate - (DESCANSO_COM_BASE - DESCANSO_EM_CASA) * 60000);
  s.aba.getRange(s.linha, C_DESCANSO).setValue(novo);
  return { ok: true, descansoSeg: Math.max(0, Math.ceil((novo - agora) / 1000)) };
}
// Peça vital da nave (mineração): soma de 30 a 50 pontos na nave de uma vez
function usarPecaNave_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  if (!tirarItem_(lista, 'peca_nave')) return { ok: false, erro: 'Você não tem uma peça vital da nave.' };
  p.itens = lista.join(','); salvarPerfil_(s, p);
  const pts = PECA_NAVE_PONTOS_MIN + Math.floor(Math.random() * (PECA_NAVE_PONTOS_MAX - PECA_NAVE_PONTOS_MIN + 1));
  somarPontos_(s, s.dados, pts);
  p.moedas = (Number(p.moedas) || 0) + PECA_NAVE_MOEDAS; s.aba.getRange(s.linha, C_MOEDAS).setValue(p.moedas); p.moedasPeca = PECA_NAVE_MOEDAS;
  p.pontos = (Number(s.dados[C_PONTOS - 1]) || 0) + pts; p.pontosPeca = pts;
  avisoRadio_(ss, '🔧 ' + p.nome + ' instalou uma peça vital na nave: +' + pts + ' pontos de uma vez!');
  return p;
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
  if (Date.now() - desde < TROCA_FUNCAO_DIAS * 86400000) return { ok: false, erro: 'Você só pode trocar de profissão depois de ' + TROCA_FUNCAO_DIAS + ' dia(s). Próxima troca: ' + Utilities.formatDate(new Date(desde + TROCA_FUNCAO_DIAS * 86400000), 'America/Sao_Paulo', 'dd/MM HH:mm') + '.' };
  if (VAGAS[f]) {
    const todos = linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)), vagas = Math.max(1, Math.floor(todos.length / VAGAS[f]));
    if (todos.filter(function (l) { return funcaoDe_(l) === f; }).length >= vagas) return { ok: false, erro: 'Não há vagas de ' + FUNCOES[f].nome + ' agora (' + vagas + ' vaga(s) para ' + todos.length + ' sobreviventes).' };
  }
  if (VAGAS_MAX[f] && linhas_(ss.getSheetByName(ABA_SOBREVIVENTES)).filter(function (l) { return funcaoDe_(l) === f; }).length >= VAGAS_MAX[f])
    return { ok: false, erro: 'Já tem ' + VAGAS_MAX[f] + ' pessoas como ' + FUNCOES[f].nome + ' (é o máximo).' };
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
  if (f === 'medico' && Date.now() - (Number(s.dados[C_PLANTAO - 1]) || 0) >= PLANTAO_SEGUNDOS * 1000 &&
      online_(ss, 'medico').length >= MEDICOS_ONLINE_MAX) return { ok: false, erro: 'Já tem ' + MEDICOS_ONLINE_MAX + ' médicos de plantão agora. Tente de novo daqui a pouco.' };
  s.aba.getRange(s.linha, C_PLANTAO).setValue(Date.now());
  if (f === 'medico' && d.preco != null) {
    const preco = Math.floor(Number(d.preco));
    if (!(preco >= MEDICO_MIN && preco <= 100000)) return { ok: false, erro: 'O preço da consulta precisa ser de pelo menos ' + MEDICO_MIN + ' moedas.' };
    s.aba.getRange(s.linha, C_MEDICO_PRECO).setValue(preco);
  }
  const r = { ok: true, funcao: f };
  if (f === 'engenheiro') { r.obras = obrasAbertas_(ss); r.minha = obrasDoEngenheiro_(ss, s.dados[0])[0] || null; }
  if (f === 'medico') {
    const agoraM = Date.now(), ac = linhasAcomp_(ss).filter(function (a) { return acompAtivo_(a, agoraM) || acompPedidoValido_(a, agoraM); });
    r.trabalhando = linhas_(s.aba).filter(function (l) { return String(l[0]) !== String(s.dados[0]) && funcaoDe_(l) !== 'medico' && funcaoDe_(l) !== 'desempregado' && agoraM - (Number(l[C_ON_ULTIMO - 1]) || 0) < 3 * 60000; })
      .slice(0, 30).map(function (l) { const a = ac.filter(function (x) { return x.pac === String(l[0]); })[0]; return { numero: String(l[0]), nome: String(l[2]), acompanhado: a ? (a.med === String(s.dados[0]) ? 'meu' : 'outro') + (a.status === 'pedido' ? '_pedido' : '') : '' }; });
    r.pacientes = acompanhamentoDe_(ss, s.dados[0], agoraM).pacientes;
  }
  return r;
}
function chamarMedico_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const cansado = (Number(s.dados[C_DESCANSO - 1]) || 0) > Date.now(), cansadoMin = mineracaoDe_(s.dados).ate > Date.now();
  if (!estaDoente_(s.dados) && !cansado && !cansadoMin) return { ok: false, erro: 'Você não está doente nem cansado.' };
  const med = online_(ss, 'medico').filter(function (l) { return String(l[0]) === String(d.numero); })[0];
  if (!med) return { ok: false, erro: 'Esse médico não está mais de plantão.' };
  if (String(med[0]) === String(s.dados[0])) return { ok: false, erro: 'Você não pode se curar.' };
  const so_mineracao = cansadoMin && !cansado && !estaDoente_(s.dados);
  const preco = Math.max(MEDICO_MIN, Number(med[C_MEDICO_PRECO - 1]) || MEDICO_MIN) * (so_mineracao ? MEDICO_MINERACAO_X : 1), p = perfilDe_(s);
  if (p.moedas < preco) return { ok: false, erro: 'A consulta custa ' + preco + ' moedas e você tem ' + p.moedas + '.' };
  p.moedas -= preco; salvarPerfil_(s, p);
  s.aba.getRange(s.linha, C_DOENTE_ATE).setValue(0);
  if (cansado) { s.aba.getRange(s.linha, C_DESCANSO).setValue(0); s.aba.getRange(s.linha, C_TURNO).setValue(0); s.aba.getRange(s.linha, C_BOOST_ATE).setValue(Date.now() + BOOST_MINUTOS * 60000); p.boostAte = Date.now() + BOOST_MINUTOS * 60000; }
  if (cansadoMin) { s.aba.getRange(s.linha, C_MINERACAO).setValue('0|0'); p.mineracaoAte = 0; }
  creditar_(ss, med[0], preco);
  avisar_(ss, med[0], '🩺 ' + p.nome + ' chamou você e pagou ' + preco + ' moedas pela consulta.');
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Consulta com ' + med[2], preco]);
  p.doenteAte = 0; p.curadoPor = String(med[2]);
  return p;
}

/* ---------- Médico acompanhante (Lucas 14/11) ---------- */
function linhasAcomp_(ss) {
  const aba = ss.getSheetByName(ABA_ACOMPANHA); if (!aba) return [];
  return linhas_(aba).map(function (l, i) { return { aba: aba, linha: i + 2, id: String(l[0]), data: new Date(l[1]).getTime(), med: String(l[2]), medNome: String(l[3]), pac: String(l[4]), pacNome: String(l[5]), status: String(l[6]), inicio: Number(l[7]) || 0, ate: Number(l[8]) || 0, pago: Number(l[9]) || 0 }; });
}
function acompAtivo_(a, agora) { return a.status === 'ativo' && a.ate > agora; }
function acompPedidoValido_(a, agora) { return a.status === 'pedido' && agora - a.data < ACOMPANHA_PEDIDO_MIN * 60000; }
function medicoOnline_(l, agora) { return !!l && funcaoDe_(l) === 'medico' && agora - (Number(l[C_PLANTAO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000; }
function acompanhar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const agora = Date.now();
  if (funcaoDe_(s.dados) !== 'medico') return { ok: false, erro: 'Só médicos acompanham pacientes.' };
  if (!medicoOnline_(s.dados, agora)) return { ok: false, erro: 'Fique de plantão (painel TRABALHO) para acompanhar pacientes.' };
  const alvo = linhaPorNumero_(ss, d.numero);
  if (!alvo) return { ok: false, erro: 'Sobrevivente não encontrado.' };
  if (String(alvo.dados[0]) === String(s.dados[0])) return { ok: false, erro: 'Você não pode acompanhar a si mesmo.' };
  if (funcaoDe_(alvo.dados) === 'medico') return { ok: false, erro: 'Médicos não precisam de acompanhamento.' };
  const todos = linhasAcomp_(ss), meus = todos.filter(function (a) { return a.med === String(s.dados[0]) && (acompAtivo_(a, agora) || acompPedidoValido_(a, agora)); });
  if (meus.length >= ACOMPANHA_MAX) return { ok: false, erro: 'Você já acompanha (ou pediu para acompanhar) ' + ACOMPANHA_MAX + ' pessoas. Espere alguma terminar.' };
  if (todos.some(function (a) { return a.pac === String(alvo.dados[0]) && acompAtivo_(a, agora); })) return { ok: false, erro: alvo.dados[2] + ' já está sendo acompanhado(a) por um médico.' };
  if (meus.some(function (a) { return a.pac === String(alvo.dados[0]); })) return { ok: false, erro: 'Você já pediu para acompanhar ' + alvo.dados[2] + '. Espere a resposta.' };
  const id = 'AC' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  ss.getSheetByName(ABA_ACOMPANHA).appendRow([id, new Date(), s.dados[0], texto_(String(s.dados[2])), alvo.dados[0], texto_(String(alvo.dados[2])), 'pedido', 0, 0, 0]);
  avisar_(ss, alvo.dados[0], '🩺 Dr(a). ' + s.dados[2] + ' quer acompanhar você por 1 hora (grátis): enquanto trabalha, você não cansa nem fica doente. Abra o site para aceitar.');
  return { ok: true, pedido: id, paciente: String(alvo.dados[2]) };
}
function responderAcompanhamento_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const agora = Date.now(), a = linhasAcomp_(ss).filter(function (x) { return x.id === String(d.id) && x.pac === String(s.dados[0]); })[0];
  if (!a || !acompPedidoValido_(a, agora)) return { ok: false, erro: 'Esse pedido de acompanhamento já expirou.' };
  if (!d.aceitar) { a.aba.getRange(a.linha, 7).setValue('recusado'); return { ok: true, recusado: true }; }
  const med = linhaPorNumero_(ss, a.med);
  if (!med || !medicoOnline_(med.dados, agora)) { a.aba.getRange(a.linha, 7).setValue('expirado'); return { ok: false, erro: 'O médico saiu do plantão. Peça para ele tentar de novo.' }; }
  a.aba.getRange(a.linha, 7).setValue('ativo'); a.aba.getRange(a.linha, 8).setValue(agora); a.aba.getRange(a.linha, 9).setValue(agora + ACOMPANHA_MINUTOS * 60000);
  s.aba.getRange(s.linha, C_DOENTE_ATE).setValue(0);
  avisar_(ss, a.med, '🩺 ' + s.dados[2] + ' aceitou o seu acompanhamento. Fique de plantão: você ganha enquanto ' + s.dados[2] + ' trabalha.');
  const p = perfil_(ss, d); return p;
}
function acompanhamentoDe_(ss, numero, agora) {
  const todos = linhasAcomp_(ss);
  const ativo = todos.filter(function (a) { return a.pac === String(numero) && acompAtivo_(a, agora); })[0] || null;
  const pedidos = todos.filter(function (a) { return a.pac === String(numero) && acompPedidoValido_(a, agora); }).map(function (a) { return { id: a.id, medico: a.medNome }; });
  const pacientes = todos.filter(function (a) { return a.med === String(numero) && (acompAtivo_(a, agora) || acompPedidoValido_(a, agora)); }).map(function (a) { return { nome: a.pacNome, numero: a.pac, ate: a.status === 'ativo' ? a.ate : 0, pago: a.pago }; });
  return { ativo: ativo, pedidos: pedidos, pacientes: pacientes };
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
  if (o.dono === String(s.dados[0])) return { ok: false, erro: 'Você não pode construir a sua própria obra.' };
  o.aba.getRange(o.linha, 8).setValue('em obra'); o.aba.getRange(o.linha, 9).setValue(s.dados[0]);
  o.aba.getRange(o.linha, 10).setValue(texto_(String(s.dados[2]))); o.aba.getRange(o.linha, 11).setValue(0); o.aba.getRange(o.linha, 12).setValue(Date.now());
  s.aba.getRange(s.linha, C_PLANTAO).setValue(Date.now());
  avisar_(ss, o.dono, '🏗️ O engenheiro ' + s.dados[2] + ' começou a construir “' + o.nome + '”.');
  return { ok: true, obra: { id: o.id, dono: o.donoNome, item: o.item, nome: o.nome, mao: o.mao, progresso: 0, total: OBRA_MINUTOS } };
}
// Área de Serviços: o dono da casa escolhe um engenheiro de plantão para a sua obra.
function chamarEngenheiro_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const o = linhasObras_(ss).filter(function (x) { return x.id === String(d.obra) && x.dono === String(s.dados[0]); })[0];
  if (!o) return { ok: false, erro: 'Essa obra não é sua.' };
  const livre = o.status === 'aguardando' || (o.status === 'em obra' && Date.now() - o.sinal > OBRA_MINUTOS * 60000);
  if (!livre) return { ok: false, erro: 'Um engenheiro já está construindo essa obra.' };
  const eng = online_(ss, 'engenheiro').filter(function (l) { return String(l[0]) === String(d.numero); })[0];
  if (!eng) return { ok: false, erro: 'Esse engenheiro não está mais de plantão.' };
  if (String(eng[0]) === String(s.dados[0])) return { ok: false, erro: 'Você não pode construir a sua própria casa.' };
  if (obrasDoEngenheiro_(ss, eng[0]).length) return { ok: false, erro: 'Esse engenheiro já está numa obra. Escolha outro.' };
  o.aba.getRange(o.linha, 8).setValue('em obra'); o.aba.getRange(o.linha, 9).setValue(eng[0]);
  o.aba.getRange(o.linha, 10).setValue(texto_(String(eng[2]))); o.aba.getRange(o.linha, 11).setValue(0); o.aba.getRange(o.linha, 12).setValue(Date.now());
  avisar_(ss, eng[0], '🏗️ ' + s.dados[2] + ' contratou você para construir “' + o.nome + '”. Fique de plantão para a obra andar.');
  return { ok: true, engenheiro: String(eng[2]) };
}
function avancarObra_(ss, o, l) {
  const prog = o.progresso + 1;
  o.aba.getRange(o.linha, 11).setValue(prog); o.aba.getRange(o.linha, 12).setValue(Date.now());
  if (prog >= OBRA_MINUTOS) {
    concluirObra_(ss, o, 'pronta'); creditar_(ss, l[0], o.mao);
    avisar_(ss, o.dono, '🏠 Sua obra “' + o.nome + '” ficou pronta! Construída por ' + l[2] + '.', true);
    avisar_(ss, l[0], '💰 Obra “' + o.nome + '” terminada: +' + o.mao + ' moedas de mão de obra.');
  }
}
function concluirObra_(ss, o, status) {
  o.aba.getRange(o.linha, 8).setValue(status);
  const dono = linhaPorNumero_(ss, o.dono); if (!dono) return;
  const lista = String(dono.dados[C_ITENS - 1] || '').split(',').filter(String);
  if (lista.indexOf(o.item) < 0) lista.push(o.item);
  dono.aba.getRange(dono.linha, C_ITENS).setValue(lista.join(','));
  if (o.item === 'outdoor') { dono.aba.getRange(dono.linha, C_OUTDOOR).setValue(texto_(o.nome)); return; }
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
/* ---------- Tickets iniciais e oferta de boas-vindas ---------- */
function ticketsTexto_() { const l = []; Object.keys(TICKETS_CADASTRO).forEach(function (k) { for (let i = 0; i < TICKETS_CADASTRO[k]; i++) l.push(k); }); return l.join(','); }
// Roda 1 vez no setup: quem já tinha acordado também ganha os 5 tickets
function ticketsIniciais_(ss) {
  const pr = PropertiesService.getScriptProperties(); if (pr.getProperty('TICKETS_INICIAIS')) return;
  const aba = ss.getSheetByName(ABA_SOBREVIVENTES);
  linhas_(aba).forEach(function (l, i) { const it = String(l[C_ITENS - 1] || ''); aba.getRange(i + 2, C_ITENS).setValue(it ? it + ',' + ticketsTexto_() : ticketsTexto_()); });
  pr.setProperty('TICKETS_INICIAIS', String(Date.now()));
}
// O site chama quando a pessoa abre o Mercado: depois de 15 min de jogo, a oferta aparece 1 vez e dura 1 hora
function ativarOferta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const ate = Number(s.dados[C_OFERTA_ATE - 1]) || 0, desde = new Date(s.dados[C_DATA - 1]).getTime();
  if (ate === -1) return { ok: true, ofertaAte: -1 };
  if (ate) return { ok: true, ofertaAte: ate };
  if (Date.now() - desde < OFERTA_DEPOIS_MIN * 60000) return { ok: true, ofertaAte: 0 };
  const novo = Date.now() + OFERTA_MINUTOS * 60000;
  s.aba.getRange(s.linha, C_OFERTA_ATE).setValue(novo);
  return { ok: true, ofertaAte: novo, oferta: { reais: OFERTA_REAIS, moedas: OFERTA_MOEDAS, caixaDias: OFERTA_CAIXA_DIAS, roupa: 'Jaqueta Orion' } };
}

/* ---------- Assembleia: pautas, discussão e enquete ---------- */
function diaHoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function votacaoAberta_(dia) {
  if (dia !== diaHoje_()) return false;
  return Number(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'H')) < VOTACAO_FECHA_HORA;
}
function acessoAssembleia_(ss, l) {
  const itens = String(l[C_ITENS - 1] || ''), lista = itens.split(',');
  const dono = temCasa_(itens) || lista.some(function (i) { return /^lote_/.test(i); });
  const aluga = !!moradiaAlugada_(ss, l[0]), hoje = diaHoje_();
  const ent = ss.getSheetByName(ABA_ENTRADAS);
  const entrou = ent ? linhas_(ent).some(function (e) { return String(e[0]) === hoje && String(e[1]) === String(l[0]); }) : false;
  const cont = function (id) { return lista.filter(function (x) { return x === id; }).length; };
  return { entra: dono || aluga || entrou, criaPauta: dono, comoEntra: dono ? 'dono' : aluga ? 'aluguel' : entrou ? 'ticket' : '',
    tickets: cont('ticket_assembleia'), ticketsPauta: cont('ticket_pauta'), residente: temCasa_(itens) || aluga, entrou: entrou };
}
function pautas_(ss, desdeDia) {
  const aba = ss.getSheetByName(ABA_PAUTAS); if (!aba) return [];
  return linhas_(aba).filter(function (l) { return String(l[2]) >= desdeDia; }).map(function (l) {
    let ops = []; try { ops = JSON.parse(String(l[7] || '[]')); } catch (e) { ops = []; }
    return { id: String(l[0]), data: new Date(l[1]).getTime(), dia: String(l[2]), autorNumero: String(l[3]), autor: String(l[4]), titulo: String(l[5]), texto: String(l[6]), opcoes: ops, video: String(l[8] || '').toLowerCase() === 'sim' };
  });
}
function assembleia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const ac = acessoAssembleia_(ss, s.dados), hoje = diaHoje_();
  if (ac.entra && !ac.entrou && ss.getSheetByName(ABA_ENTRADAS)) ss.getSheetByName(ABA_ENTRADAS).appendRow([hoje, s.dados[0], ac.comoEntra]); // conta a participação de hoje
  const ontem3 = Utilities.formatDate(new Date(Date.now() - 3 * 86400000), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const ps = pautas_(ss, ontem3);
  const ids = {}; ps.forEach(function (p) { ids[p.id] = p; p.votos = p.opcoes.map(function () { return 0; }); p.meuVoto = -1; p.msgs = []; p.aberta = votacaoAberta_(p.dia); });
  const vt = ss.getSheetByName(ABA_VOTOS);
  if (vt) linhas_(vt).forEach(function (v) { const p = ids[String(v[1])]; if (!p) return; const o = Number(v[3]); if (p.votos[o] != null) p.votos[o]++; if (String(v[2]) === String(s.dados[0])) p.meuVoto = o; });
  const ms = ss.getSheetByName(ABA_ASSEMBLEIA);
  if (ms && ac.entra) linhas_(ms).forEach(function (m) { const p = ids[String(m[1])]; if (p && p.dia === hoje) p.msgs.push({ t: new Date(m[0]).getTime(), nome: String(m[3]), numero: String(m[2]), texto: String(m[4]) }); });
  ps.forEach(function (p) { p.msgs = p.msgs.slice(-60); if (p.dia !== hoje) delete p.msgs; });
  const deHoje = ps.filter(function (p) { return p.dia === hoje; });
  return { ok: true, acesso: ac, hoje: hoje, pautas: ps.reverse(), vagasPauta: Math.max(0, PAUTAS_POR_DIA - deHoje.length), fecha: VOTACAO_FECHA_HORA };
}
function entrarAssembleia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const ac = acessoAssembleia_(ss, s.dados);
  if (ac.entra) return assembleia_(ss, d);
  const lista = String(s.dados[C_ITENS - 1] || '').split(',').filter(String);
  if (!tirarItem_(lista, 'ticket_assembleia')) return { ok: false, erro: 'Você não tem Ticket da Assembleia. Eles saem nos baús e no mercado entre jogadores.' };
  s.aba.getRange(s.linha, C_ITENS).setValue(lista.join(','));
  ss.getSheetByName(ABA_ENTRADAS).appendRow([diaHoje_(), s.dados[0], 'ticket']);
  return assembleia_(ss, d);
}
function criarPauta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const titulo = limpar_(d.titulo, 80), texto = limpar_(d.texto, 500);
  const opcoes = (Array.isArray(d.opcoes) ? d.opcoes : []).map(function (o) { return limpar_(o, 60); }).filter(String).slice(0, 4);
  if (titulo.length < 3) return { ok: false, erro: 'Dê um título para a pauta.' };
  if (opcoes.length < 2) return { ok: false, erro: 'A enquete precisa de pelo menos 2 opções.' };
  if (temOfensa_(normalizarTexto_(titulo + ' ' + texto + ' ' + opcoes.join(' ')))) return { ok: false, erro: 'A pauta tem palavras proibidas na colônia.' };
  const hoje = diaHoje_();
  if (!votacaoAberta_(hoje)) return { ok: false, erro: 'A Assembleia de hoje já fechou (' + VOTACAO_FECHA_HORA + 'h). Crie sua pauta amanhã.' };
  if (pautas_(ss, hoje).filter(function (p) { return p.dia === hoje; }).length >= PAUTAS_POR_DIA) return { ok: false, erro: 'Já tem ' + PAUTAS_POR_DIA + ' pautas hoje. Guarde seu ticket e tente amanhã (ele não foi gasto).' };
  const ac = acessoAssembleia_(ss, s.dados);
  if (!ac.criaPauta) {
    const lista = String(s.dados[C_ITENS - 1] || '').split(',').filter(String);
    if (!tirarItem_(lista, 'ticket_pauta')) return { ok: false, erro: 'Para criar pauta você precisa de um Ticket de Pauta (ou ser dono de terreno ou casa).' };
    s.aba.getRange(s.linha, C_ITENS).setValue(lista.join(','));
    if (!ac.entra) ss.getSheetByName(ABA_ENTRADAS).appendRow([hoje, s.dados[0], 'pauta']);
  }
  const id = 'P' + Date.now().toString(36).toUpperCase();
  ss.getSheetByName(ABA_PAUTAS).appendRow([id, new Date(), hoje, s.dados[0], texto_(String(s.dados[2])), texto_(titulo), texto_(texto), JSON.stringify(opcoes), '']);
  avisoRadio_(ss, '🏛️ Nova pauta na Assembleia: “' + titulo + '” (de ' + s.dados[2] + '). Votação até as ' + VOTACAO_FECHA_HORA + 'h!');
  return assembleia_(ss, d);
}
function falarAssembleia_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const ac = acessoAssembleia_(ss, s.dados);
  if (!ac.entra) return { ok: false, erro: 'Use um ticket para entrar na Assembleia de hoje.' };
  const p = pautas_(ss, diaHoje_()).filter(function (x) { return x.id === String(d.pauta) && x.dia === diaHoje_(); })[0];
  if (!p) return { ok: false, erro: 'Essa pauta não está aberta hoje.' };
  const texto = limpar_(d.texto, 300);
  if (texto.length < 1) return { ok: false, erro: 'Escreva alguma coisa.' };
  const regra = regraOutdoor_(s.dados, texto); if (regra) { regra.erro = regra.erro.replace('o outdoor', 'a Assembleia').replace('outdoor', 'Assembleia'); return regra; }
  ss.getSheetByName(ABA_ASSEMBLEIA).appendRow([new Date(), p.id, s.dados[0], texto_(String(s.dados[2])), texto_(texto)]);
  return assembleia_(ss, d);
}
function votar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const ac = acessoAssembleia_(ss, s.dados);
  if (!ac.entra) return { ok: false, erro: 'Use um ticket para entrar na Assembleia de hoje.' };
  const p = pautas_(ss, diaHoje_()).filter(function (x) { return x.id === String(d.pauta); })[0];
  if (!p || !votacaoAberta_(p.dia)) return { ok: false, erro: 'A votação dessa pauta já fechou.' };
  const o = Number(d.opcao); if (!(o >= 0 && o < p.opcoes.length)) return { ok: false, erro: 'Opção inválida.' };
  const vt = ss.getSheetByName(ABA_VOTOS);
  if (linhas_(vt).some(function (v) { return String(v[1]) === p.id && String(v[2]) === String(s.dados[0]); })) return { ok: false, erro: 'Você já votou nessa pauta.' };
  vt.appendRow([new Date(), p.id, s.dados[0], o]);
  return assembleia_(ss, d);
}
// Selo de Conselheiro: participou da discussão de uma pauta que virou vídeo (o Lucas escreve "sim" na coluna virou_video da aba Pautas)
function conselheiro_(ss, numero) {
  const pa = ss.getSheetByName(ABA_PAUTAS), ms = ss.getSheetByName(ABA_ASSEMBLEIA); if (!pa || !ms) return false;
  const video = {}; linhas_(pa).forEach(function (l) { if (String(l[8] || '').toLowerCase() === 'sim') video[String(l[0])] = true; });
  return linhas_(ms).some(function (m) { return video[String(m[1])] && String(m[2]) === String(numero); }) || linhas_(pa).some(function (l) { return video[String(l[0])] && String(l[3]) === String(numero); });
}

/* ---------- Sininho: avisos para cada jogador ---------- */
function avisar_(ss, numero, texto, importante) {
  if (importante) emailAviso_(ss, numero, texto);
  try {
    if (!numero) return;
    let aba = ss.getSheetByName(ABA_AVISOS);
    if (!aba) { aba = ss.insertSheet(ABA_AVISOS); aba.appendRow(['data', 'numero', 'texto']); }
    aba.appendRow([new Date(), numero, texto_(String(texto))]);
  } catch (e) { /* aviso nunca pode quebrar a ação principal */ }
}
function nomeDoItem_(id) {
  if (/^reliquia_/.test(id)) return nomeReliquia_(planilha_(), id);
  if (/^lote_/.test(id)) return 'Terreno ' + id.replace('lote_', '');
  const i = ITENS.filter(function (x) { return x.id === id; })[0] || achados_().filter(function (x) { return x.id === id; })[0];
  if (i) return i.nome;
  return COMIDAS[id] ? COMIDAS[id].nome : '';
}
function avisosDe_(ss, numero) {
  const aba = ss.getSheetByName(ABA_AVISOS); if (!aba || aba.getLastRow() < 2) return [];
  const n = Math.min(AVISOS_LER, aba.getLastRow() - 1);
  return aba.getRange(aba.getLastRow() - n + 1, 1, n, 3).getValues()
    .filter(function (l) { return String(l[1]) === String(numero); })
    .slice(-AVISOS_POR_PESSOA).reverse()
    .map(function (l) { return { t: new Date(l[0]).getTime(), texto: String(l[2]) }; });
}
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
    oferta: String(l[C_OUT_OFERTA - 1] || ''),
    anuncio: ativo ? { texto: String(l[C_OUT_ANUNCIO - 1]), autor: String(l[C_OUT_AUTOR - 1] || ''), ate: ate, oferta: String(l[C_ANUNCIO_OFERTA - 1] || '') } : null };
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
  lista.push('outdoor_guardado'); // o outdoor não some: vai para o inventário (dá para vender ou montar de novo)
  if (Number(s.dados[C_OUT_ATE - 1]) > Date.now()) return { ok: false, erro: 'Tem um anúncio pago no seu outdoor até ' + Utilities.formatDate(new Date(Number(s.dados[C_OUT_ATE - 1])), 'America/Sao_Paulo', 'dd/MM HH:mm') + '. Espere ele acabar.' };
  p.itens = lista.join(','); salvarPerfil_(s, p);
  [C_OUTDOOR, C_OUT_PRECO, C_OUT_ANUNCIO, C_OUT_AUTOR, C_OUT_ATE, C_OUT_OFERTA, C_ANUNCIO_OFERTA].forEach(function (c) { s.aba.getRange(s.linha, c).setValue(''); });
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
  const ofertaId = d.oferta ? String(d.oferta) : '';
  if (ofertaId && !ofertaMinhaAberta_(ss, ofertaId, s.dados[0])) return { ok: false, erro: 'Esse item não está mais à venda.' };
  const p = perfilDe_(s);
  if (p.moedas < o.preco) return { ok: false, erro: 'Moedas insuficientes. Você tem ' + p.moedas + ' e precisa de ' + o.preco + '.' };
  p.moedas -= o.preco; salvarPerfil_(s, p);
  const taxa = Math.floor(o.preco * TAXA_ANUNCIO), ate = Date.now() + ANUNCIO_HORAS * 3600000;
  const fresco = linhaPorNumero_(ss, d.numero);
  fresco.aba.getRange(fresco.linha, C_MOEDAS).setValue((Number(fresco.dados[C_MOEDAS - 1]) || 0) + o.preco - taxa);
  fresco.aba.getRange(fresco.linha, C_OUT_ANUNCIO).setValue(texto_(texto));
  fresco.aba.getRange(fresco.linha, C_OUT_AUTOR).setValue(texto_(String(p.nome)));
  fresco.aba.getRange(fresco.linha, C_OUT_ATE).setValue(ate);
  fresco.aba.getRange(fresco.linha, C_ANUNCIO_OFERTA).setValue(ofertaId);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Anúncio no outdoor de ' + o.dono + ': ' + texto, o.preco]);
  cobrarTaxa_(ss, taxa, 'Taxa de anúncio (outdoor de ' + o.dono + ')');
  avisar_(ss, fresco.dados[0], '🪧 ' + p.nome + ' anunciou no seu outdoor: +' + (o.preco - taxa) + ' moedas.');
  p.anuncioAte = ate;
  return p;
}

/* ---------- Invasão de terreno ---------- */
function vistoEm_(l) { return Math.max(Number(l[C_VISTO - 1]) || 0, Number(l[C_ON_ULTIMO - 1]) || 0, new Date(l[C_DATA - 1]).getTime() || 0); }
function donoLinhaDoLote_(ss, n) {
  const aba = ss.getSheetByName(ABA_SOBREVIVENTES), ls = linhas_(aba), id = 'lote_' + n;
  for (let i = 0; i < ls.length; i++) if (String(ls[i][C_ITENS - 1] || '').split(',').indexOf(id) >= 0) return { aba: aba, linha: i + 2, dados: ls[i] };
  return null;
}
function segurancaDe_(ss, numero) {
  const aba = ss.getSheetByName(ABA_SEGURANCA); if (!aba) return null;
  const l = linhas_(aba).filter(function (x) { return String(x[1]) === String(numero) && Number(x[6]) > Date.now(); }).pop();
  return l ? { guarda: String(l[4]), guardaNumero: String(l[3]), ate: Number(l[6]) } : null;
}
// Terreno abandonado: o dono perde o lote e a construção; o lote volta a ficar livre para registrar.
function liberarLote_(ss, dono, n) {
  const tirar = ['lote_' + n, 'base', 'base_grande', 'outdoor', 'outdoor_guardado'];
  const lista = String(dono.dados[C_ITENS - 1] || '').split(',').filter(function (i) { return i && tirar.indexOf(i) < 0; });
  dono.aba.getRange(dono.linha, C_ITENS).setValue(lista.join(','));
  [C_OUTDOOR, C_OUT_PRECO, C_OUT_ANUNCIO, C_OUT_AUTOR, C_OUT_ATE].forEach(function (c) { dono.aba.getRange(dono.linha, c).setValue(''); });
  const t = ss.getSheetByName(ABA_TERRENOS), ts = linhas_(t);
  ts.forEach(function (l, i) { if (String(l[10]) === String(dono.dados[0]) && /^B/.test(String(l[0])) && String(l[7]) === 'pago') t.getRange(i + 2, 8).setValue('perdida (abandono)'); });
  avisar_(ss, dono.dados[0], '🏚️ Você ficou ' + ABANDONO_DIAS + ' dias sem aparecer e perdeu o Terreno ' + n + ' (e o que estava construído nele).', true);
}
// O site manda 1 sinal por minuto enquanto o bonequinho está parado no terreno de outra pessoa.
function invadir_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const n = loteEm_(Number(d.x), Number(d.y));
  if (!n || n !== Number(d.lote)) return { ok: false, erro: 'Fique parado dentro do terreno para invadir.', parar: true };
  const dono = donoLinhaDoLote_(ss, n);
  if (!dono) return { ok: false, erro: 'Esse terreno não tem dono.', parar: true };
  if (String(dono.dados[0]) === String(s.dados[0])) return { ok: false, erro: 'Esse terreno é seu.', parar: true };
  const agora = Date.now(), cel = function (v) { s.aba.getRange(s.linha, C_INVASAO).setValue(v); };
  if (agora - vistoEm_(dono.dados) > ABANDONO_DIAS * 86400000) {
    liberarLote_(ss, dono, n); cel('');
    avisoRadio_(ss, '🏚️ O Terreno ' + n + ' estava abandonado e agora está livre. ' + s.dados[2] + ' chegou primeiro!');
    return { ok: true, liberado: true, lote: n };
  }
  if (agora - new Date(dono.dados[C_DATA - 1]).getTime() < PROTECAO_NOVATO_DIAS * 86400000)
    return { ok: false, erro: dono.dados[2] + ' acordou há menos de ' + PROTECAO_NOVATO_DIAS + ' dias e ainda está protegido(a) contra invasão.', parar: true };
  const seg = segurancaDe_(ss, dono.dados[0]);
  if (seg) return { ok: false, erro: 'Esse terreno está protegido pelo guarda ' + seg.guarda + '.', parar: true };
  const inv = ss.getSheetByName(ABA_INVASOES), limite = agora - INVASAO_INTERVALO_HORAS * 3600000;
  if (linhas_(inv).some(function (l) { return Number(l[1]) === n && new Date(l[0]).getTime() > limite; }))
    return { ok: false, erro: 'Esse terreno já foi invadido nas últimas ' + INVASAO_INTERVALO_HORAS + ' horas.', parar: true };
  const at = String(s.dados[C_INVASAO - 1] || '').split('|');
  let inicio = Number(at[1]) || 0;
  if (Number(at[0]) !== n || agora - (Number(at[2]) || 0) > 150000) {
    inicio = agora;
    avisar_(ss, dono.dados[0], '🚨 ' + s.dados[2] + ' está invadindo o seu Terreno ' + n + '! Contrate um guarda em Serviços para proteger.', true);
  }
  const passou = Math.floor((agora - inicio) / 60000);
  if (agora - inicio < INVASAO_MINUTOS * 60000 - 30000) { cel(n + '|' + inicio + '|' + agora); return { ok: true, lote: n, minutos: passou, total: INVASAO_MINUTOS }; }
  // completou: leva 5% das moedas ou 1 item simples
  cel('');
  const fresco = linhaPorNumero_(ss, dono.dados[0]), moedas = Number(fresco.dados[C_MOEDAS - 1]) || 0;
  const valor = Math.floor(moedas * INVASAO_PORCENTO / 100);
  let levou = '';
  if (valor >= 1) {
    fresco.aba.getRange(fresco.linha, C_MOEDAS).setValue(moedas - valor); creditar_(ss, s.dados[0], valor); levou = valor + ' moedas';
  } else {
    const lista = String(fresco.dados[C_ITENS - 1] || '').split(',').filter(String);
    const pode = lista.filter(function (i) { return ITENS_INVADIVEIS.indexOf(i) >= 0; });
    if (pode.length) {
      const it = pode[Math.floor(Math.random() * pode.length)]; tirarItem_(lista, it);
      fresco.aba.getRange(fresco.linha, C_ITENS).setValue(lista.join(','));
      const minha = linhaPorNumero_(ss, s.dados[0]); minha.aba.getRange(minha.linha, C_ITENS).setValue(String(minha.dados[C_ITENS - 1] || '').split(',').filter(String).concat([it]).join(','));
      levou = nomeDoItem_(it) || it;
    }
  }
  inv.appendRow([new Date(), n, s.dados[0], texto_(String(s.dados[2])), dono.dados[0], texto_(String(dono.dados[2])), levou || 'nada']);
  avisar_(ss, dono.dados[0], '🚨 ' + s.dados[2] + ' invadiu o seu Terreno ' + n + (levou ? ' e levou ' + levou + '.' : ', mas não achou nada para levar.'));
  avisar_(ss, s.dados[0], '🏴 Você invadiu o Terreno ' + n + (levou ? ' e levou ' + levou + '.' : ', mas não tinha nada para levar.'));
  avisoRadio_(ss, '🚨 ' + s.dados[2] + ' invadiu o terreno de ' + dono.dados[2] + '!');
  const p = perfilDe_(linhaComoSobrevivente_(ss, s)); p.invadiu = true; p.levou = levou; p.lote = n; return p;
}
function linhaComoSobrevivente_(ss, s) { const l = linhaPorNumero_(ss, s.dados[0]); return { aba: l.aba, linha: l.linha, dados: l.dados }; }

/* ---------- Títulos de nobreza ---------- */
function assembleiasDe_(ss, numero) {
  const ent = ss.getSheetByName(ABA_ENTRADAS); if (!ent) return 0;
  const dias = {}; linhas_(ent).forEach(function (e) { if (String(e[1]) === String(numero)) dias[String(e[0])] = 1; });
  return Object.keys(dias).length;
}
function pegarTitulo_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const atual = String(s.dados[C_TITULO - 1] || ''), i = TITULOS.map(function (t) { return t.id; }).indexOf(atual) + 1;
  const t = TITULOS[i];
  if (!t) return { ok: false, erro: 'Você já tem o título mais alto.' };
  if (d.id && d.id !== t.id) return { ok: false, erro: 'Os títulos vêm em ordem. O próximo é ' + t.nome + '.' };
  const horas = Math.floor((Number(s.dados[C_ON_MIN - 1]) || 0) / 60), ass = assembleiasDe_(ss, s.dados[0]);
  const meusItens = String(s.dados[C_ITENS - 1] || ''), proprio = tem_(meusItens, 'reliquia_' + t.id + '_' + s.dados[0]);
  const comprado = !proprio && meusItens.split(',').some(function (i) { return i.indexOf('reliquia_' + t.id + '_') === 0; });
  const precoT = t.preco * (comprado ? TITULO_ITEM_COMPRADO_X : 1);
  if (t.item && !proprio && !comprado)
    return { ok: false, erro: 'Para ' + (feminino_(s.dados) ? t.fem : t.nome) + ' você precisa do item exclusivo do título. Ele vem no baú especial do check-in (7 dias seguidos) ou pode ser comprado de outro jogador (aí o título custa 3x).' };
  if (horas < t.horas || ass < t.assembleias) return { ok: false, erro: 'Para ' + t.nome + ' você precisa de ' + t.horas + ' horas online (tem ' + horas + ') e ' + t.assembleias + ' Assembleias (tem ' + ass + ').' };
  const p = perfilDe_(s);
  if (p.moedas < precoT) return { ok: false, erro: 'O título custa ' + precoT + ' moedas' + (comprado ? ' (3x, porque o item exclusivo é de outra pessoa)' : '') + ' e você tem ' + p.moedas + '.' };
  p.moedas -= precoT; salvarPerfil_(s, p); s.aba.getRange(s.linha, C_TITULO).setValue(t.id);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Título: ' + t.nome, precoT]);
  avisoRadio_(ss, '👑 ' + p.nome + ' recebeu um título de nobreza!');
  p.titulo = t.id; p.horasOnline = horas; p.assembleias = ass;
  return p;
}

/* ---------- E-mail de avisos ---------- */
function emailValido_(e) { const v = String(e || '').trim().toLowerCase().slice(0, 120); return /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/.test(v) ? v : ''; }
function tokenEmail_(numero, chave) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(numero) + '|' + String(chave)).slice(0, 6)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function emailAviso_(ss, numero, texto) {
  try {
    const l = linhaPorNumero_(ss, numero); if (!l) return;
    const email = String(l.dados[C_EMAIL - 1] || ''), hoje = diaHoje_();
    if (!email || String(l.dados[C_EMAIL_DIA - 1] || '') === hoje) return;
    if (MailApp.getRemainingDailyQuota() <= EMAIL_FOLGA) return;
    const sair = ScriptApp.getService().getUrl() + '?sairemail=' + numero + '&t=' + tokenEmail_(numero, l.dados[C_CHAVE - 1]);
    MailApp.sendEmail({ to: email, name: EMAIL_NOME, subject: 'Nave Orion: ' + String(texto).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '').trim().slice(0, 70),
      body: 'Olá, ' + l.dados[2] + '!\n\n' + texto + '\n\nEntre na nave: ' + SITE_URL + '\n\nPara não receber mais e-mails da Nave Orion: ' + sair });
    l.aba.getRange(l.linha, C_EMAIL_DIA).setValue(hoje);
  } catch (e) { /* e-mail nunca pode quebrar o jogo */ }
}
function sairEmail_(numero, t) {
  const ss = planilha_(), l = linhaPorNumero_(ss, numero);
  if (!l || String(t) !== tokenEmail_(numero, l.dados[C_CHAVE - 1])) return 'Link inválido.';
  l.aba.getRange(l.linha, C_EMAIL).setValue('');
  return 'Pronto! Você não vai mais receber e-mails da Nave Orion. Dá para cadastrar de novo no seu cartão, no site.';
}
function mudarEmail_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const email = emailValido_(d.email);
  if (d.email && String(d.email).trim() && !email) return { ok: false, erro: 'Esse e-mail não parece certo.' };
  if (email && !d.aceitaEmail) return { ok: false, erro: 'Marque a caixinha para aceitar receber avisos por e-mail.' };
  s.aba.getRange(s.linha, C_EMAIL).setValue(email);
  return { ok: true, email: email };
}

/* ---------- Check-in e itens exclusivos ---------- */
function mineracaoDe_(l) { const a = String(l[C_MINERACAO - 1] || '').split('|'); return { feitas: Number(a[0]) || 0, ate: Number(a[1]) || 0 }; }
function feminino_(l) { return String(l[C_VISUAL - 1] || '').split(',')[5] === '1'; }
function nomeReliquia_(ss, id) {
  const m = /^reliquia_([a-z]+)_(\d+)$/.exec(id); if (!m || !RELIQUIAS[m[1]]) return '';
  const l = (linhaPorNumero_(ss, m[2]) || {}).dados;
  return l ? RELIQUIAS[m[1]][feminino_(l) ? 'fem' : 'masc'] + l[2] : RELIQUIAS[m[1]].masc.trim();
}
function nomesReliquias_(ss, itens) {
  const r = {}; String(itens || '').split(',').forEach(function (i) { if (/^reliquia_/.test(i) && !r[i]) r[i] = nomeReliquia_(ss, i); }); return r;
}
function checkinEstado_(l) {
  const a = String(l[C_CHECKIN - 1] || '').split('|'), hoje = diaHoje_();
  const ontem = Utilities.formatDate(new Date(Date.now() - 86400000), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const seq = a[0] === hoje || a[0] === ontem ? Number(a[1]) || 0 : 0;
  return { feitoHoje: a[0] === hoje, dia: seq, semanas: Number(a[2]) || 0 };
}
function checkin_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const e = checkinEstado_(s.dados);
  if (e.feitoHoje) return { ok: true, jaFeito: true, checkin: e };
  const dia = e.dia % 7 + 1, moedas = CHECKIN_MOEDAS[dia - 1], p = perfilDe_(s);
  let semanas = e.semanas, item = '';
  p.moedas += moedas;
  if (dia === 7) {
    const tipo = ORDEM_RELIQUIAS[semanas];
    if (tipo) { item = 'reliquia_' + tipo + '_' + p.numero; p.itens = (p.itens ? p.itens + ',' : '') + item; }
    semanas++;
  }
  salvarPerfil_(s, p);
  s.aba.getRange(s.linha, C_CHECKIN).setValue(diaHoje_() + '|' + dia + '|' + semanas);
  if (item) { const nome = nomeReliquia_(ss, item); avisar_(ss, p.numero, '🎁 Baú especial do check-in: +' + moedas + ' moedas e ' + nome + '!'); avisoRadio_(ss, '🎁 ' + p.nome + ' completou 7 dias de check-in e ganhou: ' + nome + '!'); }
  p.checkin = { feitoHoje: true, dia: dia, semanas: semanas }; p.ganhou = moedas; p.itemExclusivo = item;
  p.reliquias = nomesReliquias_(ss, p.itens); if (item) p.nomeExclusivo = p.reliquias[item];
  return p;
}

/* ---------- Centro de Pesquisa ---------- */
function pesquisar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const valor = PESQUISA[d.item];
  if (!valor) return { ok: false, erro: 'O Centro de Pesquisa não estuda esse item.' };
  const p = perfilDe_(s), lista = p.itens ? p.itens.split(',') : [];
  const tem = lista.filter(function (i) { return i === d.item; }).length;
  const qtd = Math.min(tem, Math.max(1, Math.floor(Number(d.qtd) || 1)));
  if (!tem) return { ok: false, erro: 'Você não tem esse item.' };
  for (let i = 0; i < qtd; i++) tirarItem_(lista, d.item);
  const moedas = valor * qtd, pts = moedas * PESQUISA_PONTOS_POR_MOEDA;
  p.itens = lista.join(','); p.moedas += moedas; salvarPerfil_(s, p);
  p.pesquisa = (Number(s.dados[C_PESQUISA - 1]) || 0) + pts; s.aba.getRange(s.linha, C_PESQUISA).setValue(p.pesquisa);
  const props = PropertiesService.getScriptProperties();
  props.setProperty('PESQUISA_TOTAL', String((Number(props.getProperty('PESQUISA_TOTAL')) || 0) + pts));
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Pesquisa: ' + qtd + 'x ' + (nomeDoItem_(d.item) || d.item), -moedas]);
  p.ganhou = moedas; p.pontosPesquisa = pts;
  return p;
}

/* ---------- Segurança: guarda protege a casa por 24h ---------- */
function precoSeguranca_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (funcaoDe_(s.dados) !== 'guarda') return { ok: false, erro: 'Só guardas oferecem segurança.' };
  const preco = Math.floor(Number(d.preco));
  if (!(preco >= 1 && preco <= 100000)) return { ok: false, erro: 'Escolha um preço por dia (pelo menos 1 moeda).' };
  s.aba.getRange(s.linha, C_SEG_PRECO).setValue(preco);
  return { ok: true, preco: preco };
}
function guardasSeguranca_(linhas) {
  return linhas.filter(function (l) { return funcaoDe_(l) === 'guarda' && Number(l[C_SEG_PRECO - 1]) > 0; })
    .map(function (l) { return { numero: l[0], nome: String(l[2]), preco: Number(l[C_SEG_PRECO - 1]), online: Date.now() - (Number(l[C_ON_ULTIMO - 1]) || 0) < PLANTAO_SEGUNDOS * 1000 }; });
}
function contratarSeguranca_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s);
  if (!p.itens.split(',').some(function (i) { return /^lote_/.test(i); })) return { ok: false, erro: 'Você precisa ter um terreno para contratar segurança.' };
  const g = linhaPorNumero_(ss, d.numero);
  if (!g || funcaoDe_(g.dados) !== 'guarda' || !(Number(g.dados[C_SEG_PRECO - 1]) > 0)) return { ok: false, erro: 'Esse guarda não está oferecendo segurança.' };
  if (String(g.dados[0]) === String(p.numero)) return { ok: false, erro: 'Você não pode contratar você mesmo.' };
  const preco = Number(g.dados[C_SEG_PRECO - 1]);
  if (p.moedas < preco) return { ok: false, erro: 'A segurança custa ' + preco + ' moedas por dia e você tem ' + p.moedas + '.' };
  const atual = segurancaDe_(ss, p.numero), ate = Math.max(Date.now(), atual ? atual.ate : 0) + SEGURANCA_HORAS * 3600000;
  p.moedas -= preco; salvarPerfil_(s, p); creditar_(ss, g.dados[0], preco);
  ss.getSheetByName(ABA_SEGURANCA).appendRow([new Date(), p.numero, texto_(String(p.nome)), g.dados[0], texto_(String(g.dados[2])), preco, ate]);
  ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Segurança de ' + g.dados[2] + ' (24h)', preco]);
  avisar_(ss, g.dados[0], '🛡️ ' + p.nome + ' contratou a sua segurança por 24 horas: +' + preco + ' moedas.');
  p.segurancaAte = ate; p.segurancaGuarda = String(g.dados[2]);
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
  return /^lote_\d+$/.test(id) || /^criado_/.test(id) || /^reliquia_[a-z]+_\d+$/.test(id) || id === 'ficha_item' || id === 'ficha_empresa' || id === 'comida' || id === 'refeicao' || achados_().some(function (r) { return r.id === id; }) || ITENS.some(function (i) { return i.id === id && !i.base && !i.fixo && !i.gas && !i.consumivel; });
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
  if (vend) avisar_(ss, vend.dados[0], '🛒 ' + p.nome + ' comprou ' + qtd + 'x ' + (nomeDoItem_(String(o.dados[4])) || o.dados[4]) + ' de você: +' + (preco - taxa) + ' moedas.');
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
  const mochila = tem_(String(l[C_ITENS - 1] || ''), 'mochila') ? 2 : 1; // mochila de oxigênio: o ar dura o dobro
  return Math.max(0, Math.round((Number(l[C_AR - 1]) || 0) - (Date.now() - ts) / 60000 / mochila));
}
function temGas_(l) { return funcaoDe_(l) === 'desempregado' || arDe_(l) > 0; }
function funcaoDe_(l) { let f = String(l[C_FUNCAO - 1] || ''); if (f === 'cozinheiro') f = 'agricultor'; return FUNCOES[f] ? f : (MAPA_PROFISSAO[String(l[C_PROF - 1])] || 'livre'); }
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
function picaretaVelha_(l) { const v = l[C_PICARETA_VELHA - 1]; return v === '' || v == null ? PICARETA_VELHA_USOS : Number(v) || 0; }
function minerar_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  const p = perfilDe_(s);
  const velha = picaretaVelha_(s.dados), usaVelha = !tem_(p.itens, 'picareta');
  if (usaVelha && velha <= 0) return { ok: false, erro: 'Sua picareta velha quebrou. Adquira uma picareta nova no Mercado (Ferramentas) para continuar minerando.' };
  if (!p.gas) return { ok: false, erro: 'Sem gás de oxigênio você está doente e não consegue minerar. Adquira gás no Mercado.' };
  if (loteEm_(Number(d.x), Number(d.y)) !== -1) return { ok: false, erro: 'Aqui é zona de terrenos. Vá para a borda pedregosa do mapa para minerar.' };
  const agora = Date.now(), ultimo = Number(s.dados[C_MINERAR - 1]) || 0;
  const espera = funcaoDe_(s.dados) === 'minerador' ? MINERAR_SEGUNDOS / 2 : MINERAR_SEGUNDOS;
  if (estaDoente_(s.dados)) return { ok: false, erro: 'Você está doente e não consegue minerar agora.' };
  const mc = mineracaoDe_(s.dados);
  if (mc.ate > agora) return { ok: false, cansadoMineracao: true, mineracaoAte: mc.ate, erro: 'Você está cansado de minerar. Descanse ' + Math.ceil((mc.ate - agora) / 60000) + ' minutos ou chame um médico em Serviços.' };
  if (agora - ultimo < espera * 1000) return { ok: false, erro: 'Sua picareta precisa esfriar. Tente de novo em ' + Math.ceil((espera * 1000 - (agora - ultimo)) / 1000) + ' segundos.', espera: Math.ceil((espera * 1000 - (agora - ultimo)) / 1000) };
  s.aba.getRange(s.linha, C_MINERAR).setValue(agora);
  if (usaVelha) s.aba.getRange(s.linha, C_PICARETA_VELHA).setValue(velha - 1);
  const feitas = (agora - ultimo > MINERAR_DESCANSO_MIN * 60000 ? 0 : mc.feitas) + 1, cansou = feitas >= MINERAR_LIMITE;
  const ateM = cansou ? agora + MINERAR_DESCANSO_MIN * 60000 : 0;
  s.aba.getRange(s.linha, C_MINERACAO).setValue((cansou ? 0 : feitas) + '|' + ateM);
  let achou = '';
  if (Math.random() < MINERAR_CHANCE) {
    const x = Math.random();
    if (x < MINERACAO.terra) achou = ITENS_TERRA[Math.floor(Math.random() * ITENS_TERRA.length)].id;
    else if (x < MINERACAO.terra + MINERACAO.cristal) achou = 'cristal';
    else if (x < MINERACAO.terra + MINERACAO.cristal + MINERACAO.pecaNave) achou = 'peca_nave';
    else achou = ITENS_ALIEN[Math.floor(Math.random() * ITENS_ALIEN.length)].id;
  }
  if (achou) {
    p.itens = (p.itens ? p.itens.split(',') : []).concat([achou]).join(',');
    salvarPerfil_(s, p);
    ss.getSheetByName(ABA_COMPRAS).appendRow([new Date(), p.numero, texto_(String(p.nome)), 'Mineração: ' + achou, 0]);
  }
  if (usaVelha) p.picaretaVelha = velha - 1;
  p.achou = achou; p.espera = espera; p.mineradas = feitas; p.mineradasMax = MINERAR_LIMITE; if (cansou) { p.mineracaoAte = ateM; p.cansouMineracao = true; }
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
  avisar_(ss, im.donoNumero, '🔑 ' + p.nome + ' alugou “' + im.nome + '” por ' + ALUGUEL_DIAS + ' dias: +' + (im.preco - taxa) + ' moedas.');
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
  return { ok: true, numero: l[0], nome: l[2], instagram: l[3], rede: String(l[C_REDE - 1] || 'instagram'), profissao: l[4], historia: l[5], visual: String(l[6] || ''),
    itens: String(l[C_ITENS - 1] || ''), veste: vesteDe_(l), desde: new Date(l[C_DATA - 1]).getTime(), moedas: Number(l[C_MOEDAS - 1]) || 0,
    objetivo: String(l[C_OBJETIVO - 1] || ''), amigos: amigos.map(function (n) { return { numero: n, nome: nomes[n] }; }),
    casa: casa, aluga: aluga ? true : false, titulo: String(l[C_TITULO - 1] || ''), lider: String(l[2]).toLowerCase() === LIDER_NOME.toLowerCase(), apoiador: !!Number(l[C_APOIADOR - 1]), gas: temGas_(l), funcao: FUNCOES[funcaoDe_(l)].nome, pontos: Number(l[C_PONTOS - 1]) || 0, conselheiro: conselheiro_(ss, l[0]) };
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
  const agora = Date.now();
  const msgs = linhas_(aba).filter(function (l) {
    const st = String(l[4]).toLowerCase();
    if (st === 'ofensa') return agora - new Date(l[0]).getTime() < CHAT_OFENSA_VISIVEL_SEG * 1000; // visível só por 2 min
    return st !== 'apagado' && st.indexOf('ofensa') < 0;
  }).slice(-60).map(function (l) {
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
  // ofensas: a mensagem aparece no rádio por 2 min (chance de um guarda pegar) e depois some sozinha; depois de algumas, silencia automático
  if (temOfensa_(normal)) {
    const n = (Number(cache.get('ofensas_' + num)) || 0) + 1;
    cache.put('ofensas_' + num, String(n), 21600);
    cache.put(chaveTempo, '1', 4); janela.push(agora); cache.put('janela_' + num, JSON.stringify(janela), 120); cache.put('ultimotexto_' + num, normal, 600);
    ss.getSheetByName(ABA_CHAT).appendRow([new Date(), s.dados[0], texto_(String(s.dados[2])), texto_(texto), 'ofensa']);
    cache.remove('chat');
    if (n >= CHAT_OFENSAS_PARA_SILENCIAR) {
      s.aba.getRange(s.linha, C_MUDO_ATE).setValue(agora + CHAT_SILENCIO_AUTO_MIN * 60000);
      cache.put('ofensas_' + num, '0', 21600);
      cache.put('mudoauto_' + num, '1', CHAT_SILENCIO_AUTO_MIN * 60);
      avisoRadio_(ss, s.dados[2] + ' ficou sem rádio por ' + CHAT_SILENCIO_AUTO_MIN + ' minutos por linguagem ofensiva.');
      return { ok: false, erro: 'Você ficou sem rádio por ' + CHAT_SILENCIO_AUTO_MIN + ' minutos por insistir em linguagem ofensiva.' };
    }
    return { ok: true };
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
  if (ss.getSheetByName(ABA_SILENCIO)) {
    const fl = linhas_(ss.getSheetByName(ABA_SILENCIO)).filter(function (l) { return new Date(l[1]) > desde && /^FLAGRA/.test(String(l[6])); });
    corpo += '\nFLAGRAS DOS GUARDAS (notícia para o vídeo) (' + fl.length + ')\n';
    fl.forEach(function (l) { corpo += 'Guarda ' + l[3] + ' pegou ' + l[5] + ': ' + String(l[6]).replace(/^FLAGRA: /, '') + '\n'; });
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
function cache_limpar_() { CacheService.getScriptCache().remove('chat'); }
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
  avisar_(ss, t.donoNumero, '🏰 ' + s.dados[2] + ' entrou no seu clã: +' + (t.precoEntrada - taxa) + ' moedas.');
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

/* ---------- Outdoor: divulgar um item à venda (tocar no outdoor abre a oferta) ---------- */
function ofertaMinhaAberta_(ss, id, numero) {
  const o = acharOferta_(ss, id);
  return !!o && o.dados[6] === 'aberta' && String(o.dados[2]) === String(numero);
}
function outdoorOferta_(ss, d) {
  const s = acharSobrevivente_(ss, d);
  if (!s) return { ok: false, erro: 'Entre com o seu sobrevivente.' };
  if (!tem_(String(s.dados[C_ITENS - 1] || ''), 'outdoor')) return { ok: false, erro: 'Você não tem outdoor.' };
  const id = d.oferta ? String(d.oferta) : '';
  if (id && !ofertaMinhaAberta_(ss, id, s.dados[0])) return { ok: false, erro: 'Esse item não está mais à venda.' };
  s.aba.getRange(s.linha, C_OUT_OFERTA).setValue(id);
  return { ok: true, oferta: id };
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
  if (o.anuncio) { dono.aba.getRange(dono.linha, C_OUT_ANUNCIO).setValue(''); dono.aba.getRange(dono.linha, C_OUT_ATE).setValue(0); dono.aba.getRange(dono.linha, C_ANUNCIO_OFERTA).setValue(''); }
  else { dono.aba.getRange(dono.linha, C_OUTDOOR).setValue(''); dono.aba.getRange(dono.linha, C_OUT_OFERTA).setValue(''); }
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
  if ((Number(alvo.dados[C_MUDO_ATE - 1]) || 0) > Date.now() && !CacheService.getScriptCache().get('mudoauto_' + alvo.dados[0])) return { ok: false, erro: alvo.dados[2] + ' já está silenciado.' };
  const msgs = linhas_(ss.getSheetByName(ABA_CHAT)).filter(function (l) { return String(l[1]) === String(alvo.dados[0]); }).slice(-5).map(function (l) { return String(l[3]); }).join(' / ');
  alvo.aba.getRange(alvo.linha, C_MUDO_ATE).setValue(Date.now() + SILENCIO_MINUTOS * 60000);
  // flagrante: a pessoa mandou palavrão que ainda está no rádio → o guarda acertou, ganha o bônus na hora e a mensagem some
  const abaChat = ss.getSheetByName(ABA_CHAT), lsChat = linhas_(abaChat), flagra = [];
  lsChat.forEach(function (l, i) {
    if (String(l[1]) === String(alvo.dados[0]) && String(l[4]).toLowerCase() === 'ofensa' && Date.now() - new Date(l[0]).getTime() < CHAT_OFENSA_VISIVEL_SEG * 1000) {
      flagra.push(String(l[3])); abaChat.getRange(i + 2, 5).setValue('ofensa pega pelo guarda');
    }
  });
  const id = 'S' + Date.now().toString(36).toUpperCase();
  if (flagra.length) {
    creditar_(ss, s.dados[0], GUARDA_BONUS);
    ss.getSheetByName(ABA_SILENCIO).appendRow([id, new Date(), s.dados[0], texto_(String(s.dados[2])), alvo.dados[0], texto_(String(alvo.dados[2])), texto_('FLAGRA: ' + flagra.join(' / ')), '', 'certo', 'flagra: bônus de ' + GUARDA_BONUS + ' pago na hora']);
    avisoRadio_(ss, '🚨 FLAGRA! O guarda ' + s.dados[2] + ' pegou ' + alvo.dados[2] + ' com linguagem ofensiva e silenciou por ' + SILENCIO_MINUTOS + ' minutos. +' + GUARDA_BONUS + ' moedas para o guarda.');
    cache_limpar_();
    return { ok: true, nome: String(alvo.dados[2]), flagra: true, bonus: GUARDA_BONUS };
  }
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
    if (g && dec === 'certo') { creditar_(ss, l[2], GUARDA_BONUS); avisar_(ss, l[2], '👮 Seu silenciamento de ' + l[5] + ' foi aprovado: +' + GUARDA_BONUS + ' moedas.'); }
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
    avisar_(ss, l[2], st === 'aprovado' ? '✨ Sua criação foi aprovada e já está no seu inventário!' : '↩️ Sua criação não foi aprovada. A ficha e as moedas voltaram para você.');
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
    avisar_(ss, a.topo.numero, '🏆 Você venceu o leilão do vídeo! Escreva a frase do anúncio no Mercado → LEILÃO.');
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
  if (a.topo && !meu) { creditar_(ss, a.topo.numero, a.topo.valor); avisar_(ss, a.topo.numero, '🔨 Seu lance no leilão foi superado por ' + s.dados[2] + '. Suas ' + a.topo.valor + ' moedas voltaram.'); } // quem foi superado recebe de volta
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
  return aba.getRange(2, 1, aba.getLastRow() - 1, Math.max(aba.getLastColumn(), 61)).getValues();
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
