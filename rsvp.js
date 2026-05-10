(function () {
  'use strict';

  // ===========================
  // CONFIG — reemplaza con tus credenciales de Supabase
  // ===========================
  const SUPABASE_URL      = 'https://gdtrjnenqzwbljsrvgnq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_jdXG8_BK0Msv2w9LLcu56Q_bDAZD3aN';
  // ===========================

  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const form      = document.getElementById('rsvpForm');
  const submitBtn = document.getElementById('rsvpSubmitBtn');
  const errorEl   = document.getElementById('rsvpError');
  const successEl = document.getElementById('rsvpSuccess');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('rsvpNombre').value.trim();
    if (!nombre) {
      showError('Por favor ingresa tu nombre completo.');
      document.getElementById('rsvpNombre').focus();
      return;
    }

    clearError();
    setLoading(true);

    const { error } = await db.from('rsvps').insert({
      nombre,
      acompanantes:  parseInt(document.getElementById('rsvpAcompanantes').value, 10),
      restricciones: document.getElementById('rsvpRestricciones').value.trim() || null,
      cancion:       document.getElementById('rsvpCancion').value.trim() || null,
      mensaje:       document.getElementById('rsvpMensaje').value.trim() || null,
    });

    setLoading(false);

    if (error) {
      showError('Ocurrió un error al enviar. Por favor intenta de nuevo.');
      console.error('Supabase error:', error);
      return;
    }

    form.style.display = 'none';
    successEl.style.display = 'block';
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.querySelector('span').textContent = on ? 'Enviando…' : 'Confirmar asistencia';
    const icon = submitBtn.querySelector('svg');
    if (icon) icon.style.opacity = on ? '0' : '1';
  }

})();
