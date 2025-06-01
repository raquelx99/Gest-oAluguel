import express from 'express';
import {
  criarAluguel,
  listarAlugueis,
  buscarAluguelPorId,
  renovarAluguel,
  devolverLivro
} from '../controllers/AluguelController.js';

const router = express.Router();

router.post('/', criarAluguel);

router.get('/', listarAlugueis);

router.get('/:id', buscarAluguelPorId);

router.put('/:id/renovar', renovarAluguel);

router.post('/:id/devolver', devolverLivro);

export default router;
