// ============================================================
//  CONFIGURAÇÃO DA COLÔNIA — só mexa aqui
// ============================================================
window.COLONIA = {
  // Link do "cérebro" (Google Apps Script). Vazio = modo de teste
  // (os cadastros ficam só no seu navegador, ninguém mais vê).
  API_URL: "https://script.google.com/macros/s/AKfycbwxbLAOoQFzxEyoqHgM4LFplAV7sxuUsRxlOZCv9nHAPO0xTcodDeGYsEeoHIukaKau/exec",

  // Instagram do projeto (sem @)
  INSTAGRAM: "",

  // ---- PIX (para venda de terrenos) ----
  // Deixe PIX_CHAVE vazio para mostrar "em breve" no lugar da loja.
  PIX_CHAVE: "7bf3675b-4bb1-4a4a-9d73-21460e8e8f51",          // ex.: seu e-mail, celular (+5511999999999) ou chave aleatória
  PIX_NOME: "COLONIA",           // seu nome como está no banco (até 25 letras, sem acento)
  PIX_CIDADE: "",         // sua cidade (até 15 letras, sem acento)

  // ---- AO VIVO (Firebase) ----
  // Cole aqui o firebaseConfig do seu projeto Firebase. Vazio (null) = sem mapa ao vivo.
  FIREBASE: null,

  // Quando a colônia conseguir produzir oxigênio, mude para true:
  // os capacetes saem (só fica de capacete quem quiser).
  OXIGENIO_NO_PLANETA: false,

  PLANOS: [
    { id: "base",   nome: "Base oxigenada",        valor: 5,  descricao: "Uma base com oxigênio só sua no mapa, com o nome que você escolher." },
    { id: "grande", nome: "Base grande com placa", valor: 15, descricao: "Base maior com seu nome na placa e citação no próximo vídeo." },
  ],
};
