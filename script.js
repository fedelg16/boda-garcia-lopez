(function () {
    'use strict';

    // Fecha de la boda: Sábado 4 de Julio de 2026, 3:45 PM
    // (Los meses en JavaScript son 0-indexados: enero=0, julio=6)
    const WEDDING_DATE = new Date(2026, 6, 4, 15, 45, 0);

    // ===========================
    // Apertura del sobre
    // ===========================
    const envelope = document.getElementById('envelope');
    const envelopeScreen = document.getElementById('envelopeScreen');
    const openBtn = document.getElementById('openBtn');
    const invitation = document.getElementById('invitation');

    function openEnvelope() {
        envelope.classList.add('opened');

        setTimeout(() => {
            envelopeScreen.classList.add('hidden');
            invitation.classList.add('visible');
            document.body.style.overflow = 'auto';
        }, 1600);
    }

    document.body.style.overflow = 'hidden';
    openBtn.addEventListener('click', openEnvelope);
    envelope.addEventListener('click', openEnvelope);

    // ===========================
    // Cuenta regresiva
    // ===========================
    const cdDays    = document.getElementById('cdDays');
    const cdHours   = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    function pad(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function updateCount(el, value) {
        const newVal = pad(value);
        if (el.textContent !== newVal) {
            el.style.opacity = '0.3';
            setTimeout(() => {
                el.textContent = newVal;
                el.style.opacity = '1';
            }, 150);
        }
    }

    function updateCountdown() {
        const now = new Date();
        const diff = WEDDING_DATE - now;

        if (diff <= 0) {
            updateCount(cdDays, 0);
            updateCount(cdHours, 0);
            updateCount(cdMinutes, 0);
            updateCount(cdSeconds, 0);
            return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        updateCount(cdDays, days);
        updateCount(cdHours, hours);
        updateCount(cdMinutes, minutes);
        updateCount(cdSeconds, seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===========================
    // Scroll reveal
    // ===========================
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        reveals.forEach((el) => observer.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('visible'));
    }

    // ===========================
    // Parallax suave en decoraciones del hero
    // ===========================
    const cornerDecos = document.querySelectorAll('.corner-deco');

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                cornerDecos.forEach((el, i) => {
                    const speed = i === 0 ? 0.15 : -0.15;
                    el.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

})();
