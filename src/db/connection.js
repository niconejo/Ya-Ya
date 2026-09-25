const pool = require('../db/connection');

function numeroValido(valor) {
    return valor !==undefined && valor !== null && Number.isFinite(Number(valor));
}

async function obtenerEmprendedores(req, res) {
    try {
        const {categoria, busqueda} = req.query;
        const condiciones = ['activo = true'];
        const valores = [];

        if (categoria) {
            condiciones.push('categoria = ?');
            valores.push(categoria);
        }

        if (busqueda) {
            condiciones.push('nombre LIKE ? OR descripcion LIKE ?');
            valores.push(`%${busqueda}%`, `%${busqueda}%`);
        }
    
    const resultado = await pool.query(
        `SELECT id, nombre, categoria, descripcion, direccion, telefono, latitud, longitud, clasificacion, imagen_url
        FROM emprendedores 
        WHERE ${condiciones.join(' AND ')}
        ORDER BY nombre ASC`,
        valores
    );

    res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function buscarCercanos(req, res) {
  try {
    const { lat, lng, radio = 5000, categoria, busqueda } = req.query;

    if (!numeroValido(lat) || !numeroValido(lng) || !numeroValido(radio)) {
      return res.status(400).json({
        error: 'Debes enviar lat, lng y radio con valores numéricos'
      });
    }

    const latitud = Number(lat);
    const longitud = Number(lng);
    const radioMetros = Math.min(Math.max(Number(radio), 100), 50000);
    const puntoUsuario = 'ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography';
    const valores = [longitud, latitud, radioMetros];
    const condiciones = [
      'activo = TRUE',
      `ST_DWithin(ubicacion, ${puntoUsuario}, $3)`
    ];

    if (categoria) {
      valores.push(categoria);
      condiciones.push(`categoria = $${valores.length}`);
    }

    if (busqueda) {
      valores.push(`%${busqueda}%`);
      condiciones.push(`(nombre ILIKE $${valores.length} OR descripcion ILIKE $${valores.length})`);
    }

    const resultado = await pool.query(
      `SELECT id, nombre, categoria, descripcion, direccion, telefono,
              latitud, longitud, calificacion, imagen_url,
              ROUND((ST_Distance(ubicacion, ${puntoUsuario}) / 1000)::numeric, 2) AS distancia_km
       FROM emprendedores
       WHERE ${condiciones.join(' AND ')}
       ORDER BY distancia_km ASC`,
      valores
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron buscar emprendedores cercanos' });
  }
}

async function obtenerEmprendedor(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, categoria, descripcion, direccion, telefono,
              latitud, longitud, calificacion, imagen_url
       FROM emprendedores
       WHERE id = $1 AND activo = TRUE`,
      [req.params.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Emprendedor no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener el emprendedor' });
  }
}

async function crearEmprendedor(req, res) {
  try {
    const {
      nombre,
      categoria,
      descripcion,
      direccion,
      telefono,
      latitud,
      longitud,
      imagen_url
    } = req.body;

    if (!nombre || !categoria || !numeroValido(latitud) || !numeroValido(longitud)) {
      return res.status(400).json({
        error: 'nombre, categoria, latitud y longitud son obligatorios'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO emprendedores
       (nombre, categoria, descripcion, direccion, telefono, latitud, longitud, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nombre, categoria, descripcion, direccion, telefono,
                 latitud, longitud, calificacion, imagen_url`,
      [
        nombre,
        categoria,
        descripcion || '',
        direccion || '',
        telefono || '',
        Number(latitud),
        Number(longitud),
        imagen_url || ''
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear el emprendedor' });
  }
}

module.exports = {
  listarEmprendedores,
  buscarCercanos,
  obtenerEmprendedor,
  crearEmprendedor
};