const express = require('express');

const {
  listarEmprendedores,
  buscarCercanos,
  obtenerEmprendedor,
  crearEmprendedor
} = require('../controllers/emprendedores.controller');

const router = express.Router();

router.get('/cercanos', buscarCercanos);
router.get('/', listarEmprendedores);
router.get('/:id', obtenerEmprendedor);
router.post('/', crearEmprendedor);

module.exports = router;