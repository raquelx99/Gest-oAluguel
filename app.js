import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import aluguelRoutes from './routes/aluguelRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🟢 MongoDB conectado'))
    .catch((err) => console.error('🔴 Erro ao conectar MongoDB:', err));

// Rotas
app.use('/alugueis', aluguelRoutes);

// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});