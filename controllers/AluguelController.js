import axios from 'axios';
import { Aluguel } from '../models/Aluguel.js';

const USUARIOS_API = 'https://servico-usuarios-production.up.railway.app/usuarios';
const LIVROS_API = 'https://miocroservice-books-production.up.railway.app/livros';
const PAGAMENTOS_API = 'https://microsservico-pagamento.onrender.com/api/pagamentos';
const MULTA_POR_DIA = 2.0;

export const criarAluguel = async (req, res) => {
  try {
    const { usuarioId, livroId } = req.body;

    let usuarioRes;
    try {
      usuarioRes = await axios.get(`${USUARIOS_API}/${usuarioId}`);
    } catch (err) {
      console.error('Falha ao buscar usuário:', err.response?.status, err.response?.data);
      return res.status(400).json({ erro: 'Usuário não encontrado ou API inacessível.' });
    }
    const usuario = usuarioRes.data;

    if (usuario.inadimplente) {
      return res.status(400).json({ mensagem: 'Usuário inadimplente.' });
    }

    let livroRes;
    try {
      livroRes = await axios.get(`${LIVROS_API}/${livroId}`);
    } catch (err) {
      console.error('Falha ao buscar livro:', err.response?.status, err.response?.data);
      return res.status(400).json({ erro: 'Livro não encontrado ou API inacessível.' });
    }
    const livro = livroRes.data;

    if (livro.quantidade <= 0) {
      return res.status(400).json({ mensagem: 'Livro indisponível.' });
    }

    const novaQuantidade = livro.quantidade - 1;

    await axios.patch(`${LIVROS_API}/${livroId}`, {
      quantidade: novaQuantidade
    });

    const aluguel = new Aluguel({
      prazo: 15,
      dataLocacao: new Date(),
      usuario: { id: usuario.id, nome: usuario.nome },
      livro:   { id: livro.id,   titulo: livro.titulo }
    });

    await aluguel.save();
    return res.status(201).json(aluguel);

  } catch (error) {
    console.error('Erro em criarAluguel:', error);
    return res.status(500).json({ erro: 'Erro ao criar aluguel.', detalhes: error.message });
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
    const diasPermitidos = aluguel.prazo;

    let resposta = { mensagem: 'Livro devolvido dentro do prazo.', aluguel };

    if (diasUsados > diasPermitidos) {
      const atraso = diasUsados - diasPermitidos;
      const valorMulta = atraso * MULTA_POR_DIA;

      const usuarioId = aluguel.usuario.id;
      try {
        await axios.patch(`${USUARIOS_API}/${usuarioId}/saldo`, { valor: valorMulta });
      } catch (err) {
        console.error('Erro ao atualizar saldo do usuário:', err.response?.status, err.response?.data);
      }

      resposta = {
        mensagem: 'Livro devolvido com atraso e multa aplicada no saldo devedor.',
        aluguel,
        atrasoDias: atraso,
        valorMulta,
        multa: true
      };
    }

    aluguel.dataDevolucao = dataDevolucao;
    await aluguel.save();

    const livroRes = await axios.get(`${LIVROS_API}/${aluguel.livro.id}`);
    const quantidadeAtual = livroRes.data.quantidade;
    const novaQt = quantidadeAtual + 1;
    await axios.patch(`${LIVROS_API}/${aluguel.livro.id}`, { quantidade: novaQt });

    return res.status(200).json(resposta);
  } catch (error) {
    console.error('Erro ao devolver livro:', error);
    return res.status(500).json({ erro: 'Erro ao devolver livro.' });
  }
};

export const buscarAluguelPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const aluguel = await Aluguel.findById(id);
    if (!aluguel) return res.status(404).json({ mensagem: 'Aluguel não encontrado.' });
    res.status(200).json(aluguel);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar aluguel.' });
  }
};