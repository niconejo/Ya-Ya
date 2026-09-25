const emprendedores = [
  {
    id: 1,
    nombre: 'Pastelería Dulce Momento',
    categoria: 'Repostería',
    descripcion: 'Tortas, cupcakes y postres personalizados.',
    direccion: 'Providencia, Santiago',
    telefono: '+56 9 1111 1111',
    latitud: -33.4263,
    longitud: -70.6167,
    calificacion: 4.8,
    imagen_url: ''
  },
  {
    id: 2,
    nombre: 'Diseños Luna',
    categoria: 'Diseño',
    descripcion: 'Invitaciones digitales y material gráfico.',
    direccion: 'Ñuñoa, Santiago',
    telefono: '+56 9 2222 2222',
    latitud: -33.4569,
    longitud: -70.5978,
    calificacion: 4.9,
    imagen_url: ''
  },
  {
    id: 3,
    nombre: 'Barbería Central',
    categoria: 'Belleza',
    descripcion: 'Cortes clásicos, modernos y cuidado de barba.',
    direccion: 'Santiago Centro',
    telefono: '+56 9 3333 3333',
    latitud: -33.4489,
    longitud: -70.6693,
    calificacion: 4.6,
    imagen_url: ''
  }
];

function listarEmprendedores(req, res) {
  const { categoria, busqueda } = req.query;

  let resultado = [...emprendedores];

  if (categoria) {
    resultado = resultado.filter(
      (emprendedor) => emprendedor.categoria === categoria
    );
  }

  if (busqueda) {
    const texto = busqueda.toLowerCase();

    resultado = resultado.filter((emprendedor) =>
      emprendedor.nombre.toLowerCase().includes(texto) ||
      emprendedor.descripcion.toLowerCase().includes(texto)
    );
  }

  res.json(resultado);
}

function buscarCercanos(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: 'Debes enviar lat y lng'
    });
  }

  const latitudUsuario = Number(lat);
  const longitudUsuario = Number(lng);

  const resultado = emprendedores.map((emprendedor) => {
    const distancia = calcularDistancia(
      latitudUsuario,
      longitudUsuario,
      emprendedor.latitud,
      emprendedor.longitud
    );

    return {
      ...emprendedor,
      distancia_km: Number(distancia.toFixed(2))
    };
  });

  resultado.sort((a, b) => a.distancia_km - b.distancia_km);

  res.json(resultado);
}

function obtenerEmprendedor(req, res) {
  const emprendedor = emprendedores.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!emprendedor) {
    return res.status(404).json({
      error: 'Emprendedor no encontrado'
    });
  }

  res.json(emprendedor);
}

function crearEmprendedor(req, res) {
  const {
    nombre,
    categoria,
    descripcion,
    direccion,
    telefono,
    latitud,
    longitud
  } = req.body;

  if (!nombre || !categoria || latitud === undefined || longitud === undefined) {
    return res.status(400).json({
      error: 'nombre, categoria, latitud y longitud son obligatorios'
    });
  }

  const nuevoEmprendedor = {
    id: emprendedores.length + 1,
    nombre,
    categoria,
    descripcion: descripcion || '',
    direccion: direccion || '',
    telefono: telefono || '',
    latitud: Number(latitud),
    longitud: Number(longitud),
    calificacion: 5.0,
    imagen_url: ''
  };

  emprendedores.push(nuevoEmprendedor);

  res.status(201).json(nuevoEmprendedor);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const radioTierra = 6371;
  const diferenciaLatitud = gradosARadianes(lat2 - lat1);
  const diferenciaLongitud = gradosARadianes(lon2 - lon1);

  const calculo =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(gradosARadianes(lat1)) *
    Math.cos(gradosARadianes(lat2)) *
    Math.sin(diferenciaLongitud / 2) ** 2;

  const distanciaAngular =
    2 * Math.atan2(Math.sqrt(calculo), Math.sqrt(1 - calculo));

  return radioTierra * distanciaAngular;
}

function gradosARadianes(grados) {
  return grados * (Math.PI / 180);
}

module.exports = {
  listarEmprendedores,
  buscarCercanos,
  obtenerEmprendedor,
  crearEmprendedor
};