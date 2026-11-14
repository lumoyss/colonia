# Colônia: como colocar o site no ar

Tudo aqui é **grátis**: o site fica no GitHub Pages, os cadastros vão para uma
Planilha Google sua, e o Pix de pessoa física não tem taxa.

O que o site já faz:
- Mostra a colônia ao vivo (mapa pixel art com um bonequinho andando para cada sobrevivente) e o contador "Agora tem X sobreviventes".
- **Entrar**: a pessoa monta o bonequinho (traje, pele, cabelo, capacete), escolhe nome, profissão, @ do Instagram e conta a história dela. Recebe o número de sobrevivente para postar nos stories.
- **Ideias**: qualquer um manda ideias para a história; aparecem num mural.
- **Terrenos**: a pessoa reserva um terreno (R$ 5) ou uma casa (R$ 15) com nome, e o site gera o QR Code Pix na hora. Quando você escrever `pago` na planilha, o lugar aparece no mapa.
- Todo dia às 21h você recebe um e-mail "[Colônia] Resumo" com os novos sobreviventes, ideias e reservas. O Claude lê esse e-mail para montar a história.

---

## Passo 1: criar o repositório no GitHub (1 minuto)

1. Abra https://github.com/new
2. Em **Repository name** escreva `colonia`
3. Deixe marcado **Public**
4. Clique em **Create repository**
5. Avise o Claude. Ele envia o site e liga o GitHub Pages.

O link vai ficar: **https://lumoyss.github.io/colonia**

## Passo 2: criar o "cérebro" que guarda os cadastros (5 minutos)

1. Abra https://script.google.com e clique em **Novo projeto**.
2. Apague o que estiver escrito e cole todo o conteúdo do arquivo `Codigo.gs`.
3. Clique em "Projeto sem título" lá em cima e mude para `Colônia`.
4. Clique no ícone de disquete (Salvar).
5. No menu de cima, ao lado de "Depurar", escolha a função **setup** e clique em **Executar**.
6. Vai aparecer "Autorização necessária":
   - Clique em **Revisar permissões** e escolha sua conta.
   - Se aparecer "O Google não verificou este app", clique em **Avançado** e depois em **Acessar Colônia (não seguro)**. É normal: o app é seu.
   - Clique em **Permitir**.
7. Embaixo vai aparecer "Tudo pronto! Sua planilha: ...". A planilha foi criada no seu Google Drive.
8. Clique em **Implantar** (botão azul, canto de cima) → **Nova implantação**.
9. Na engrenagem ao lado de "Selecione o tipo", escolha **App da Web**.
10. Preencha:
    - Executar como: **Eu**
    - Quem pode acessar: **Qualquer pessoa**
11. Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).
12. Mande esse link para o Claude.

## Passo 3: para vender terrenos (quando quiser)

Mande para o Claude:
- sua chave Pix (e-mail, celular ou chave aleatória; a aleatória mostra menos dados seus)
- seu nome como aparece no banco
- sua cidade
- o @ do Instagram da página

Enquanto isso não for preenchido, a aba Terrenos mostra "em breve".

### Quando alguém comprar
1. A pessoa paga o Pix e manda o comprovante no direct com um código tipo `COLAB12CD`.
2. Abra a planilha, aba **Terrenos**, ache o código e troque o status para `pago`.
3. Em até 1 minuto o lugar aparece no mapa do site.

## Mudar preços ou textos
Os preços e nomes dos planos ficam no arquivo `config.js`. É só pedir ao Claude.

---

## Passo 4: confirmar o Pix sozinho (Mercado Pago)

Com isso o site gera um Pix só daquela reserva, percebe sozinho quando ele foi pago
e constrói a base no mapa na hora. Você não precisa mexer na planilha.
Custo: o Mercado Pago cobra uma taxa pequena por Pix recebido (cerca de 1%, uns 5 centavos numa base de R$ 5).

### A. Pegar o código do Mercado Pago (Access Token)
1. Crie ou entre na sua conta em https://www.mercadopago.com.br
2. Cadastre uma chave Pix **dentro do Mercado Pago** (app do Mercado Pago → Pix → Minhas chaves). Sem isso ele não recebe Pix pelo site.
3. Abra https://www.mercadopago.com.br/developers/panel/app e clique em **Criar aplicação**.
   - Nome: `Colonia`. Tipo: pagamentos online / Checkout Transparente. Quando perguntar o tipo de API, escolha **API de Orders**.
4. Dentro da aplicação, abra **Credenciais de produção**. Se pedir para ativar, preencha o ramo (entretenimento) e o site `https://lumoyss.github.io/colonia`.
5. Copie o **Access Token** (começa com `APP_USR-`). **Não mande esse código para ninguém, nem no chat.**

### B. Colocar no Apps Script
1. Abra o projeto Colônia em https://script.google.com
2. Apague todo o código e cole o novo `Codigo.gs` (pasta apps-script). Salve.
3. Clique na engrenagem (**Configurações do projeto**), desça até **Propriedades do script** → **Adicionar propriedade do script**:
   - Propriedade: `MP_TOKEN`
   - Valor: o Access Token copiado
   - **Salvar propriedades do script**
4. Volte ao código (ícone `< >`), escolha a função **setup** e clique em **Executar**. Vai pedir autorização de novo (agora para falar com o Mercado Pago): permita igual da primeira vez. Embaixo deve aparecer "Mercado Pago ligado".
5. **Implantar** → **Gerenciar implantações** → lápis (editar) → em Versão escolha **Nova versão** → **Implantar**. O link /exec continua o mesmo.

Pronto. Os preços cobrados ficam no topo do `Codigo.gs` (PRECOS) e precisam bater com os do `config.js`.


---

## Mercado, moedas e Rádio da nave (atualização de 13/11)

- A aba **Mercado** substituiu a aba Bases. Primeiro a pessoa adquire moedas (R$ 9,99 = 1.000 moedas; R$ 47 = 5.500 moedas, pago pela InfinitePay) e depois troca as moedas por itens. Ordem do Mercado: registrar terreno, moedas, itens (casa, prédio, outdoor, gás, roupas, roupa dourada, mochila, picareta), anúncios em outdoor, aluguéis e o mercado dos sobreviventes. Todos os preços ficam no topo do `Codigo.gs` (PACOTES, ITENS, TERRENO_PRECO, GAS_PRECO).
- Os preços e os itens ficam no topo do `Codigo.gs` (PACOTES e ITENS). O site lê de lá, então só precisa mudar num lugar.
- Cada sobrevivente ganha um **código de acesso** de 6 letras ao acordar. Com o nome e o código, ele entra no Mercado e no Rádio em qualquer celular.
- A aba **Rádio** é o chat de quem já acordou.
- **Missão: consertar a nave:** com o site aberto e o botão "Consertar a nave" ligado, o sobrevivente ganha 1 moeda a cada minuto. Depois de 4 horas ele cansa: quem mora numa casa (dono ou aluguel) descansa 1 hora; quem não tem casa, 2 horas. Precisa de **gás de oxigênio** (50 moedas, vale até meia-noite; quem acorda ganha o do primeiro dia). Sem gás fica doente e não trabalha nem minera. Números no topo do `Codigo.gs` (MINUTOS_POR_MOEDA, TURNO_MINUTOS, DESCANSO_COM_BASE, DESCANSO_SEM_BASE, GAS_PRECO, GAS_GRATIS_NO_CADASTRO).

- **Exploração e mineração:** o mapa tem 640 x 400. No meio fica a zona dos terrenos; em volta, a borda pedregosa é a **zona de mineração**. Com a **picareta** (300 moedas), o bonequinho parado na zona de mineração mostra o botão MINERAR (1 vez a cada 2 minutos, 40% de chance de achar um recurso). Itens especiais da mineração: coloque os ids em ESPECIAIS no `Codigo.gs`.
- **Baú do dia:** uma vez por dia, numa hora sorteada entre 10h e 21h, aparece um baú no mapa com 3 recursos (cristal, peça da nave, minério, semente, fóssil) e 15% de chance de um item raro (capacete dourado, traje dourado ou mochila). Quem chegar primeiro e tocar em "ABRIR O BAÚ" leva. Números no topo do `Codigo.gs` (BAU_QTD_RECURSOS, BAU_CHANCE_RARO, BAU_RAROS).
- **Terrenos:** 44 terrenos (8 x 6, menos os 4 da nave). A pessoa para dentro de um terreno livre (estacas nos cantos), toca em **REIVINDICAR** e fica 3 minutos; depois volta para a nave e registra no Mercado por **400 moedas**. 1 por pessoa; outros só no mercado dos sobreviventes (taxa de 2% para a colônia na venda de terreno). Para ter casa é preciso ter terreno. Para tirar um terreno de alguém, apague `lote_N` da coluna itens.
- **Outdoor:** 300 moedas, só em terreno **sem construção** (para construir, o dono tira o outdoor, sem reembolso). O dono escreve uma frase de até 40 letras e pode cobrar de outros para anunciar (24 horas por anúncio; a colônia fica com 10%). Para apagar uma frase ruim, limpe as colunas **outdoor** e **anuncio** na aba Sobreviventes.
- **Casa e prédio:** casa oxigenada 500 moedas; prédio com 8 apartamentos 3.000 moedas. O dono escolhe o preço do aluguel por 7 dias (0 = não alugar); quem aluga paga adiantado, e a colônia fica com 1%. Tudo na aba **Alugueis**.
- **Taxas:** 10% de anúncio, 1% de aluguel e 2% de venda de terreno. Se você colocar o número do seu sobrevivente em CONTA_DONO (topo do `Codigo.gs`), as taxas caem nele; senão somam num cofre que aparece no e-mail diário.
- **Ideias:** só quem tem casa construída manda ideia; qualquer sobrevivente acordado pode dar "gostei". A lista mostra as mais curtidas primeiro.
- **Personagem:** masculino ou feminino, 7 tipos de cabelo, retrato grande no cartão. Roupas (boné, chapéu, calça, colete, vestido e a roupa dourada) aparecem no retrato e no mapa; a pessoa veste e tira no cartão.
- **Perfil e amigos:** no Rádio, tocar no nome de alguém abre o perfil (nome, @, há quanto tempo joga, moedas, objetivo, história, amigos) com o botão de adicionar amigo.
- **Mapa com zoom:** botões + e −, dois dedos no celular ou a roda do mouse. Arrastar move o mapa; o botão ◎ volta para o seu bonequinho.
- **Mercado dos sobreviventes:** cada um coloca itens e recursos à venda pelo preço que quiser, em moedas (terrenos podem; bases não podem ser vendidas; máximo 10 ofertas por pessoa). Fica tudo na aba **Ofertas** da planilha. O item fica guardado enquanto está à venda; quem vende pode cancelar e o item volta.

## Profissões, comida e meta da nave (atualização de 13/11, noite)
- **Meta:** todos consertam a nave juntos até 1.000.000 de pontos, em etapas de 50.000. A barra aparece no topo do site. Aba **RANKING**: top 10 da semana (funcionários da semana), top 10 de todos os tempos e top 10 mais ricos.
- **Profissões da nave:** mecânico (2 pontos/min e moeda extra), engenheiro (conserta e constrói casas), agricultor (cultiva comida), cozinheiro (faz refeição com comida), minerador (minera em metade do tempo), explorador, médico (cura na hora; não conserta; precisa estar online), guarda (1 moeda a cada 2 min com o site aberto e +30 por turno de 4h), desempregado (não ganha consertando, não fica doente). Profissões livres consertam por 1 moeda/min. Troca 1 vez por semana. Vagas: 1 médico a cada 20 e 1 guarda a cada 10 sobreviventes.
- **Kit de ferramentas:** 100 moedas, obrigatório para consertar. Quem acorda ganha um kit temporário de 1 dia.
- **Cansaço:** depois de 4 horas de trabalho, descansa 10 min (com casa própria ou alugada) ou 1 hora na nave (sem casa). Site aberto 24h.
- **Comida e ar:** comer a cada 4 horas de trabalho (comida, refeição ou ração da nave por 30). O tanque de ar dura 24h e gasta o dobro trabalhando; enche no Mercado por 50 (só abaixo de 75%). Sem comida ou ar: doente por 1 hora, ou chama um médico (preço mínimo 50, o médico escolhe).
- **Obras:** quem adquire casa paga o preço + mão de obra (casa 100, prédio 500). Um engenheiro de plantão aceita e constrói em 10 minutos e recebe a mão de obra. Se ninguém aceitar em 24 horas, a nave constrói e a mão de obra vai para o cofre. Fica tudo na aba **Obras**.
- **Mudar números:** no topo do `Codigo.gs` (FUNCOES, VAGAS, MEDICO_MIN, KIT_TEMPORARIO_HORAS, META_NAVE, ETAPA_NAVE, MAO_DE_OBRA etc.).

## Torres de clã, guardas, baú e criar (atualização de 13/11, 20h)
- **Mapa maior** com **6 torres escondidas** na borda. Quem chega perto descobre (o rádio avisa todo mundo). O explorador vê um sinal piscando onde há torre escondida.
- **Desbloquear a torre:** ficar perto dela trabalhando. 1 ponto por minuto (explorador 2). Não dá moedas nem conserta a nave. Meta: 10.000 pontos.
- **Dono do clã:** quem mais somou pontos tem 12 horas para pagar 1.000 moedas. Se recusar (ou o prazo acabar), a torre pede mais 500 pontos e o próximo da lista paga 10 a menos, até o mínimo de 800. O dinheiro vai para você (CONTA_DONO ou cofre).
- **Entrar no clã:** o dono escolhe o preço (padrão 100); ele recebe e a colônia fica com 10%. Cada pessoa só pode estar em um clã. Tudo na aba **Torres**.
- **Guardas** silenciam alguém no rádio por 5 minutos (botão 🔇 ao lado da mensagem). O silenciado pode reclamar. As reclamações chegam no e-mail diário; você decide na aba **Silenciados**, coluna **decisao**: escreva `certo` (o guarda ganha 20 moedas) ou `abuso` (o guarda perde a função e o silêncio acaba).
- **Baú do dia:** agora vem com 50 moedas e, às vezes, a ficha **Criar item** (25%) ou **Criar empresa** (5%).
- **Criar item:** com a ficha, a pessoa paga 500 moedas e descreve o item. **Criar empresa:** precisa de terreno, paga 5.000 e descreve a empresa. As ideias chegam no e-mail e ficam na aba **Criacoes**: escreva `aprovado` na coluna **status** e o nome do item em **nome_final** (ele vai para o inventário e pode ser vendido), ou `recusado` (a pessoa recebe as moedas e a ficha de volta).
- **Barrinha de trabalho:** 4 partes em cima do bonequinho, cada uma enche em 15 segundos; cheia, ganha a moeda e o ponto.
- **Como jogar:** explicação em texto logo acima do mapa.

## Leilão do vídeo (atualização de 13/11, 21h)
- No Mercado, **LEILÃO DO VÍDEO**: cada um dá lance em moedas para ter o @ divulgado no próximo vídeo. Lance mínimo 100, cada lance novo tem que ser pelo menos 10 maior. Quem é superado recebe as moedas de volta na hora.
- Fecha **todo dia às 20h** (LEILAO_HORA no topo do `Codigo.gs`). O rádio anuncia o vencedor, as moedas vão para você (CONTA_DONO ou cofre) e um novo leilão começa.
- O vencedor escreve no site o @ e o que quer divulgar. Aparece no e-mail diário e na aba **Leiloes** (coluna frase).

## Baús pequenos (atualização de 13/11, 21h)
- O baú do dia ficou maior e brilhando (com feixe de luz). Continua 1 por dia, com moedas, recursos e às vezes as fichas de criar item/empresa.
- A cada 14 a 16 minutos aparece um **baú pequeno** em algum lugar do mapa, com 40 a 90 moedas. Ele fica no mapa até alguém abrir; no máximo 2 esperando ao mesmo tempo. Números no topo do `Codigo.gs` (BAUZINHO_...).

### Moderação (na planilha)
- Apagar uma mensagem: aba **Chat**, escreva `apagado` na coluna **status** da mensagem.
- Silenciar alguém: aba **Sobreviventes**, escreva `sim` na coluna **banido**.
- Dar ou tirar moedas: aba **Sobreviventes**, mude o número na coluna **moedas**.
- Alguém esqueceu o código: aba **Sobreviventes**, coluna **chave**.

### Para ligar (sempre que o Codigo.gs mudar)
1. No Apps Script, apague o código e cole o `Codigo.gs` novo. Salve.
2. Escolha a função **setup** e clique em **Executar**.
3. **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**. O link continua o mesmo.
