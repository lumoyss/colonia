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
