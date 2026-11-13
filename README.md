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

- A aba **Mercado** substituiu a aba Bases. Primeiro a pessoa adquire moedas (R$ 10 = 1.000 moedas, pago pela InfinitePay) e depois troca as moedas por itens: bases, traje dourado, capacete dourado, mochila, ferramentas.
- Os preços e os itens ficam no topo do `Codigo.gs` (PACOTES e ITENS). O site lê de lá, então só precisa mudar num lugar.
- Cada sobrevivente ganha um **código de acesso** de 6 letras ao acordar. Com o nome e o código, ele entra no Mercado e no Rádio em qualquer celular.
- A aba **Rádio** é o chat de quem já acordou.
- **Missão: consertar a nave:** com o site aberto e o botão "Consertar a nave" ligado, o sobrevivente ganha 1 moeda a cada minuto de conserto. A cada 5 minutos ele cansa: com base descansa 1 minuto, sem base 5 minutos. Limite de 4 horas por dia. Os números ficam no topo do `Codigo.gs` (MINUTOS_POR_MOEDA, TURNO_MINUTOS, DESCANSO_COM_BASE, DESCANSO_SEM_BASE, LIMITE_MINUTOS_DIA).

- **Exploração:** o mapa ficou 4x maior. Toque no mapa e o seu bonequinho anda até lá. Explorar não dá moedas.
- **Baú do dia:** uma vez por dia, numa hora sorteada entre 10h e 21h, aparece um baú no mapa com 3 recursos (cristal, peça da nave, minério, semente, fóssil) e 15% de chance de um item raro (capacete dourado, traje dourado ou mochila). Quem chegar primeiro e tocar em "ABRIR O BAÚ" leva. Números no topo do `Codigo.gs` (BAU_QTD_RECURSOS, BAU_CHANCE_RARO, BAU_RAROS).
- **Terrenos:** o mapa é dividido em 44 terrenos (8 x 6, menos os 4 do meio, que são da nave). Para conseguir um, a pessoa para o bonequinho dentro de um terreno livre (estacas nos cantos) por 3 minutos para fazer o reconhecimento, volta para a nave e registra o terreno por 50 moedas. Cada um registra só 1; depois disso, ou quando acabarem os livres, terrenos só no mercado dos sobreviventes. Para ter base é preciso ter terreno: a base é montada dentro dele, e o único terreno de quem tem base não pode ser vendido. Números no topo do `Codigo.gs` (TERRENO_PRECO, TERRENO_MINUTOS, TERRENOS_POR_PESSOA, LOTES_DA_NAVE). Para tirar um terreno de alguém, apague `lote_N` da coluna itens.
- **Outdoor:** item de 300 moedas no Mercado (precisa de terreno). A pessoa escreve uma frase de até 40 letras que aparece numa placa no terreno dela, e pode trocar quando quiser. Não pode ser vendido. Para apagar uma frase ruim, limpe a célula da coluna **outdoor** na aba Sobreviventes.
- **Mapa com zoom:** botões + e −, dois dedos no celular ou a roda do mouse. Arrastar move o mapa; o botão ◎ volta para o seu bonequinho.
- **Mercado dos sobreviventes:** cada um coloca itens e recursos à venda pelo preço que quiser, em moedas (terrenos podem; bases não podem ser vendidas; máximo 10 ofertas por pessoa). Fica tudo na aba **Ofertas** da planilha. O item fica guardado enquanto está à venda; quem vende pode cancelar e o item volta.

### Moderação (na planilha)
- Apagar uma mensagem: aba **Chat**, escreva `apagado` na coluna **status** da mensagem.
- Silenciar alguém: aba **Sobreviventes**, escreva `sim` na coluna **banido**.
- Dar ou tirar moedas: aba **Sobreviventes**, mude o número na coluna **moedas**.
- Alguém esqueceu o código: aba **Sobreviventes**, coluna **chave**.

### Para ligar (sempre que o Codigo.gs mudar)
1. No Apps Script, apague o código e cole o `Codigo.gs` novo. Salve.
2. Escolha a função **setup** e clique em **Executar**.
3. **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**. O link continua o mesmo.
