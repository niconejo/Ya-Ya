let mapa;
let marcadorUsuario;
let marcadoresEmprendedores = [];
let ubicacionActual = null;

const lista = document.getElementById('listaEmprendedores');
const mensaje = document.getElementById('mensaje');
const inputBusqueda = document.getElementById('inputBusqueda');
const selectCategoria = document.getElementById('selectCategoria');
const selectRadio = document.getElementById('selectRadio');
const modal = document.getElementById('modalPublicar');
const formPublicar = document.getElementById('formPublicar');

function mostrarMensaje(texto, error = false) {
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.style.color = error ? '#b44939' : '';
}

function iniciarMapa() {
  const contenedorMapa = document.getElementById('mapa');

  if (!contenedorMapa) {
    console.error('No existe el elemento con id="mapa".');
    return;
  }

  if (typeof L === 'undefined') {
    console.error('Leaflet no se cargó correctamente.');
    mostrarMensaje(
      'No se pudo cargar la biblioteca del mapa.',
      true
    );
    return;
  }

  mapa = L.map('mapa').setView(
    [-33.4489, -70.6693],
    12
  );

  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }
  ).addTo(mapa);

  mapa.whenReady(() => {
    console.log('Mapa Leaflet cargado correctamente');
  });

  cargarEmprendedores();
}

function limpiarMarcadores() {
  if (!mapa) return;

  marcadoresEmprendedores.forEach((marcador) => {
    mapa.removeLayer(marcador);
  });

  marcadoresEmprendedores = [];
}

function agregarMarcadorEmprendedor(emprendedor) {
  if (!mapa) return;

  const latitud = Number(emprendedor.latitud);
  const longitud = Number(emprendedor.longitud);

  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    console.warn(
      'Coordenadas inválidas:',
      emprendedor
    );
    return;
  }

  const marcador = L.marker([
    latitud,
    longitud
  ])
    .addTo(mapa)
    .bindPopup(`
      <div class="popup">
        <h3>${escaparHTML(emprendedor.nombre)}</h3>
        <p>${escaparHTML(emprendedor.categoria)}</p>
        <p>
          ${
            emprendedor.distancia_km
              ? `${emprendedor.distancia_km} km de distancia`
              : escaparHTML(emprendedor.direccion || '')
          }
        </p>
      </div>
    `);

  marcadoresEmprendedores.push(marcador);
}

function mostrarUsuario(latitud, longitud) {
  if (!mapa) return;

  if (marcadorUsuario) {
    mapa.removeLayer(marcadorUsuario);
  }

  marcadorUsuario = L.circleMarker(
    [latitud, longitud],
    {
      radius: 9,
      color: '#ffffff',
      weight: 4,
      fillColor: '#24463c',
      fillOpacity: 1
    }
  )
    .addTo(mapa)
    .bindPopup('Tu ubicación aproximada');

  mapa.setView(
    [latitud, longitud],
    13
  );
}

function tarjetaHTML(emprendedor) {
  const distancia = emprendedor.distancia_km
    ? `${emprendedor.distancia_km} km`
    : 'Ubicación disponible';

  const imagen = emprendedor.imagen_url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80';

  return `
    <article class="tarjeta-emprendedor" data-id="${emprendedor.id}">
      <img
        src="${imagen}"
        alt="${escaparHTML(emprendedor.nombre)}"
      >

      <div>
        <p class="categoria">
          ${escaparHTML(emprendedor.categoria)}
        </p>

        <h3>
          ${escaparHTML(emprendedor.nombre)}
        </h3>

        <p>
          ${escaparHTML(emprendedor.descripcion || '')}
        </p>

        <div class="detalle">
          <span>
            ★ ${emprendedor.calificacion || '5.0'}
          </span>

          <span>
            ⌖ ${distancia}
          </span>
        </div>
      </div>
    </article>
  `;
}

function escaparHTML(valor) {
  return String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function cargarEmprendedores() {
  try {
    const parametros = new URLSearchParams();

    const categoria = selectCategoria
      ? selectCategoria.value
      : '';

    const busqueda = inputBusqueda
      ? inputBusqueda.value.trim()
      : '';

    if (categoria) {
      parametros.set('categoria', categoria);
    }

    if (busqueda) {
      parametros.set('busqueda', busqueda);
    }

    let endpoint = '/api/emprendedores';

    if (ubicacionActual) {
      endpoint = '/api/emprendedores/cercanos';

      parametros.set(
        'lat',
        ubicacionActual.lat
      );

      parametros.set(
        'lng',
        ubicacionActual.lng
      );

      parametros.set(
        'radio',
        selectRadio.value
      );
    }

    const respuesta = await fetch(
      `${endpoint}?${parametros.toString()}`
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error ||
        'No se pudieron cargar los emprendimientos'
      );
    }

    if (lista) {
      lista.innerHTML = datos.length
        ? datos.map(tarjetaHTML).join('')
        : '<p class="mensaje">No encontramos emprendimientos.</p>';
    }

    limpiarMarcadores();

    datos.forEach((emprendedor) => {
      agregarMarcadorEmprendedor(emprendedor);
    });

    mostrarMensaje(
      `${datos.length} emprendimiento(s) encontrado(s).`
    );
  } catch (error) {
    console.error('Error cargando emprendedores:', error);
    mostrarMensaje(error.message, true);
  }
}

function solicitarUbicacion() {
  if (!navigator.geolocation) {
    mostrarMensaje(
      'Tu navegador no permite obtener la ubicación.',
      true
    );

    return;
  }

  mostrarMensaje('Solicitando tu ubicación...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      ubicacionActual = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      mostrarUsuario(
        ubicacionActual.lat,
        ubicacionActual.lng
      );

      cargarEmprendedores();
    },
    () => {
      mostrarMensaje(
        'No se pudo obtener tu ubicación. Se mostrarán todos los emprendimientos.',
        true
      );

      cargarEmprendedores();
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

function abrirModal() {
  if (modal) {
    modal.classList.remove('oculto');
  }
}

function cerrarModal() {
  if (modal) {
    modal.classList.add('oculto');
  }

  if (formPublicar) {
    formPublicar.reset();
  }

  const mensajeFormulario =
    document.getElementById('mensajeFormulario');

  if (mensajeFormulario) {
    mensajeFormulario.textContent = '';
  }
}

async function publicarEmprendedor(evento) {
  evento.preventDefault();

  const mensajeFormulario =
    document.getElementById('mensajeFormulario');

  const datos = Object.fromEntries(
    new FormData(formPublicar).entries()
  );

  datos.latitud = Number(datos.latitud);
  datos.longitud = Number(datos.longitud);

  try {
    const respuesta = await fetch(
      '/api/emprendedores',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.error ||
        'No se pudo publicar el emprendimiento'
      );
    }

    mensajeFormulario.style.color = '#24463c';
    mensajeFormulario.textContent =
      '¡Emprendimiento publicado correctamente!';

    formPublicar.reset();
    cargarEmprendedores();
  } catch (error) {
    console.error(error);

    mensajeFormulario.style.color = '#b44939';
    mensajeFormulario.textContent = error.message;
  }
}

const botonUbicacion =
  document.getElementById('btnUbicacion');

if (botonUbicacion) {
  botonUbicacion.addEventListener(
    'click',
    solicitarUbicacion
  );
}

const botonUbicacionHero =
  document.getElementById('btnUbicacionHero');

if (botonUbicacionHero) {
  botonUbicacionHero.addEventListener(
    'click',
    () => {
      document.getElementById('explorar')
        .scrollIntoView({
          behavior: 'smooth'
        });

      solicitarUbicacion();
    }
  );
}

const botonPublicar =
  document.getElementById('btnPublicar');

if (botonPublicar) {
  botonPublicar.addEventListener(
    'click',
    abrirModal
  );
}

const botonCerrarModal =
  document.getElementById('btnCerrarModal');

if (botonCerrarModal) {
  botonCerrarModal.addEventListener(
    'click',
    cerrarModal
  );
}

if (formPublicar) {
  formPublicar.addEventListener(
    'submit',
    publicarEmprendedor
  );
}

if (inputBusqueda) {
  inputBusqueda.addEventListener(
    'input',
    cargarEmprendedores
  );
}

if (selectCategoria) {
  selectCategoria.addEventListener(
    'change',
    cargarEmprendedores
  );
}

if (selectRadio) {
  selectRadio.addEventListener(
    'change',
    () => {
      if (ubicacionActual) {
        cargarEmprendedores();
      }
    }
  );
}

iniciarMapa();