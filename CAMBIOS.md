# Qué cambió en tu invitación (NYAH · XV Edition)

Tu estructura, clases y textos siguen igual. Se agregó una capa de mejoras.

## Archivos
- NUEVO  css/animations.css  → keyframes, partículas, scroll-reveal
- NUEVO  css/premium.css     → refinamientos (se carga después de style.css; si quieres quitar algo, borras su bloque)
- CAMBIO css/envelope.css    → sobre rehecho (carta, solapa en 3D, sello, brillos)
- CAMBIO css/variables.css   → fuentes por <link>, fallback de "Vogue", --color-text-light (no existía), tokens oro rosado
- CAMBIO css/responsive.css  → el sobre ya no se estira en tablet/escritorio
- CAMBIO index.html          → fuentes, meta/OG, carta dentro del sobre, spans en el título, botón de música, ids
- CAMBIO js/script.js        → reescrito (ver abajo)

## Dónde editar
Todo lo que cambia entre invitaciones está en CONFIG, arriba de js/script.js:
fecha, hora, lugar, WhatsApp, enlaces de mapa.

## Bugs corregidos
- El script fallaba (#playBtn/#pauseBtn no existen) y cortaba el JS. Ahora el audio tiene su botón.
- Se quitó el console.log que corría cada segundo.
- Calendario de junio 2027 estaba mal (días corridos); ahora se genera solo desde CONFIG.
- Fechas viejas (05 SEPT 2026, link de Google Calendar 2026) → ahora salen de CONFIG.
- Scroll horizontal en móvil (líneas de la fecha, "MIS XV" de fondo).
- Fuentes Playball/Bodoni/Cormorant/Inter ahora sí se cargan.
- Título "Its Party Time!" se salía de la portada en escritorio.
- Autoplay de música (los navegadores lo bloquean): ahora arranca al tocar el sello.

## Cosas que debes revisar
1. 25 de junio de 2027 cae VIERNES, no sábado. El texto ahora se calcula solo.
   Si la fiesta es sábado, cambia el día en CONFIG.
2. Lugares inconsistentes: "Jardín Las Palmas" (programa), "Jardín Magnolia" (pase) y
   "Salón de Eventos Las Orquídeas" (calendario). Unifícalos.
3. El sello dice "VOGUE CHLOE 15 EDIT CC" (es la imagen que enviaste). Para NYAH
   habría que cambiar assets/img/envelope/selloV.png.
4. WhatsApp vacío: pon el número en CONFIG.whatsapp.
5. assets/music/background.mp3 no venía en lo que envié; sin el archivo el botón de música se oculta solo.
6. La fuente "Vogue" (cdnfonts) no cargó en mi entorno de pruebas; revísala en tu navegador.
