(function () {
  "use strict";

  var DICT = {
    en: {
      "meta.title": "Sandra & Massimo · 8.5.2027",
      "meta.desc": "Saturday 8 May 2027, Torre di Palme and Porto San Giorgio (Le Marche, Italy). The day, getting there, where to stay and RSVP.",
      "skip": "Skip to content",
      "lang.label": "Language",
      "hero.date": "Saturday 8 May 2027",
      "hero.region": "Le Marche, Italy",
      "rsvp.button": "RSVP",
      "alt.lakeClose": "Sandra and Massimo hugging on the snowy shore of a frozen lake",
      "alt.pyramid": "Sandra and Massimo in front of the pyramid at Chichén Itzá",
      "alt.camels": "Sandra and Massimo riding camels in the desert",
      "alt.lakeWide": "Sandra and Massimo standing in the snow at the edge of a frozen lake, with a snowy forest behind",
      "welcome.title": "We can't wait to celebrate our big day with you.",
      "welcome.text": "Everything you need is on this page: the day, how to get here and where to stay.",
      "jump.label": "On this page",
      "day.title": "The day",
      "day.ceremony": "Ceremony",
      "day.church": "Church of Santa Maria a Mare",
      "day.directions": "Directions",
      "day.mapsCeremony": "Church of Santa Maria a Mare on Google Maps",
      "day.from": "From",
      "day.reception": "Reception",
      "day.dressLabel": "Dress code",
      "day.dress": "cocktail attire",
      "day.mapsReception": "Villa Bonaparte on Google Maps",
      "day.shuttleTitle": "Shuttle buses",
      "day.shuttle": "They will take guests to the church and then on to Villa Bonaparte. Time and departure point to be announced.",
      "travel.title": "Getting there",
      "travel.air": "By air",
      "travel.ancona": "The nearest airport: about 75 km, under an hour by car.",
      "travel.pescara": "About 100 km, a little over an hour by car.",
      "travel.bologna": "Bologna",
      "travel.bolognaText": "About 3 hours by train or by car.",
      "travel.rome": "Rome",
      "travel.romeText": "About 3 hours by car, around 5 by train.",
      "travel.train": "By train",
      "travel.trainText": "Porto San Giorgio-Fermo station is on the Adriatic line, with direct trains from Bologna and Milan. From Ancona it takes under an hour.",
      "travel.car": "By car",
      "travel.carText": "A14 motorway, exit Fermo-Porto San Giorgio.",
      "travel.carNote": "We recommend renting a car: public transport between the towns is limited.",
      "stay.title": "Where to stay",
      "stay.intro": "Hotels in Porto San Giorgio, close to the reception.",
      "stay.km06": "0.6 km",
      "stay.km08": "0.8 km",
      "stay.km09": "0.9 km",
      "stay.distHead": "Distance from the reception",
      "stay.gabbiano": "Near the beach, free breakfast, bike rental.",
      "stay.victoria": "Rooftop terrace, bike rental, buffet breakfast.",
      "stay.garden": "Very convenient, room service, a nice bar.",
      "stay.nettuno": "Right by the sea, private balconies, tennis court.",
      "rsvp.title": "Will you be there?",
      "rsvp.text": "Tell us who's coming. We'll email you a confirmation with your personal link.",
      "giftcta.title": "Wish to contribute to our honeymoon?",
      "giftcta.text": "We're going to China! If you'd like to give us something, we've gathered a few ideas for the trip.",
      "giftcta.button": "See the ideas",
      "priv.link": "How we handle your data",
      "foot.privacy": "Privacy",
      "news.optin": "Keep us posted by email if anything changes (times, shuttle…). Only about the wedding.",
      "giftcta.direct": "No ideas needed, we'd simply like to chip in for the trip",
      "g.bank": "Bank transfer",
      "g.holder": "Account holder",
      "g.iban": "IBAN",
      "g.bic": "BIC",
      "g.revolut": "Revolut",
      "g.paypal": "PayPal",
      "g.paypalNote": "Our PayPal account is Swiss: it's free of fees only if you send the amount in Swiss francs (CHF).",
      "g.copy": "Copy",
      "g.copied": "Copied",
      "g.directIntro": "Here's everything you need. If you'd like us to know the gift is from you, write your name in the payment description.",
      "g.directThanks": "Thank you, from both of us!",
      "alt.harbour": "Sandra and Massimo on a harbour wall in winter, with a lighthouse and a lion statue on the water behind them",
      "foot.date": "Saturday 8 May 2027 · Torre di Palme & Porto San Giorgio"
    },

    it: {
      "meta.title": "Sandra & Massimo · 8.5.2027",
      "meta.desc": "Sabato 8 maggio 2027, Torre di Palme e Porto San Giorgio (Marche). Il programma, come arrivare, dove dormire e la conferma di presenza.",
      "skip": "Vai al contenuto",
      "lang.label": "Lingua",
      "hero.date": "Sabato 8 maggio 2027",
      "hero.region": "Marche, Italia",
      "rsvp.button": "Conferma la presenza",
      "alt.lakeClose": "Sandra e Massimo abbracciati sulla riva innevata di un lago ghiacciato",
      "alt.pyramid": "Sandra e Massimo davanti alla piramide di Chichén Itzá",
      "alt.camels": "Sandra e Massimo a dorso di cammello nel deserto",
      "alt.lakeWide": "Sandra e Massimo sulla neve in riva a un lago ghiacciato, con un bosco innevato alle spalle",
      "welcome.title": "Non vediamo l'ora di festeggiare con voi il nostro grande giorno.",
      "welcome.text": "Qui trovate tutto quello che vi serve: il programma, come arrivare e dove dormire.",
      "jump.label": "In questa pagina",
      "day.title": "Il programma",
      "day.ceremony": "Cerimonia",
      "day.church": "Chiesa di Santa Maria a Mare",
      "day.directions": "Indicazioni",
      "day.mapsCeremony": "Chiesa di Santa Maria a Mare su Google Maps",
      "day.from": "Dalle",
      "day.reception": "Ricevimento",
      "day.dressLabel": "Dress code",
      "day.dress": "abito da cocktail",
      "day.mapsReception": "Villa Bonaparte su Google Maps",
      "day.shuttleTitle": "Navette",
      "day.shuttle": "Porteranno gli invitati in chiesa e poi a Villa Bonaparte. Orario e punto di partenza saranno comunicati più avanti.",
      "travel.title": "Come arrivare",
      "travel.air": "In aereo",
      "travel.ancona": "L'aeroporto più vicino: circa 75 km, meno di un'ora in auto.",
      "travel.pescara": "Circa 100 km, poco più di un'ora in auto.",
      "travel.bologna": "Bologna",
      "travel.bolognaText": "Circa 3 ore in treno o in auto.",
      "travel.rome": "Roma",
      "travel.romeText": "Circa 3 ore in auto, circa 5 in treno.",
      "travel.train": "In treno",
      "travel.trainText": "La stazione di Porto San Giorgio-Fermo è sulla linea Adriatica, con treni diretti da Bologna e Milano. Da Ancona si arriva in meno di un'ora.",
      "travel.car": "In auto",
      "travel.carText": "Autostrada A14, uscita Fermo-Porto San Giorgio.",
      "travel.carNote": "Vi consigliamo di noleggiare un'auto: i mezzi pubblici tra i paesi sono pochi.",
      "stay.title": "Dove dormire",
      "stay.intro": "Hotel a Porto San Giorgio, vicino al ricevimento.",
      "stay.km06": "0,6 km",
      "stay.km08": "0,8 km",
      "stay.km09": "0,9 km",
      "stay.distHead": "Distanza dal ricevimento",
      "stay.gabbiano": "Vicino alla spiaggia, colazione inclusa, noleggio bici.",
      "stay.victoria": "Terrazza panoramica, noleggio bici, colazione a buffet.",
      "stay.garden": "Comodissimo, servizio in camera, un bel bar.",
      "stay.nettuno": "Sul mare, balconi privati, campo da tennis.",
      "rsvp.title": "Ci sarete?",
      "rsvp.text": "Diteci chi viene. Vi manderemo via email una conferma con il vostro link personale.",
      "giftcta.title": "Volete contribuire al nostro viaggio di nozze?",
      "giftcta.text": "Andiamo in Cina! Se volete farci un regalo, abbiamo raccolto qualche idea per il viaggio.",
      "giftcta.button": "Scopri le idee",
      "priv.link": "Come trattiamo i vostri dati",
      "foot.privacy": "Privacy",
      "news.optin": "Teneteci aggiornati via email se cambia qualcosa (orari, navette…). Solo sul matrimonio.",
      "giftcta.direct": "Niente idee, vogliamo solo dare il nostro contributo al viaggio",
      "g.bank": "Bonifico",
      "g.holder": "Intestatario",
      "g.iban": "IBAN",
      "g.bic": "BIC",
      "g.revolut": "Revolut",
      "g.paypal": "PayPal",
      "g.paypalNote": "Il nostro conto PayPal è svizzero: è senza commissioni solo se inviate l'importo in franchi svizzeri (CHF).",
      "g.copy": "Copia",
      "g.copied": "Copiato",
      "g.directIntro": "Ecco tutto quello che vi serve. Se volete che sappiamo che il regalo è vostro, scrivete il vostro nome nella causale.",
      "g.directThanks": "Grazie di cuore da parte di tutti e due!",
      "alt.harbour": "Sandra e Massimo sul molo di un porto in inverno, con un faro e la statua di un leone sull'acqua alle spalle",
      "foot.date": "Sabato 8 maggio 2027 · Torre di Palme e Porto San Giorgio"
    },

    es: {
      "meta.title": "Sandra & Massimo · 8.5.2027",
      "meta.desc": "Sábado 8 de mayo de 2027, Torre di Palme y Porto San Giorgio (Las Marcas, Italia). El programa, cómo llegar, dónde alojarse y la confirmación de asistencia.",
      "skip": "Saltar al contenido",
      "lang.label": "Idioma",
      "hero.date": "Sábado, 8 de mayo de 2027",
      "hero.region": "Las Marcas, Italia",
      "rsvp.button": "Confirmar asistencia",
      "alt.lakeClose": "Sandra y Massimo abrazados en la orilla nevada de un lago helado",
      "alt.pyramid": "Sandra y Massimo delante de la pirámide de Chichén Itzá",
      "alt.camels": "Sandra y Massimo montando en camello en el desierto",
      "alt.lakeWide": "Sandra y Massimo sobre la nieve a orillas de un lago helado, con un bosque nevado detrás",
      "welcome.title": "Estamos deseando celebrar con vosotros nuestro gran día.",
      "welcome.text": "Aquí tenéis todo lo que necesitáis: el programa, cómo llegar y dónde alojaros.",
      "jump.label": "En esta página",
      "day.title": "El programa",
      "day.ceremony": "Ceremonia",
      "day.church": "Iglesia de Santa Maria a Mare",
      "day.directions": "Cómo llegar",
      "day.mapsCeremony": "Iglesia de Santa Maria a Mare en Google Maps",
      "day.from": "Desde las",
      "day.reception": "Banquete",
      "day.dressLabel": "Código de vestimenta",
      "day.dress": "cóctel",
      "day.mapsReception": "Villa Bonaparte en Google Maps",
      "day.shuttleTitle": "Autobuses",
      "day.shuttle": "Llevarán a los invitados a la iglesia y después a Villa Bonaparte. La hora y el punto de salida se anunciarán más adelante.",
      "travel.title": "Cómo llegar",
      "travel.air": "En avión",
      "travel.ancona": "El aeropuerto más cercano: a unos 75 km, menos de una hora en coche.",
      "travel.pescara": "A unos 100 km, algo más de una hora en coche.",
      "travel.bologna": "Bolonia",
      "travel.bolognaText": "Unas 3 horas en tren o en coche.",
      "travel.rome": "Roma",
      "travel.romeText": "Unas 3 horas en coche, unas 5 en tren.",
      "travel.train": "En tren",
      "travel.trainText": "La estación de Porto San Giorgio-Fermo está en la línea adriática, con trenes directos desde Bolonia y Milán. Desde Ancona se tarda menos de una hora.",
      "travel.car": "En coche",
      "travel.carText": "Autopista A14, salida Fermo-Porto San Giorgio.",
      "travel.carNote": "Os recomendamos alquilar un coche: el transporte público entre los pueblos es limitado.",
      "stay.title": "Dónde alojarse",
      "stay.intro": "Hoteles en Porto San Giorgio, cerca del banquete.",
      "stay.km06": "0,6 km",
      "stay.km08": "0,8 km",
      "stay.km09": "0,9 km",
      "stay.distHead": "Distancia al banquete",
      "stay.gabbiano": "Cerca de la playa, desayuno incluido, alquiler de bicis.",
      "stay.victoria": "Terraza en la azotea, alquiler de bicis, desayuno bufé.",
      "stay.garden": "Muy práctico, servicio de habitaciones, un buen bar.",
      "stay.nettuno": "Junto al mar, balcones privados, pista de tenis.",
      "rsvp.title": "¿Vendréis?",
      "rsvp.text": "Decidnos quién viene. Os enviaremos por email una confirmación con vuestro enlace personal.",
      "giftcta.title": "¿Queréis contribuir a nuestra luna de miel?",
      "giftcta.text": "¡Nos vamos a China! Si queréis hacernos un regalo, hemos reunido algunas ideas para el viaje.",
      "giftcta.button": "Ver las ideas",
      "priv.link": "Cómo tratamos vuestros datos",
      "foot.privacy": "Privacidad",
      "news.optin": "Mantenednos al día por email si algo cambia (horarios, autobuses…). Solo sobre la boda.",
      "giftcta.direct": "Sin ideas, solo queremos aportar nuestro granito de arena al viaje",
      "g.bank": "Transferencia bancaria",
      "g.holder": "Titular",
      "g.iban": "IBAN",
      "g.bic": "BIC",
      "g.revolut": "Revolut",
      "g.paypal": "PayPal",
      "g.paypalNote": "Nuestra cuenta de PayPal es suiza: no tiene comisiones solo si enviáis el importe en francos suizos (CHF).",
      "g.copy": "Copiar",
      "g.copied": "Copiado",
      "g.directIntro": "Aquí tenéis todo lo necesario. Si queréis que sepamos que el regalo es vuestro, escribid vuestro nombre en el concepto.",
      "g.directThanks": "¡Gracias de corazón de parte de los dos!",
      "alt.harbour": "Sandra y Massimo en el muelle de un puerto en invierno, con un faro y la estatua de un león sobre el agua detrás",
      "foot.date": "Sábado, 8 de mayo de 2027 · Torre di Palme y Porto San Giorgio"
    }
  };

  // Extra page dictionaries (e.g. the honeymoon page) are merged in here.
  if (window.SM_EXTRA) {
    Object.keys(DICT).forEach(function (l) {
      var extra = window.SM_EXTRA[l] || {};
      Object.keys(extra).forEach(function (k) { DICT[l][k] = extra[k]; });
    });
  }

  var LANGS = ["it", "es", "en"];
  var STORE = "sm-lang";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function t(lang, key) {
    var v = DICT[lang][key];
    return v == null ? DICT.en[key] : v;
  }

  function apply(lang) {
    root.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(lang, el.getAttribute("data-i18n"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        var v = t(lang, p[1]);
        if (v != null) el.setAttribute(p[0], v);
      });
    });
    document.title = t(lang, root.getAttribute("data-title-key") || "meta.title");
    // Links to the other page carry the current language along.
    document.querySelectorAll("a[data-keep-lang]").forEach(function (a) {
      a.setAttribute("href", a.getAttribute("data-href") + "#" + lang);
    });
    document.querySelectorAll(".langbar [data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    document.dispatchEvent(new CustomEvent("sm:lang", { detail: lang }));
  }

  window.SM = {
    lang: function () { return root.lang; },
    t: function (key, vars) {
      var s = t(root.lang, key) || key;
      if (vars) Object.keys(vars).forEach(function (v) { s = s.split("{" + v + "}").join(vars[v]); });
      return s;
    }
  };

  function save(lang) {
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function setLang(lang, opts) {
    opts = opts || {};
    if (LANGS.indexOf(lang) < 0 || lang === root.lang && !opts.force) return;
    save(lang);
    if (opts.hash !== false && history.replaceState) history.replaceState(null, "", "#" + lang);
    if (opts.animate && !reduce) {
      root.classList.add("swapping");
      setTimeout(function () { apply(lang); root.classList.remove("swapping"); }, 160);
    } else {
      apply(lang);
    }
  }

  // First paint: the inline head script already picked the language.
  var hash = location.hash.slice(1).toLowerCase();
  if (LANGS.indexOf(hash) > -1) save(hash);
  apply(LANGS.indexOf(root.lang) > -1 ? root.lang : "en");
  requestAnimationFrame(function () { root.classList.add("ready"); });

  document.querySelectorAll(".langbar [data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"), { animate: true });
    });
  });

  window.addEventListener("hashchange", function () {
    var h = location.hash.slice(1).toLowerCase();
    if (LANGS.indexOf(h) > -1) setLang(h, { hash: false, animate: true });
  });

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-drop]").forEach(function (el) { el.classList.add("in"); });
    return;
  }

  // Prints drop in once, when they come into view.
  var once = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); once.unobserve(e.target); }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("[data-drop]").forEach(function (el) { once.observe(el); });

  // Floating RSVP: shown once the hero button has scrolled away, hidden while the closing one is on screen.
  var floatBtn = document.querySelector(".float-rsvp");
  var heroBtn = document.getElementById("hero-rsvp");
  var closeBtn = document.getElementById("close-rsvp");
  if (!floatBtn || !heroBtn || !closeBtn) return;
  var heroGone = false, closeSeen = false;
  function syncFloat() { floatBtn.classList.toggle("is-on", heroGone && !closeSeen); }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.target === heroBtn) heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
      if (e.target === closeBtn) closeSeen = e.isIntersecting || e.boundingClientRect.top < 0;
    });
    syncFloat();
  }).observe(heroBtn);
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { closeSeen = e.isIntersecting || e.boundingClientRect.top < 0; });
    syncFloat();
  }).observe(closeBtn);
})();
