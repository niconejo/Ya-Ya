const express = require('express');
const cors = require('cors');
const path = require('path');

const emprendedoresRoutes = require('./routes/emprendedores.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const carpetaPublic = path.join(__dirname, '..', 'public');

app.use(express.static(carpetaPublic));

app.get('/', (req, res) => {
  res.sendFile(path.join(carpetaPublic, 'index.html'));
});

app.get('/api/salud', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API de Ya-Ya funcionando'
  });
});

app.use('/api/emprendedores', emprendedoresRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Ruta API no encontrada'
    });
  }

  res.sendFile(path.join(carpetaPublic, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

module.exports = app;