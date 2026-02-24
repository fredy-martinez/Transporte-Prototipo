// Función para mostrar notificación interna tipo Bootstrap
function mostrarNotificacion(mensaje, tipo = 'success', duracion = 3000){
  const container = document.getElementById('alertContainer');
  if(!container) return;

  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
  alerta.role = 'alert';
  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  container.appendChild(alerta);

  // Se borra automáticamente después de "duracion" ms
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alerta);
    bsAlert.close();
  }, duracion);
}


// Selección del modal y botón
const unidadModalEl = document.getElementById('unidadModal');
const btn = document.getElementById('marcarBtn');

let unidadActual = null;

// Función para guardar historial en localStorage
function guardarHistorial(unidad) {
  let historial = JSON.parse(localStorage.getItem('historial')) || [];
  historial.push(unidad);
  localStorage.setItem('historial', JSON.stringify(historial));
}

// Función para cargar historial en historial.html
function cargarHistorial() {
  const historialContainer = document.getElementById('historialContainer');
  if(!historialContainer) return;

  historialContainer.innerHTML = ''; // Limpiar
  const historial = JSON.parse(localStorage.getItem('historial')) || [];
  historial.forEach(u => {
  const card = document.createElement('div');
  card.className = 'card mb-3 shadow-sm unidad-card';
  card.innerHTML = `
    <div class="card-body d-flex align-items-center">
      
      <!-- QR -->
      <div class="me-3">
        <img src="img/qr.png" alt="QR" width="80" class="img-fluid rounded">
      </div>

      <!-- Información -->
      <div>
        <h5 class="card-title mb-1">${u.marca}</h5>
        <p class="fw-bold mb-0">${u.placa}</p>
        <p class="text-muted mb-0">
          <small>Entrada: ${u.horaEntrada} | Salida: ${u.horaSalida}</small>
        </p>
      </div>

    </div>
  `;
    historialContainer.appendChild(card);
  });
}

// Si estamos en historial.html, cargamos automáticamente
cargarHistorial();

// Modal abierto
unidadModalEl.addEventListener('show.bs.modal', (event) => {
  const button = event.relatedTarget;
  unidadActual = button.closest('.unidad-card');

  // Hora actual
  const ahora = new Date();
  const horaActual = `${ahora.getHours().toString().padStart(2,'0')}:${ahora.getMinutes().toString().padStart(2,'0')}:${ahora.getSeconds().toString().padStart(2,'0')}`;

  document.getElementById('horaModal').textContent = horaActual;

  // Estado inicial
  if(!unidadActual.dataset.estado || unidadActual.dataset.estado === 'pendiente'){
    unidadActual.dataset.estado = 'pendiente';
  }

  // Actualizar info modal
  document.getElementById('marcaModal').textContent = unidadActual.querySelector('.card-title').textContent;
  document.getElementById('placaModal').textContent = unidadActual.querySelector('.fw-bold').textContent;
  document.getElementById('anioModal').textContent = "2022";

  // Actualiza botón según estado
  if(unidadActual.dataset.estado === 'entrada'){
    btn.textContent = 'Marcar Salida';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-warning');
  } else {
    btn.textContent = 'Marcar Entrada';
    btn.classList.remove('btn-warning');
    btn.classList.add('btn-success');
  }
});

// Botón Entrada/Salida
btn.addEventListener('click', () => {
  if(!unidadActual) return;
  const modal = bootstrap.Modal.getInstance(unidadModalEl);

  // Marcar Entrada
  if(unidadActual.dataset.estado === 'pendiente'){
    const ahora = new Date();
    const horaEntrada = `${ahora.getHours().toString().padStart(2,'0')}:${ahora.getMinutes().toString().padStart(2,'0')}:${ahora.getSeconds().toString().padStart(2,'0')}`;
    unidadActual.dataset.horaEntrada = horaEntrada;
    unidadActual.dataset.estado = 'entrada';
    mostrarNotificacion(`✅ Entrada registrada para ${unidadActual.dataset.id}`, 'success');

    btn.textContent = 'Marcar Salida';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-warning');

  // Marcar Salida
  } else if(unidadActual.dataset.estado === 'entrada'){
    const ahora = new Date();
    const horaSalida = `${ahora.getHours().toString().padStart(2,'0')}:${ahora.getMinutes().toString().padStart(2,'0')}:${ahora.getSeconds().toString().padStart(2,'0')}`;
    unidadActual.dataset.horaSalida = horaSalida;
    unidadActual.dataset.estado = 'salida';

    mostrarNotificacion(`✅ Salida registrada para ${unidadActual.dataset.id}`);
    modal.hide();

    // Guardar en historial
    const unidadHistorial = {
      id: unidadActual.dataset.id,
      marca: unidadActual.querySelector('.card-title').textContent,
      placa: unidadActual.querySelector('.fw-bold').textContent,
      horaEntrada: unidadActual.dataset.horaEntrada,
      horaSalida: horaSalida
    };
    guardarHistorial(unidadHistorial);

    // Guardar ID como finalizado
    let finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
    finalizadas.push(unidadActual.dataset.id);
    localStorage.setItem('finalizadas', JSON.stringify(finalizadas));

    // Eliminar de pendiente
    unidadActual.remove();
    unidadActual = null;

    // Reiniciar botón
    btn.textContent = 'Marcar Entrada';
    btn.classList.remove('btn-warning');
    btn.classList.add('btn-success');
  }

  // Si estamos en historial.html, recargamos la lista
  cargarHistorial();
});

// Limpiar historial al cerrar sesión
const btnCerrar = document.getElementById('cerrarSesionBtn');
if(btnCerrar){
  btnCerrar.addEventListener('click', () => {
    localStorage.clear(); // borra el historial
  });
}

function filtrarPendientes() {
  const finalizadas = JSON.parse(localStorage.getItem('finalizadas')) || [];
  const cards = document.querySelectorAll('.unidad-card');

  cards.forEach(card => {
    if (finalizadas.includes(card.dataset.id)) {
      card.remove();
    }
  });
}


filtrarPendientes();