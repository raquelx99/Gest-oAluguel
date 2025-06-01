import axios from 'axios';
import { Aluguel } from '../models/Aluguel.js';

const USUARIOS_API = 'http://usuarios-service/api/usuarios';
const LIVROS_API = 'http://livros-service/api/livros';
const PAGAMENTOS_API = 'http://pagamentos-service/api/pagamentos';

export const criarAluguel = async (req, res) => {
  try {
    const { usuarioId, livroId, prazo } = req.body;

    const usuarioRes = await axios.get(`${USUARIOS_API}/${usuarioId}`);
    const usuario = usuarioRes.data;

    if (usuario.inadimplente) {
      return res.status(400).json({ mensagem: 'Usuário inadimplente.' });
    }

    const livroRes = await axios.get(`${LIVROS_API}/${livroId}`);
    const livro = livroRes.data;

    if (!livro.disponivel) {
      return res.status(400).json({ mensagem: 'Livro indisponível.' });
    }

    await axios.patch(`${LIVROS_API}/${livroId}`, { disponivel: false });

    const aluguel = new Aluguel({
      prazo,
      dataLocacao: new Date(),
      usuario: { id: usuario.id, nome: usuario.nome },
      livro: { id: livro.id, titulo: livro.titulo }
    });

    await aluguel.save();
    res.status(201).json(aluguel);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar aluguel.', detalhes: error.message });
  }
};

export const listarAlugueis = async (req, res) => {
  try {
    const alugueis = await Aluguel.find();
    res.status(200).json(alugueis);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar aluguéis.' });
  }
};

export const renovarAluguel = async (req, res) => {
  try {
    const { id } = req.params;
    const { novoPrazo } = req.body;

    const aluguel = await Aluguel.findById(id);
    if (!aluguel) return res.status(404).json({ mensagem: 'Aluguel não encontrado.' });
    if (aluguel.dataDevolucao) return res.status(400).json({ mensagem: 'Aluguel já finalizado.' });

    aluguel.prazo = novoPrazo;
    await aluguel.save();
    res.status(200).json({ mensagem: 'Aluguel renovado com sucesso.', aluguel });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao renovar aluguel.' });
  }
};

export const devolverLivro = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataDevolucao } = req.body;

    const aluguel = await Aluguel.findById(id);
    if (!aluguel) return res.status(404).json({ mensagem: 'Aluguel não encontrado.' });

    const diasUsados = Math.ceil((new Date(dataDevolucao) - aluguel.dataLocacao) / (1000 * 60 * 60 * 24));
    const diasPermitidos = parseInt(aluguel.prazo);

    if (diasUsados > diasPermitidos) {
      const diasAtraso = diasUsados - diasPermitidos;
      const valorMulta = diasAtraso * 2.0;

      const pagamentoRes = await axios.post(`${PAGAMENTOS_API}`, {
        tipo: 'MULTA',
        valor: valorMulta
      });

      const pagamento = pagamentoRes.data;
      aluguel.pagamento = pagamento;
    }

    aluguel.dataDevolucao = dataDevolucao;
    await aluguel.save();

    await axios.patch(`${LIVROS_API}/${aluguel.livro.id}`, { disponivel: true });

    res.status(200).json({ mensagem: 'Livro devolvido com sucesso.', aluguel });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao devolver livro.' });
  }
};

export const buscarAluguel = async (req, res) => {
  try {
    const { id } = req.params;
    const aluguel = await Aluguel.findById(id);
    if (!aluguel) return res.status(404).json({ mensagem: 'Aluguel não encontrado.' });
    res.status(200).json(aluguel);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar aluguel.' });
  }
};
