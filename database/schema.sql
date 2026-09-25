CREATE EXTENSION IF NOT EXISTS postgis;


DROP TABLE IF EXISTS emprendedores;

CREATE TABLE emprendedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT '',
  direccion VARCHAR(250) DEFAULT '',
  telefono VARCHAR(50) DEFAULT '',
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  ubicacion geography(Point, 4326) NOT NULL,
  calificacion DECIMAL(2, 1) DEFAULT 5.0,
  imagen_url TEXT DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX emprendedores_ubicacion_idx
ON emprendedores
USING GIST (ubicacion);

CREATE OR REPLACE FUNCTION actualizar_ubicacion_emprendedor()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ubicacion = ST_SetSRID(
    ST_MakePoint(NEW.longitud, NEW.latitud),
    4326
  )::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_ubicacion
BEFORE INSERT OR UPDATE OF latitud, longitud
ON emprendedores
FOR EACH ROW
EXECUTE FUNCTION actualizar_ubicacion_emprendedor();

INSERT INTO emprendedores
(nombre, categoria, descripcion, direccion, telefono, latitud, longitud, calificacion, imagen_url)
VALUES
(
  'Pastelería Dulce Momento',
  'Repostería',
  'Tortas, cupcakes y postres personalizados para celebraciones.',
  'Providencia, Santiago',
  '+56 9 1111 1111',
  -33.4263,
  -70.6167,
  4.8,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
),
(
  'Diseños Luna',
  'Diseño',
  'Invitaciones digitales y material gráfico para emprendimientos.',
  'Ñuñoa, Santiago',
  '+56 9 2222 2222',
  -33.4569,
  -70.5978,
  4.9,
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80'
),
(
  'Barbería Central',
  'Belleza',
  'Cortes clásicos, modernos y cuidado de barba.',
  'Santiago Centro',
  '+56 9 3333 3333',
  -33.4489,
  -70.6693,
  4.6,
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
),
(
  'Manos Creativas',
  'Artesanía',
  'Productos hechos a mano y regalos personalizados.',
  'La Reina, Santiago',
  '+56 9 4444 4444',
  -33.4428,
  -70.5354,
  4.7,
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80'
);