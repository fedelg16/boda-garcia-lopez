(function () {
  'use strict';

  // ===========================
  // CONFIG
  // ===========================
  const SUPABASE_URL      = 'https://gdtrjnenqzwbljsrvgnq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_jdXG8_BK0Msv2w9LLcu56Q_bDAZD3aN';
  // ===========================

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const resultEl = document.getElementById('rsvpResult');
  if (!resultEl) return;

  const params = new URLSearchParams(window.location.search);
  const codigo = (params.get('code') || '').toUpperCase().trim();

  if (!codigo) {
    renderState('nocode', 'Para confirmar tu asistencia, usa el enlace personalizado de tu invitación.');
  } else {
    cargar();
  }

  // ===========================
  // Búsqueda
  // ===========================
  async function cargar() {
    resultEl.innerHTML = '<p class="rsvp-loading">Un momento…</p>';

    let data, error;
    try {
      const res = await db
        .from('invitaciones')
        .select('id, cabeza, miembros, cupos, confirmado')
        .eq('codigo', codigo)
        .maybeSingle();
      data  = res.data;
      error = res.error;
    } catch (_) {
      renderState('error', 'Error de conexión. Intenta de nuevo en unos segundos.');
      return;
    }

    if (error) {
      renderState('error', 'Error de conexión. Intenta de nuevo en unos segundos.');
      return;
    }

    if (!data) {
      renderState('notfound', 'Código no encontrado. Verifica tu invitación o escríbenos directamente.');
      return;
    }

    if (data.confirmado === true) {
      renderState('confirmed', '¡Ya confirmaste tu asistencia! Nos vemos el 4 de julio. 🥂');
    } else if (data.confirmado === false) {
      renderState('declined', 'Lamentamos que no puedas acompañarnos.');
    } else {
      renderPendiente(data);
    }
  }

  // ===========================
  // Estados
  // ===========================
  function renderState(type, msg) {
    resultEl.innerHTML =
      '<div class="rsvp-state rsvp-state--' + type + '">' +
        '<p class="rsvp-state-msg">' + escHtml(msg) + '</p>' +
      '</div>';
    fade(resultEl);
  }

  function renderPendiente(inv) {
    const miembros  = Array.isArray(inv.miembros) ? inv.miembros : [];
    const todos     = [inv.cabeza].concat(miembros).filter(Boolean);
    const lugarText = inv.cupos === 1 ? '1 lugar' : inv.cupos + ' lugares';

    const listaHtml = todos.length > 1
      ? '<ul class="rsvp-miembros-list">' +
          todos.map(function (n) { return '<li>' + escHtml(n) + '</li>'; }).join('') +
        '</ul>'
      : '';

    resultEl.innerHTML =
      '<div class="rsvp-greeting">' +
        '<p class="rsvp-greeting-sub">¡Te estábamos esperando!</p>' +
        '<p class="rsvp-greeting-name">Hola, <em>' + escHtml(primerNombre(inv.cabeza)) + '</em></p>' +
        '<p class="rsvp-greeting-cupos">Hemos reservado <strong>' + escHtml(lugarText) + '</strong> para:</p>' +
        listaHtml +
      '</div>' +
      '<form id="rsvpConfirmForm" class="rsvp-form">' +
        '<div class="form-group">' +
          '<label for="rsvpRestricciones">Restricciones alimenticias o alergias <span class="form-optional">· opcional</span></label>' +
          '<textarea id="rsvpRestricciones" rows="3" placeholder="Ej: vegetariano, alérgico al marisco…"></textarea>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="rsvpCancion">¿Qué canción no puede faltar? <span class="form-optional">· opcional</span></label>' +
          '<input type="text" id="rsvpCancion" placeholder="Artista — Canción">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="rsvpMensaje">Mensaje para los novios <span class="form-optional">· opcional</span></label>' +
          '<textarea id="rsvpMensaje" rows="4" placeholder="Algo bonito que quieras contarles…"></textarea>' +
        '</div>' +
        '<p class="form-error" id="rsvpConfirmError"></p>' +
        '<button type="submit" class="rsvp-submit-btn" id="rsvpConfirmBtn">' +
          '<span>Confirmar asistencia</span>' +
          '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</form>';

    fade(resultEl);

    document.getElementById('rsvpConfirmForm').addEventListener('submit', function (e) {
      e.preventDefault();
      confirmar(codigo);
    });
  }

  async function confirmar(codigo) {
    const confirmErr = document.getElementById('rsvpConfirmError');
    const confirmBtn = document.getElementById('rsvpConfirmBtn');

    confirmBtn.disabled = true;
    confirmBtn.querySelector('span').textContent = 'Enviando…';
    confirmErr.style.display = 'none';

    let error;
    try {
      const res = await db
        .from('invitaciones')
        .update({
          confirmado:       true,
          restricciones:    document.getElementById('rsvpRestricciones').value.trim() || null,
          cancion:          document.getElementById('rsvpCancion').value.trim() || null,
          mensaje_invitado: document.getElementById('rsvpMensaje').value.trim() || null,
          confirmed_at:     new Date().toISOString(),
        })
        .eq('codigo', codigo)
        .is('confirmado', null);
      error = res.error;
    } catch (_) {
      error = { message: 'network' };
    }

    if (error) {
      confirmBtn.disabled = false;
      confirmBtn.querySelector('span').textContent = 'Confirmar asistencia';
      confirmErr.textContent = 'Hubo un problema al guardar. Intenta de nuevo.';
      confirmErr.style.display = 'block';
      return;
    }

    resultEl.innerHTML =
      '<div class="rsvp-success">' +
        '<div class="success-monogram">' +
          '<svg viewBox="0 0 100 100" width="70">' +
            '<circle cx="50" cy="50" r="40" stroke="#6b7d3a" stroke-width="0.6" fill="none"/>' +
            '<text x="50" y="58" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="28" font-style="italic" fill="#6b7d3a">S&amp;D</text>' +
          '</svg>' +
        '</div>' +
        '<h3 class="success-title">¡Nos vemos el 4 de julio!</h3>' +
        '<p class="success-text">Tu asistencia ha sido confirmada.<br>Estamos muy emocionados de compartir este día contigo.</p>' +
        '<div class="floral-divider" style="margin-top:1.5rem">' +
          '<svg viewBox="0 0 200 30" width="140">' +
            '<path d="M10 15 Q 50 5, 100 15 T 190 15" stroke="#6b7d3a" stroke-width="0.6" fill="none"/>' +
            '<circle cx="100" cy="15" r="3" fill="#6b7d3a" opacity="0.9"/>' +
            '<circle cx="60" cy="12" r="1.5" fill="#8aa370" opacity="0.8"/>' +
            '<circle cx="140" cy="18" r="1.5" fill="#8aa370" opacity="0.8"/>' +
          '</svg>' +
        '</div>' +
      '</div>';
    fade(resultEl);
  }

  // ===========================
  // Utilidades
  // ===========================
  function primerNombre(nombre) {
    return (nombre || '').trim().split(/\s+/)[0];
  }

  function fade(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
