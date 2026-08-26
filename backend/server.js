const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// 1. Rota para gerar a cobrança (chamada pela tela de Checkout)
app.post('/api/criar-pagamento', async (req, res) => {
  const { nome, valor, mensagem } = req.body;

  try {
    // AQUI ENTRA A CHAMADA DA API DO PAYPAY ANGOLA
    // Exemplo de resposta simulada enquanto configura as chaves de API:
    const respostaPayPay = {
      sucesso: true,
      idTransacao: "PAY-" + Date.now(),
      referencia: "999888777",
      qrCodeUrl: "https://api.paypay.co.ao/qrcode-exemplo.png"
    };

    res.json(respostaPayPay);
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao gerar cobrança no PayPay" });
  }
});

// 2. Webhook: O PayPay Angola chama esta rota automaticamente quando o pagamento é CONFIRMADO
app.post('/api/webhook-paypay', (req, res) => {
  const { status, valor, nomeDoador, mensagem } = req.body;

  // Se o pagamento foi concluído com sucesso
  if (status === 'PAID' || status === 'SUCESSO') {
    // Envia a doação instantaneamente para o OBS
    io.emit('nova-doacao', {
      nome: nomeDoador || 'Anônimo',
      valor: valor,
      mensagem: mensagem,
      anonimo: false
    });
  }

  // Responde ao PayPay que a notificação foi recebida
  res.status(200).send('OK');
});

// Evento de conexão WebSockets
io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado:', socket.id);
});

server.listen(3001, () => {
  console.log('🚀 Servidor rodando em http://localhost:3001');
});