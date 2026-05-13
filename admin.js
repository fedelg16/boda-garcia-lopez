var adminToken = null;
var invitacionesData = [];
var editingId = null;

document.addEventListener('DOMContentLoaded', function () {
  var storedToken = sessionStorage.getItem('admin_token');
  if (storedToken) {
    adminToken = storedToken;
    showDashboard();
    return;
  }

  var loginBtn      = document.getElementById('loginBtn');
  var passwordInput = document.getElementById('adminPassword');
  var loginError    = document.getElementById('loginError');

  async function attemptLogin() {
    loginError.textContent = '';
    var password = passwordInput.value;
    try {
      var r = await fetch('/api/invitaciones', {
        headers: { 'Authorization': 'Bearer ' + password },
      });
      if (r.ok) {
        adminToken = password;
        sessionStorage.setItem('admin_token', password);
        showDashboard();
      } else {
        loginError.textContent = 'Contraseña incorrecta.';
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (_) {
      loginError.textContent = 'Error de conexión. Intenta de nuevo.';
    }
  }

  loginBtn.addEventListener('click', attemptLogin);
  passwordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attemptLogin();
    if (loginError.textContent) loginError.textContent = '';
  });
});

// ===========================
// Dashboard
// ===========================
async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display   = 'block';

  await loadInvitaciones();

  document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('admin_token');
    adminToken = null;
    location.reload();
  });

  document.getElementById('reloadBtn').addEventListener('click', loadInvitaciones);
  document.getElementById('exportBtn').addEventListener('click', exportCsv);
  document.getElementById('addGuestBtn').addEventListener('click', agregarInvitacion);
  document.getElementById('addCopyBtn').addEventListener('click', function () {
    var code = document.getElementById('addResultCode').textContent;
    copiar(code, this);
  });

  document.getElementById('addCabeza').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') agregarInvitacion();
  });

  document.getElementById('addMemberBtn').addEventListener('click', function () {
    addMemberField('membersList', true);
    recalcCupos();
  });

  // Delegación de eventos en la tabla
  document.getElementById('rsvpTableBody').addEventListener('click', function (e) {
    var copyBtn   = e.target.closest('[data-action="copy"]');
    var waBtn     = e.target.closest('[data-action="whatsapp"]');
    var editBtn   = e.target.closest('[data-action="edit"]');
    var deleteBtn = e.target.closest('[data-action="delete"]');
    if (copyBtn)   copiar(copyBtn.dataset.code, copyBtn);
    if (waBtn)     mostrarWhatsApp(waBtn.dataset.id);
    if (editBtn)   abrirEdicion(editBtn.dataset.id);
    if (deleteBtn) eliminarInvitacion(deleteBtn.dataset.id, deleteBtn.dataset.cabeza);
  });

  // Modal WhatsApp
  document.getElementById('waModalClose').addEventListener('click', cerrarModal('waModal'));
  document.getElementById('waCloseBtn').addEventListener('click', cerrarModal('waModal'));
  document.getElementById('waCopyBtn').addEventListener('click', function () {
    copiar(document.getElementById('waText').value, this);
  });
  document.getElementById('waModal').addEventListener('click', function (e) {
    if (e.target === this) cerrarModal('waModal')();
  });

  // Modal Editar
  document.getElementById('editModalClose').addEventListener('click', cerrarModal('editModal'));
  document.getElementById('editCancelBtn').addEventListener('click', cerrarModal('editModal'));
  document.getElementById('editSaveBtn').addEventListener('click', guardarEdicion);
  document.getElementById('editAddMemberBtn').addEventListener('click', function () {
    addMemberField('editMembersList', true);
  });
  document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) cerrarModal('editModal')();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      cerrarModal('waModal')();
      cerrarModal('editModal')();
    }
  });
}

// ===========================
// Cargar invitaciones
// ===========================
async function loadInvitaciones() {
  var tbody = document.getElementById('rsvpTableBody');
  tbody.innerHTML = '<tr><td colspan="10" class="table-state-cell">Cargando…</td></tr>';
  resetSummary();

  var r;
  try {
    r = await fetch('/api/invitaciones', {
      headers: { 'Authorization': 'Bearer ' + adminToken },
    });
  } catch (_) {
    tbody.innerHTML = '<tr><td colspan="10" class="table-state-cell table-error">Error de conexión.</td></tr>';
    return;
  }

  if (!r.ok) {
    var err = await r.json().catch(function () { return {}; });
    tbody.innerHTML = '<tr><td colspan="10" class="table-state-cell table-error">Error al cargar: ' + escHtml(err.error || err.message || r.status) + '</td></tr>';
    return;
  }

  invitacionesData = await r.json();
  if (!Array.isArray(invitacionesData)) invitacionesData = [];
  renderSummary(invitacionesData);
  renderTable(invitacionesData);
}

function resetSummary() {
  ['totalInvitaciones','totalConfirmadas','cuposConfirmados','totalPendientes','totalNoAsisten','cuposPendientes']
    .forEach(function (id) { document.getElementById(id).textContent = '—'; });
}

function renderSummary(data) {
  var confirmadas = data.filter(function (r) { return r.confirmado === true; });
  var noAsisten   = data.filter(function (r) { return r.confirmado === false; });
  var pendientes  = data.filter(function (r) { return r.confirmado === null; });
  var cuposConf   = confirmadas.reduce(function (s, r) { return s + (r.cupos || 0); }, 0);
  var cuposPend   = pendientes.reduce(function (s, r) { return s + (r.cupos || 0); }, 0);

  document.getElementById('totalInvitaciones').textContent = data.length;
  document.getElementById('totalConfirmadas').textContent  = confirmadas.length;
  document.getElementById('cuposConfirmados').textContent  = cuposConf;
  document.getElementById('totalPendientes').textContent   = pendientes.length;
  document.getElementById('totalNoAsisten').textContent    = noAsisten.length;
  document.getElementById('cuposPendientes').textContent   = cuposPend;
}

function renderTable(data) {
  var tbody = document.getElementById('rsvpTableBody');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="table-state-cell">No hay invitaciones todavía. Agrega la primera arriba.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(function (r, i) {
    var badge = r.confirmado === true
      ? '<span class="badge badge-confirmed">✅ Confirmado</span>'
      : r.confirmado === false
        ? '<span class="badge badge-declined">❌ No asiste</span>'
        : '<span class="badge badge-pending">⏳ Pendiente</span>';

    var miembros = Array.isArray(r.miembros) ? r.miembros : [];
    var miembrosText = miembros.length > 0
      ? escHtml(miembros.join(', '))
      : '<span class="cell-empty">—</span>';

    return '<tr class="' + (i % 2 === 0 ? 'row-even' : 'row-odd') + '">' +
      '<td class="cell-cabeza">'   + escHtml(r.cabeza) + '</td>' +
      '<td class="cell-miembros">' + miembrosText + '</td>' +
      '<td class="cell-center">'   + (r.cupos || 0) + '</td>' +
      '<td class="cell-code">'     + escHtml(r.codigo) +
        ' <button class="btn-table btn-table-copy" data-action="copy" data-code="' + escHtml(r.codigo) + '" title="Copiar código">copiar</button></td>' +
      '<td>' + badge + '</td>' +
      '<td>' + (r.restricciones    ? escHtml(r.restricciones)    : '<span class="cell-empty">—</span>') + '</td>' +
      '<td>' + (r.cancion          ? escHtml(r.cancion)          : '<span class="cell-empty">—</span>') + '</td>' +
      '<td class="cell-mensaje">'  + (r.mensaje_invitado ? escHtml(r.mensaje_invitado) : '<span class="cell-empty">—</span>') + '</td>' +
      '<td class="cell-date">'     + (r.confirmed_at ? formatDate(r.confirmed_at) : '<span class="cell-empty">—</span>') + '</td>' +
      '<td>' +
        '<button class="btn-table btn-table-wa" data-action="whatsapp" data-id="' + escHtml(r.id) + '" title="WhatsApp">WA</button>' +
        '<button class="btn-table btn-table-edit" data-action="edit" data-id="' + escHtml(r.id) + '" title="Editar">Editar</button>' +
        '<button class="btn-table btn-table-delete" data-action="delete" data-id="' + escHtml(r.id) + '" data-cabeza="' + escHtml(r.cabeza) + '">Eliminar</button>' +
      '</td>' +
      '</tr>';
  }).join('');
}

// ===========================
// Agregar invitación
// ===========================
async function agregarInvitacion() {
  var cabeza   = document.getElementById('addCabeza').value.trim();
  var cupos    = parseInt(document.getElementById('addCupos').value, 10) || 1;
  var miembros = getMemberValues('membersList');
  var errorEl  = document.getElementById('addError');
  var btn      = document.getElementById('addGuestBtn');
  var resultEl = document.getElementById('addResult');

  errorEl.style.display = 'none';
  resultEl.style.display = 'none';

  if (!cabeza) {
    errorEl.textContent = 'Ingresa el nombre de la cabeza de familia.';
    errorEl.style.display = 'block';
    document.getElementById('addCabeza').focus();
    return;
  }

  btn.disabled = true;

  var codigo = null;
  var intentos = 0;

  while (intentos < 5) {
    var candidato = generarCodigo(cabeza);
    var r = await fetch('/api/invitaciones', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cabeza: cabeza,
        miembros: miembros,
        cupos: cupos,
        codigo: candidato,
      }),
    });

    if (r.ok) {
      codigo = candidato;
      break;
    }

    var errBody = await r.json().catch(function () { return {}; });
    var errCode = (Array.isArray(errBody) && errBody[0] && errBody[0].code) || errBody.code;
    // 23505 = unique_violation (código duplicado, reintentar)
    if (errCode !== '23505') {
      var errMsg = (Array.isArray(errBody) && errBody[0] && errBody[0].message) || errBody.message || errBody.error || ('HTTP ' + r.status);
      errorEl.textContent = 'Error al guardar: ' + errMsg;
      errorEl.style.display = 'block';
      btn.disabled = false;
      return;
    }
    intentos++;
  }

  btn.disabled = false;

  if (!codigo) {
    errorEl.textContent = 'No se pudo generar un código único. Intenta de nuevo.';
    errorEl.style.display = 'block';
    return;
  }

  // Limpiar formulario
  document.getElementById('addCabeza').value = '';
  document.getElementById('addCupos').value  = '1';
  document.getElementById('membersList').innerHTML = '';

  document.getElementById('addResultCode').textContent = codigo;
  resultEl.style.display = 'flex';

  await loadInvitaciones();
}

function generarCodigo(cabeza) {
  var partes   = cabeza.trim().split(/\s+/);
  var inicial1 = partes[0].charAt(0).toUpperCase();
  var inicial2 = partes.length > 1
    ? partes[partes.length - 1].charAt(0).toUpperCase()
    : (partes[0].charAt(1) || 'X').toUpperCase();
  var digitos  = String(Math.floor(Math.random() * 9000) + 1000);
  return inicial1 + inicial2 + '-' + digitos;
}

// ===========================
// Integrantes dinámicos
// ===========================
function addMemberField(containerId, removable, value) {
  var container = document.getElementById(containerId);
  var row = document.createElement('div');
  row.className = 'member-row';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'add-input member-input';
  input.placeholder = 'Nombre del integrante';
  input.value = value || '';

  if (containerId === 'membersList') {
    input.addEventListener('input', recalcCupos);
  }

  row.appendChild(input);

  if (removable) {
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-member';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', function () {
      row.remove();
      if (containerId === 'membersList') recalcCupos();
    });
    row.appendChild(removeBtn);
  }

  container.appendChild(row);
  input.focus();
}

function getMemberValues(containerId) {
  var inputs = document.querySelectorAll('#' + containerId + ' .member-input');
  var values = [];
  inputs.forEach(function (input) {
    var v = input.value.trim();
    if (v) values.push(v);
  });
  return values;
}

function recalcCupos() {
  var miembros = getMemberValues('membersList');
  document.getElementById('addCupos').value = 1 + miembros.length;
}

// ===========================
// WhatsApp modal
// ===========================
function mostrarWhatsApp(id) {
  var inv = invitacionesData.find(function (r) { return r.id === id; });
  if (!inv) return;

  var url = window.location.origin + '/?code=' + encodeURIComponent(inv.codigo);
  var cuposText = inv.cupos === 1 ? '1 lugar reservado' : inv.cupos + ' lugares reservados';
  var msg =
    '¡Hola, ' + inv.cabeza + '! 🌿\n\n' +
    'Te invitamos a la boda de *Santiago García & Daniela López* el *sábado 4 de julio de 2026* en Bogotá.\n\n' +
    'Tienes *' + cuposText + '* para este evento.\n\n' +
    'Confirma tu asistencia aquí:\n' +
    '🔗 ' + url + '\n\n' +
    'Por favor responde antes del *18 de junio*.\n\n' +
    '¡Te esperamos con mucho amor! 💚';

  document.getElementById('waText').value = msg;
  document.getElementById('waOpenBtn').href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
  document.getElementById('waModal').style.display = 'flex';
}

// ===========================
// Editar invitación
// ===========================
function abrirEdicion(id) {
  var inv = invitacionesData.find(function (r) { return r.id === id; });
  if (!inv) return;

  editingId = id;
  document.getElementById('editCabeza').value = inv.cabeza;
  document.getElementById('editCupos').value  = inv.cupos || 1;

  var list = document.getElementById('editMembersList');
  list.innerHTML = '';
  var miembros = Array.isArray(inv.miembros) ? inv.miembros : [];
  miembros.forEach(function (m) {
    addMemberField('editMembersList', true, m);
  });

  document.getElementById('editError').style.display = 'none';
  document.getElementById('editModal').style.display = 'flex';
}

async function guardarEdicion() {
  var cabeza   = document.getElementById('editCabeza').value.trim();
  var cupos    = parseInt(document.getElementById('editCupos').value, 10) || 1;
  var miembros = getMemberValues('editMembersList');
  var errorEl  = document.getElementById('editError');
  var saveBtn  = document.getElementById('editSaveBtn');

  errorEl.style.display = 'none';

  if (!cabeza) {
    errorEl.textContent = 'Ingresa el nombre de la cabeza de familia.';
    errorEl.style.display = 'block';
    return;
  }

  saveBtn.disabled = true;
  var originalText = saveBtn.textContent;
  saveBtn.textContent = 'Guardando…';

  var r = await fetch('/api/invitaciones/' + encodeURIComponent(editingId), {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + adminToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cabeza: cabeza, miembros: miembros, cupos: cupos }),
  });

  saveBtn.disabled = false;
  saveBtn.textContent = originalText;

  if (!r.ok) {
    var err = await r.json().catch(function () { return {}; });
    var errMsg = (Array.isArray(err) && err[0] && err[0].message) || err.message || err.error || ('HTTP ' + r.status);
    errorEl.textContent = 'Error al guardar: ' + errMsg;
    errorEl.style.display = 'block';
    return;
  }

  cerrarModal('editModal')();
  await loadInvitaciones();
}

// ===========================
// Eliminar invitación
// ===========================
async function eliminarInvitacion(id, cabeza) {
  if (!confirm('¿Eliminar la invitación de ' + cabeza + '?\nEsta acción no se puede deshacer.')) return;

  var r = await fetch('/api/invitaciones/' + encodeURIComponent(id), {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + adminToken },
  });

  if (!r.ok) {
    alert('Error al eliminar (HTTP ' + r.status + ')');
    return;
  }

  await loadInvitaciones();
}

// ===========================
// Cerrar modales
// ===========================
function cerrarModal(id) {
  return function () {
    document.getElementById(id).style.display = 'none';
  };
}

// ===========================
// Copiar al portapapeles
// ===========================
function copiar(text, btn) {
  var original = btn.textContent;

  function feedback() {
    btn.textContent = '¡Copiado!';
    setTimeout(function () { btn.textContent = original; }, 1800);
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(feedback).catch(function () {
      fallbackCopy(text);
      feedback();
    });
  } else {
    fallbackCopy(text);
    feedback();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// ===========================
// Exportar CSV
// ===========================
function exportCsv() {
  if (invitacionesData.length === 0) return;

  var headers = ['Familia', 'Integrantes', 'Cupos', 'Código', 'Estado', 'Restricciones', 'Canción', 'Mensaje', 'Fecha Confirmación'];

  var rows = invitacionesData.map(function (r) {
    var miembros = Array.isArray(r.miembros) ? r.miembros.join(' | ') : '';
    var estado   = r.confirmado === true ? 'Confirmado' : r.confirmado === false ? 'No asiste' : 'Pendiente';
    return [
      r.cabeza,
      miembros,
      r.cupos || 0,
      r.codigo,
      estado,
      r.restricciones    || '',
      r.cancion          || '',
      r.mensaje_invitado || '',
      r.confirmed_at ? formatDate(r.confirmed_at) : '',
    ];
  });

  var csv = [headers].concat(rows)
    .map(function (row) { return row.map(csvEscape).join(','); })
    .join('\n');

  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'invitaciones-garcia-lopez-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===========================
// Utilidades
// ===========================
function formatDate(iso) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csvEscape(val) {
  var str = String(val == null ? '' : val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
