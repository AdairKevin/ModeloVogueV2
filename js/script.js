/* =====================================================
   SCRIPT.JS
   Invitación NYAH · XV Edition (versión premium)
   Todo lo que cambia entre invitaciones está en CONFIG.
===================================================== */

/* ---------------- CONFIGURACIÓN ----------------
   Todo viene de contenido.json (lo carga motor.js en window.INVITACION):
   la fecha en evento.inicio, el WhatsApp en confirmacion.whatsapp,
   los links de mapas en ubicaciones.pases y los nombres de meses y días en textosFecha. */
var DATOS = window.INVITACION;
var CONFIG = {
  fecha: (function () {
    var d = new Date(DATOS.evento.inicio);
    return { anio: d.getFullYear(), mes: d.getMonth() + 1, dia: d.getDate(), hora: d.getHours(), minuto: d.getMinutes() };
  })(),
  duracionHoras: DATOS.evento.duracionHoras,

  titulo: DATOS.evento.tituloCalendario,
  descripcion: DATOS.evento.detallesCalendario,
  lugar: DATOS.evento.lugarCalendario,

  whatsapp: DATOS.confirmacion.whatsapp,
  mensajeWhatsapp: DATOS.confirmacion.mensajeWhatsapp,

  // Los links de mapas ya vienen en el HTML desde contenido.json
  mapas: [],
};

var MESES = DATOS.textosFecha.meses;
var MESES_CORTO = DATOS.textosFecha.mesesCortos;
var DIAS = DATOS.textosFecha.dias;

/* ---------------- UTILIDADES ---------------- */
function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
  return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
}
function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function aleatorio(min, max) {
  return Math.random() * (max - min) + min;
}
function reducirMovimiento() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function fechaEvento() {
  var f = CONFIG.fecha;
  return new Date(f.anio, f.mes - 1, f.dia, f.hora, f.minuto, 0);
}

/* ---------------- PARTÍCULAS ---------------- */
// tipo: "burbuja" (suben como champagne) | "destello" (estrellitas que parpadean)
function generarParticulas(contenedor, cantidad, tipo, color) {
  if (!contenedor || reducirMovimiento()) return;
  var alto = contenedor.clientHeight || window.innerHeight;
  contenedor.style.setProperty("--rise", alto + 30 + "px");

  for (var i = 0; i < cantidad; i++) {
    var el = document.createElement("span");
    el.className = tipo === "destello" ? "destello" : "particula";
    el.style.left = aleatorio(2, 98) + "%";

    if (tipo === "destello") {
      el.style.top = aleatorio(4, 92) + "%";
      el.style.setProperty("--size", aleatorio(8, 17) + "px");
      el.style.setProperty("--dur", aleatorio(2.4, 4.6) + "s");
      el.style.setProperty("--delay", aleatorio(0, 5) + "s");
      if (color) el.style.setProperty("--c", color);
    } else {
      el.style.setProperty("--size", aleatorio(3, 9) + "px");
      el.style.setProperty("--dur", aleatorio(8, 15) + "s");
      el.style.setProperty("--delay", aleatorio(0, 10) + "s");
      el.style.setProperty("--dx", aleatorio(-30, 30) + "px");
      el.style.setProperty("--op", aleatorio(0.4, 0.9).toFixed(2));
    }
    contenedor.appendChild(el);
  }
}

/* ---------------- MÚSICA ---------------- */
var Musica = (function () {
  var audio, boton, sonando, estabaSonando;

  function marcar(on) {
    sonando = on;
    if (!boton) return;
    boton.classList.toggle("playing", on);
    boton.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function reproducir() {
    if (!audio) return;
    var p;
    try {
      p = audio.play();
    } catch (e) {
      return;
    }
    if (p && p.then) {
      p.then(function () {
        marcar(true);
      }).catch(function () {
        marcar(false);
      });
    } else {
      marcar(true);
    }
  }

  function pausar() {
    if (!audio) return;
    audio.pause();
    marcar(false);
  }

  function init() {
    audio = $("#backgroundMusic");
    boton = $("#musicBtn");
    if (!audio || !boton) return;

    // Si el archivo de audio no existe, se oculta el botón
    var fuente = $("source", audio);
    if (fuente) {
      fuente.addEventListener("error", function () {
        boton.classList.add("sin-musica");
      });
    }

    boton.addEventListener("click", function () {
      if (sonando) pausar();
      else reproducir();
    });

    // Pausa al cambiar de pestaña y retoma al volver
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        estabaSonando = sonando;
        if (sonando) pausar();
      } else if (estabaSonando) {
        reproducir();
      }
    });
  }

  return { init: init, reproducir: reproducir };
})();

/* ---------------- FECHA, CALENDARIO Y ENLACES ---------------- */
var Fecha = (function () {
  function textoCorto(d) {
    return (
      pad(d.getDate()) + " " + MESES_CORTO[d.getMonth()] + " " + d.getFullYear()
    );
  }

  function fechaGoogle(d) {
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  }

  function textos() {
    var d = fechaEvento();
    var dia = $("#fechaDia");
    var txt = $("#fechaTexto");
    if (dia) dia.textContent = DIAS[d.getDay()];
    if (txt)
      txt.textContent =
        MESES[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();

    $$("[data-fecha-corta]").forEach(function (el) {
      el.textContent = textoCorto(d);
    });
  }

  function calendario() {
    var cont = $("#calendario");
    if (!cont) return;
    var d = fechaEvento();
    var anio = d.getFullYear();
    var mes = d.getMonth();

    var titulo = $("#calendarioTitulo");
    if (titulo) titulo.textContent = MESES[mes] + " " + anio;

    cont.innerHTML = "";
    DATOS.textosFecha.diasCalendario.forEach(function (n) {
      var el = document.createElement("div");
      el.className = "day-name";
      el.textContent = n;
      cont.appendChild(el);
    });

    // La semana empieza en lunes
    var primero = (new Date(anio, mes, 1).getDay() + 6) % 7;
    var total = new Date(anio, mes + 1, 0).getDate();

    for (var v = 0; v < primero; v++) {
      var vacio = document.createElement("div");
      vacio.className = "empty";
      cont.appendChild(vacio);
    }
    for (var n = 1; n <= total; n++) {
      var celda = document.createElement("div");
      celda.textContent = n;
      if (n === d.getDate()) celda.className = "event-day";
      cont.appendChild(celda);
    }
  }

  function enlaces() {
    var ini = fechaEvento();
    var fin = new Date(ini.getTime() + CONFIG.duracionHoras * 3600 * 1000);

    var btn = $("#btnCalendario");
    if (btn) {
      btn.href =
        "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" +
        encodeURIComponent(CONFIG.titulo) +
        "&dates=" +
        fechaGoogle(ini) +
        "/" +
        fechaGoogle(fin) +
        "&details=" +
        encodeURIComponent(CONFIG.descripcion) +
        "&location=" +
        encodeURIComponent(CONFIG.lugar);
    }

    $$("[data-mapa]").forEach(function (a, i) {
      var url = CONFIG.mapas[i];
      if (url) {
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });

    var rsvp = $("#rsvpLink");
    if (rsvp && CONFIG.whatsapp) {
      rsvp.href =
        "https://wa.me/" +
        CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(CONFIG.mensajeWhatsapp);
    }
  }

  function init() {
    textos();
    calendario();
    enlaces();
  }

  return { init: init };
})();

/* ---------------- CUENTA REGRESIVA ---------------- */
var Cuenta = (function () {
  var els,
    previos = {};

  function poner(clave, valor) {
    var el = els[clave];
    if (!el || previos[clave] === valor) return;
    el.textContent = valor;
    previos[clave] = valor;
    el.classList.remove("tick");
    void el.offsetWidth; // reinicia la animación
    el.classList.add("tick");
  }

  function actualizar() {
    var resta = fechaEvento().getTime() - Date.now();
    if (resta <= 0) {
      var t = $(".timer-titulo");
      if (t) t.textContent = DATOS.textosFecha.hoy;
      poner("dias", "0");
      poner("horas", "00");
      poner("minutos", "00");
      poner("segundos", "00");
      return false;
    }
    var s = Math.floor(resta / 1000);
    poner("dias", "" + Math.floor(s / 86400));
    poner("horas", pad(Math.floor((s % 86400) / 3600)));
    poner("minutos", pad(Math.floor((s % 3600) / 60)));
    poner("segundos", pad(s % 60));
    return true;
  }

  function init() {
    els = {
      dias: $("#dias"),
      horas: $("#horas"),
      minutos: $("#minutos"),
      segundos: $("#segundos"),
    };
    if (!els.dias) return;
    if (!actualizar()) return;
    var id = setInterval(function () {
      if (!actualizar()) clearInterval(id);
    }, 1000);
  }

  return { init: init };
})();

/* ---------------- SCROLL REVEAL ---------------- */
var Reveal = (function () {
  // [selector, variante, retraso entre elementos (s)]
  var MAPA = [
    ["#name .name-xv", "zoom", 0],
    ["#name .edition-xv", "up", 0],
    ["#name .edition-year", "up", 0],
    ["#welcome .editorial-label", "up", 0],
    ["#welcome .editorial-message", "up", 0],
    [".container-fotos img", "wipe", 0.25],
    [".fecha h1", "up", 0],
    [".fecha h2", "up", 0],
    [".timer", "up", 0],
    ["#calendar .editorial-header > *", "up", 0.12],
    [".calendar", "up", 0],
    [".btn-calendar", "up", 0],
    [".editorial-heading > *", "up", 0.14],
    [".editorial-photo img", "wipe", 0],
    [".editorial-photo figcaption", "up", 0],
    [".editorial-article p", "up", 0.12],
    [".collage .card", "zoom", 0.15],
    [".familia-container > *", "up", 0.1],
    [".familia-item", "up", 0.2],
    [".schedule-header > *", "up", 0.12],
    [".schedule-item", "left", 0.12],
    [".ubicacionHero", "zoom", 0],
    [".section-title > *", "up", 0.12],
    [".boarding-pass", "up", 0.1],
    [".dresscode-heading > *", "up", 0.12],
    [".dresscode-card", "zoom", 0],
    [".gifts-heading > *", "up", 0.12],
    [".gifts-card", "zoom", 0],
    [".rsvp-card", "zoom", 0],
    [".social-section > *", "up", 0.12],
    [".mirai-footer > *", "up", 0.1],
  ];

  function preparar() {
    var lista = [];
    MAPA.forEach(function (m) {
      $$(m[0]).forEach(function (el, i) {
        if (el.classList.contains("reveal")) return;
        el.classList.add("reveal");
        if (m[1] !== "up") el.classList.add("reveal-" + m[1]);
        if (m[2]) el.style.setProperty("--d", (i * m[2]).toFixed(2) + "s");
        lista.push(el);
      });
    });
    return lista;
  }

  function mostrar(el) {
    el.classList.add("visible");
    var d = parseFloat(el.style.getPropertyValue("--d")) || 0;
    setTimeout(
      function () {
        el.classList.add("listo");
      },
      (d + 1.4) * 1000,
    );
  }

  function init() {
    var lista = preparar();
    if (!("IntersectionObserver" in window) || reducirMovimiento()) {
      lista.forEach(function (el) {
        el.classList.add("visible", "listo");
      });
      return;
    }
    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            (e.target.__reveal || [e.target]).forEach(mostrar);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    lista.forEach(function (el) {
      // Con clip-path el elemento "no tiene área visible" y el observer
      // nunca lo detecta: para las fotos con cortina se observa al padre.
      var alvo = el.classList.contains("reveal-wipe") ? el.parentElement : el;
      if (alvo !== el) {
        alvo.__reveal = (alvo.__reveal || []).concat(el);
      }
      obs.observe(alvo);
    });
  }

  return { init: init };
})();

/* ---------------- SCROLL: PROGRESO Y PARALLAX ---------------- */
var Scroll = (function () {
  var barra,
    hero,
    ticking = false;

  function pintar() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (barra) barra.style.scale = (max > 0 ? Math.min(y / max, 1) : 0) + " 1";
    if (hero && y < 900 && !reducirMovimiento()) {
      hero.style.setProperty("--py", (y * 0.22).toFixed(1) + "px");
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(pintar);
    }
  }

  function init() {
    barra = $("#progreso");
    hero = $("#hero .hero");
    window.addEventListener("scroll", onScroll, { passive: true });
    pintar();
  }

  return { init: init };
})();

/* ---------------- SOBRE VIRTUAL ---------------- */
var Sobre = (function () {
  var abierto = false;

  function mostrarInvitacion(pantalla, contenido) {
    contenido.classList.remove("hidden");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    pantalla.classList.add("fade-out");

    // Doble rAF: fuerza el reflow para que la entrada del hero se anime
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var hero = $("#hero");
        if (hero) hero.classList.add("hero-activo");
        generarParticulas($("#heroFx"), 14, "burbuja");
        generarParticulas($("#heroFx"), 7, "destello", "#e8a0b4");
        Scroll.init();
      });
    });

    setTimeout(function () {
      pantalla.classList.add("hidden");
    }, 1300);
  }

  function abrir() {
    if (abierto) return;
    abierto = true;

    var pantalla = $("#envelopeScreen");
    var sobre = $("#envelope");
    var contenido = $("#invitationContent");

    sobre.classList.add("open");
    pantalla.classList.add("opening");
    Musica.reproducir(); // el clic cuenta como gesto del usuario

    setTimeout(
      function () {
        mostrarInvitacion(pantalla, contenido);
      },
      reducirMovimiento() ? 100 : 2300,
    );
  }

  function init() {
    var sello = $("#openEnvelope");
    var sobre = $("#envelope");
    if (!sello || !sobre) return;

    generarParticulas($("#sobreFx"), 16, "burbuja");
    generarParticulas($("#sobreFx"), 9, "destello");

    sello.addEventListener("click", abrir);
    sobre.addEventListener("click", abrir);
    sello.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    });
  }

  return { init: init };
})();

/* ---------------- INICIO ---------------- */
(function () {
  function iniciar() {
    Fecha.init();
    Cuenta.init();
    Musica.init();
    Reveal.init();
    Sobre.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
