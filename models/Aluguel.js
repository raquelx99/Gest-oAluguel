import mongoose from 'mongoose';

const aluguelSchema = new mongoose.Schema({
  prazo: { type: Number, required: true },
  dataLocacao: { type: Date, required: true },
  dataDevolucao: { type: Date, default: null },
  
  livro: {
    id: { type: String, required: true },      
    titulo: { type: String, required: true }
  },

  usuario: {
    id: { type: String, required: true },
    nome: { type: String, required: true }    
  },
}, {
  timestamps: true
});

export const Aluguel = mongoose.model('Aluguel', aluguelSchema);