/* Mini Mundo de Cuentos Mágicos · carrusel de YouTube y redes en vivo */
(function () {
  'use strict';

  /* ---------- Carrusel de vídeos: rota solo hasta que el padre pulsa un vídeo ---------- */
  document.querySelectorAll('[data-carrusel]').forEach(function (c) {
    var slides = Array.prototype.slice.call(c.querySelectorAll('.diapositiva'));
    var puntos = Array.prototype.slice.call(c.querySelectorAll('.puntos button'));
    var actual = 0, temporizador = null, parado = false;
    var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mostrar(i) {
      slides[actual].classList.remove('activa');
      puntos[actual] && puntos[actual].removeAttribute('aria-current');
      actual = (i + slides.length) % slides.length;
      slides[actual].classList.add('activa');
      puntos[actual] && puntos[actual].setAttribute('aria-current', 'true');
    }
    function arrancar() { if (!parado && !reducido && slides.length > 1) { parar(); temporizador = setInterval(function () { mostrar(actual + 1); }, 7000); } }
    function parar() { if (temporizador) { clearInterval(temporizador); temporizador = null; } }

    var prev = c.querySelector('[data-prev]'), next = c.querySelector('[data-next]');
    prev && prev.addEventListener('click', function () { mostrar(actual - 1); });
    next && next.addEventListener('click', function () { mostrar(actual + 1); });
    puntos.forEach(function (p, i) { p.addEventListener('click', function () { mostrar(i); }); });
    c.addEventListener('mouseenter', parar);
    c.addEventListener('mouseleave', arrancar);
    c.addEventListener('focusin', parar);

    slides.forEach(function (s) {
      var b = s.querySelector('button');
      if (!b) return;
      b.addEventListener('click', function () {
        parado = true; parar();
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + s.getAttribute('data-id') + '?autoplay=1&rel=0';
        f.title = b.getAttribute('aria-label') || 'YouTube';
        f.allow = 'autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        s.innerHTML = '';
        s.appendChild(f);
      });
    });
    arrancar();
  });

  /* ---------- Franja de novedades: rota despacio, se para al pasar el ratón ---------- */
  document.querySelectorAll('[data-franja]').forEach(function (f) {
    var items = f.querySelectorAll('li'), i = 0, pausa = false;
    if (items.length < 2) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    f.addEventListener('mouseenter', function () { pausa = true; });
    f.addEventListener('mouseleave', function () { pausa = false; });
    f.addEventListener('focusin', function () { pausa = true; });
    f.addEventListener('focusout', function () { pausa = false; });
    setInterval(function () {
      if (pausa) return;
      items[i].classList.remove('activo');
      i = (i + 1) % items.length;
      items[i].classList.add('activo');
    }, 5000);
  });

  /* ---------- Redes en vivo (solo después de que el visitante acepte: usan cookies de terceros) ---------- */
  var CLAVE = 'mm-redes-en-vivo';
  function leer() { try { return localStorage.getItem(CLAVE) === 'si'; } catch (e) { return false; } }
  function guardar() { try { localStorage.setItem(CLAVE, 'si'); } catch (e) {} }
  function script(src, modulo) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src; s.async = true;
    if (modulo) s.type = 'module';
    document.body.appendChild(s);
  }

  function cargarFeeds() {
    document.querySelectorAll('.feed-cuerpo[data-red]').forEach(function (cuerpo) {
      var red = cuerpo.getAttribute('data-red');
      var dato = cuerpo.getAttribute('data-dato') || '';
      if (!dato) return; /* sin configurar: se queda el botón a la cuenta */
      if (red === 'tiktok') {
        cuerpo.innerHTML = '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@' + dato + '" data-unique-id="' + dato + '" data-embed-type="creator" style="max-width:100%;min-width:288px;margin:0"><section></section></blockquote>';
        script('https://www.tiktok.com/embed.js');
      } else if (red === 'pinterest') {
        cuerpo.innerHTML = '<a data-pin-do="embedUser" data-pin-board-width="300" data-pin-scale-height="440" data-pin-scale-width="90" href="https://www.pinterest.com/' + dato + '/"></a>';
        script('https://assets.pinterest.com/js/pinit.js');
      } else if (red === 'instagram') {
        cuerpo.innerHTML = '<div data-behold-id="' + dato + '"></div>';
        script('https://w.behold.so/widget.js', true);
      } else if (red === 'facebook') {
        var f = document.createElement('iframe');
        f.src = 'https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(dato) + '&tabs=timeline&width=320&height=580&small_header=true&adapt_container_width=true&hide_cover=false';
        f.width = '320'; f.height = '580'; f.style.border = '0'; f.style.maxWidth = '100%';
        f.title = 'Facebook'; f.loading = 'lazy';
        cuerpo.innerHTML = ''; cuerpo.appendChild(f);
      }
    });
  }

  var permiso = document.querySelector('[data-permiso]');
  if (permiso) {
    if (leer()) { permiso.hidden = true; cargarFeeds(); }
    var b = permiso.querySelector('button');
    b && b.addEventListener('click', function () { guardar(); permiso.hidden = true; cargarFeeds(); });
  }
})();

// Carrusel de reseñas: avanza solo cada 6 s y se para al pasar el ratón o tocar.
(function () {
  var c = document.querySelector('[data-resenas]');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var pausa = false;
  c.addEventListener('mouseenter', function () { pausa = true; });
  c.addEventListener('mouseleave', function () { pausa = false; });
  c.addEventListener('touchstart', function () { pausa = true; }, { passive: true });
  setInterval(function () {
    if (pausa || c.scrollWidth <= c.clientWidth) return;
    var paso = c.firstElementChild.getBoundingClientRect().width + 20;
    if (c.scrollLeft + c.clientWidth >= c.scrollWidth - 5) c.scrollTo({ left: 0 }); else c.scrollBy({ left: paso });
  }, 6000);
})();