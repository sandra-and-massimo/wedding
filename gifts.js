(function () {
  "use strict";

  var CFG = window.SM_GIFT_CONFIG || {};
  var DATA = window.SM_GIFTS;
  var INFO = window.SM_GIFT_INFO || {};   // Wikipedia links + photo credits (gifts-credits.js)
  var ICONS = window.SM_ICONS || {};
  var SM = window.SM;
  var root = document.documentElement;
  var STORE = "sm-basket";
  var connected = !!(CFG.supabaseUrl && CFG.supabaseKey);

  var byId = {};
  DATA.items.forEach(function (it) { byId[it.id] = it; });

  var basket = loadBasket();   // { itemId: qty }
  var avail = {};              // { itemId: { max, taken } } for limited items
  var HOLD = "sm-pending";
  var pending = loadPending(); // this guest's own 30-minute hold: { ref, hold: { itemId: qty }, at }

  var $ = function (id) { return document.getElementById(id); };
  var panel = $("ideas-panel"), cart = $("cart"), form = $("pledge"), result = $("result");
  var bar = $("basket-bar"), errBox = $("form-error"), status = $("ideas-status");

  /* ---------- helpers ---------- */
  function lang() { return root.lang || "en"; }
  function t(k, v) { return SM.t(k, v); }
  function L(o) { return (o && (o[lang()] || o.en)) || ""; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    var loc = { en: "en-GB", it: "it-IT", es: "es-ES" }[lang()] || "en-GB";
    return new Intl.NumberFormat(loc, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }
  function icon(name, cls) {
    var paths = ICONS[name] || [];
    return '<svg class="' + (cls || "ic") + '" viewBox="0 0 256 256" aria-hidden="true">' +
      paths.map(function (d) { return '<path d="' + d + '"/>'; }).join("") + "</svg>";
  }
  function remaining(it) {
    if (it.limit == null) return Infinity;
    var a = avail[it.id];
    var max = a ? a.max : it.limit;
    var taken = a ? a.taken : 0;
    var mine = pending && pending.hold[it.id] || 0;   // our own hold is not "taken by someone else"
    return Math.max(0, max - taken + mine);
  }
  function loadPending() {
    try {
      var p = JSON.parse(localStorage.getItem(HOLD) || "null");
      return p && p.ref && Date.now() - p.at < 30 * 60 * 1000 ? p : null;
    } catch (e) { return null; }
  }
  function setPending(p) {
    pending = p;
    try { if (p) localStorage.setItem(HOLD, JSON.stringify(p)); else localStorage.removeItem(HOLD); } catch (e) {}
  }
  function maxOf(it) { return avail[it.id] ? avail[it.id].max : it.limit; }

  function loadBasket() {
    try { var b = JSON.parse(localStorage.getItem(STORE) || "{}"); return b && typeof b === "object" ? b : {}; }
    catch (e) { return {}; }
  }
  function saveBasket() { try { localStorage.setItem(STORE, JSON.stringify(basket)); } catch (e) {} }
  function setQty(id, q) {
    var it = byId[id];
    if (!it) return;
    q = Math.max(0, Math.min(q, remaining(it), 200));
    if (q === 0) delete basket[id]; else basket[id] = q;
    saveBasket();
  }
  function basketLines() {
    return Object.keys(basket).filter(function (id) { return byId[id] && basket[id] > 0; })
      .map(function (id) { return { it: byId[id], qty: basket[id] }; });
  }
  function totals() {
    return basketLines().reduce(function (acc, l) { acc.n += l.qty; acc.eur += l.qty * l.it.eur; return acc; }, { n: 0, eur: 0 });
  }
  function pruneBasket() {
    Object.keys(basket).forEach(function (id) {
      if (!byId[id]) { delete basket[id]; return; }
      var r = remaining(byId[id]);
      if (basket[id] > r) { if (r <= 0) delete basket[id]; else basket[id] = r; }
    });
    saveBasket();
  }

  /* ---------- Supabase (plain REST, no library) ---------- */
  function rpc(fn, body) {
    var h = { "Content-Type": "application/json", apikey: CFG.supabaseKey };
    if (/^eyJ/.test(CFG.supabaseKey)) h.Authorization = "Bearer " + CFG.supabaseKey;
    return fetch(CFG.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST", headers: h, body: JSON.stringify(body || {})
    });
  }
  function loadAvailability() {
    if (!connected) return Promise.resolve();
    return rpc("gift_availability").then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (rows) {
      avail = {};
      (rows || []).forEach(function (row) { avail[row.item_id] = { max: row.max_qty, taken: row.taken }; });
      status.hidden = true;
      pruneBasket();
    }).catch(function () {
      status.textContent = t("g.loadErr");
      status.hidden = false;
    });
  }

  /* ---------- ideas ---------- */
  function cardHTML(it) {
    var name = L(it.name), r = remaining(it), q = basket[it.id] || 0;
    var limited = it.limit != null, single = it.limit === 1;
    var gone = limited && r <= 0 && q === 0;
    var meta = single ? t("g.one") : limited ? t("g.left", { n: Math.max(0, r - q), max: maxOf(it) }) : t("g.unlimited");
    var inf = INFO[it.id] || {};
    var print = it.img
      ? '<img src="' + esc(it.img) + '" alt="" loading="lazy" decoding="async">'
      : inf.img
        ? '<img src="' + esc(inf.img) + '-720.webp" srcset="' + esc(inf.img) + "-360.webp 360w, " + esc(inf.img) + '-720.webp 720w" sizes="(max-width: 560px) 48vw, 320px" alt="" loading="lazy" decoding="async">'
        : '<span class="gift-ph">' + icon(it.icon, "gift-ph-ic") + "</span>";
    var infoBtn = '<button type="button" class="gift-info" data-info="' + it.id + '" aria-haspopup="dialog" aria-label="' +
      esc(t("g.infoAbout", { name: name })) + '">' + icon("info") + "</button>";
    var ctrl;
    if (gone) {
      ctrl = '<p class="gift-gone">' + esc(single ? t("g.taken") : t("g.allTaken")) + "</p>";
    } else if (single) {
      ctrl = '<button type="button" class="gift-add" data-act="toggle" aria-pressed="' + (q > 0) + '">' +
        (q > 0 ? icon("check") + "<span>" + esc(t("g.added")) + "</span>" : icon("plus") + "<span>" + esc(t("g.add")) + "</span>") + "</button>";
    } else {
      ctrl = '<div class="stepper" role="group" aria-label="' + esc(t("g.qtyFor", { name: name })) + '">' +
        '<button type="button" data-act="dec" aria-label="' + esc(t("g.less")) + '"' + (q === 0 ? " disabled" : "") + ">" + icon("minus") + "</button>" +
        '<output aria-live="polite">' + q + "</output>" +
        '<button type="button" data-act="inc" aria-label="' + esc(t("g.more")) + '"' + (q >= r ? " disabled" : "") + ">" + icon("plus") + "</button></div>";
    }
    return '<li class="gift' + (gone ? " is-gone" : "") + (q > 0 ? " is-in" : "") + '" data-id="' + it.id + '">' +
      '<div class="gift-print">' + print + infoBtn + "</div>" +
      '<div class="gift-body"><h4 class="gift-name">' + esc(name) + "</h4>" +
      '<p class="gift-desc">' + esc(L(it.desc)) + "</p>" +
      '<p class="gift-price"><strong>' + esc(money(it.eur)) + '</strong><span class="gift-meta">' + esc(meta) + "</span></p>" +
      ctrl + "</div></li>";
  }

  function renderPanel() {
    var html = "";
    DATA.groups.forEach(function (g) {
      var items = DATA.items.filter(function (it) { return it.group === g; });
      if (!items.length) return;
      html += '<section class="gift-group gift-group--' + g + '"><h3 class="gift-group-title">' + esc(t("g.group." + g)) + "</h3>" +
        '<ul class="gift-grid">' + items.map(cardHTML).join("") + "</ul></section>";
    });
    panel.innerHTML = html;
  }

  /* ---------- basket and checkout ---------- */
  function renderBar() {
    var tt = totals();
    $("basket-count").textContent = tt.n === 1 ? t("g.bar1") : t("g.bar", { n: tt.n });
    $("basket-total").textContent = money(tt.eur);
    bar.classList.toggle("is-on", tt.n > 0 && !checkoutInView);
    bar.hidden = false;
  }

  function renderCart() {
    if (!result.hidden) return;
    var lines = basketLines(), tt = totals();
    // nothing chosen yet: no "Your gift" section at all
    $("checkout").hidden = !lines.length;
    if (!lines.length) {
      cart.innerHTML = "";
      form.hidden = true;
      return;
    }
    cart.innerHTML = '<ul class="cart-lines">' + lines.map(function (l) {
      return '<li data-id="' + l.it.id + '"><span class="cart-name">' + esc(L(l.it.name)) +
        (l.qty > 1 ? ' <span class="cart-qty">× ' + l.qty + "</span>" : "") + "</span>" +
        '<span class="cart-sum">' + esc(money(l.qty * l.it.eur)) + "</span>" +
        '<button type="button" class="cart-remove" data-act="remove" aria-label="' + esc(t("g.remove") + ": " + L(l.it.name)) + '">' + icon("x") + "</button></li>";
    }).join("") + "</ul>" +
      '<p class="cart-total"><span>' + esc(t("g.total")) + "</span><strong>" + esc(money(tt.eur)) + "</strong></p>";
    form.hidden = false;
  }

  function renderAll() { renderPanel(); renderCart(); renderBar(); }

  /* ---------- the info sheet: photos, more about it, links ---------- */
  var sheet = $("gift-info"), infoId = null, infoOpener = null, slideTimer = null;
  var ext = ' target="_blank" rel="noopener"';
  // every photo of an idea: the main one, then the extra ones (gifts-credits.js "gallery")
  function photosOf(it) {
    var inf = INFO[it.id] || {}, list = [];
    if (it.img) list.push({ src: it.img, set: null, photo: null });
    else if (inf.img) list.push({ src: inf.img + "-720.webp", set: inf.img + "-360.webp 360w, " + inf.img + "-720.webp 720w", photo: inf.photo || null });
    (inf.gallery || []).forEach(function (g) { list.push({ src: g.img + "-720.webp", set: g.img + "-360.webp 360w, " + g.img + "-720.webp 720w", photo: g.photo }); });
    return list;
  }
  function creditHTML(p) {
    if (!p) return "";
    var lic = p.license ? (p.licenseUrl ? '<a href="' + esc(p.licenseUrl) + '"' + ext + ">" + esc(p.license) + "</a>" : esc(p.license)) : "";
    return esc(t("g.photoBy")) + ' <a href="' + esc(p.source) + '"' + ext + ">" + esc(p.by) + "</a>" + (lic ? " · " + lic : "") + " · " + esc(t("g.cropped"));
  }
  function infoHTML(id) {
    var it = byId[id], inf = INFO[id] || {}, l = lang();
    var url = inf.wiki && (inf.wiki[l] || inf.wiki.en), inEnglish = inf.wiki && !inf.wiki[l] && l !== "en";
    var photos = photosOf(it), n = photos.length;
    var h = [];
    if (n) {
      h.push('<div class="gi-gallery"><div class="gi-track" id="gi-track"' + (n > 1 ? ' tabindex="0" aria-label="' + esc(t("g.photos")) + '"' : "") + ">" +
        photos.map(function (p, k) {
          return '<img class="gi-img" src="' + esc(p.src) + '"' + (p.set ? ' srcset="' + esc(p.set) + '" sizes="(max-width: 480px) 100vw, 440px"' : "") +
            ' alt=""' + (k ? ' loading="lazy"' : "") + ' decoding="async">';
        }).join("") + "</div>");
      if (n > 1) {
        h.push('<button type="button" class="gi-nav gi-prev" data-go="-1" aria-label="' + esc(t("g.prevPhoto")) + '">' + icon("arrow-left") + "</button>" +
          '<button type="button" class="gi-nav gi-next" data-go="1" aria-label="' + esc(t("g.nextPhoto")) + '">' + icon("arrow-left") + "</button>" +
          '<p class="gi-dots" aria-hidden="true">' + photos.map(function (p, k) { return '<span' + (k ? "" : ' class="is-on"') + "></span>"; }).join("") + "</p>");
      }
      h.push("</div>");
    }
    h.push('<div class="gi-body"><h3 id="gi-title" class="gi-title">' + esc(L(it.name)) + "</h3>");
    h.push('<p class="gi-desc">' + esc(L(it.desc)) + "</p>");
    if (it.more) h.push('<p class="gi-more">' + esc(L(it.more)) + "</p>");
    h.push('<p class="gi-price"><strong>' + esc(money(it.eur)) + "</strong></p>");
    var links = [];
    if (it.web) links.push('<a class="btn btn--navy" href="' + esc(it.web.url) + '"' + ext + "><span>" + esc(t("g.web." + it.web.kind)) + "</span>" + icon("arrow-up-right") + "</a>");
    if (url) links.push('<a class="btn btn--line" href="' + esc(url) + '"' + ext + "><span>" + esc(t("g.wiki")) + "</span>" + icon("arrow-up-right") + "</a>" +
      (inEnglish ? '<span class="gi-lang">' + esc(t("g.wikiEn")) + "</span>" : ""));
    if (links.length) h.push('<p class="gi-wiki">' + links.join("") + "</p>");
    if (photos.some(function (p) { return p.photo; })) h.push('<p class="gi-credit" id="gi-credit">' + creditHTML(photos[0].photo) + "</p>");
    h.push("</div>");
    return h.join("");
  }
  // every photo's credit, in the footer (the licenses ask for it)
  function renderCredits() {
    var rows = [];
    DATA.items.forEach(function (it) {
      photosOf(it).forEach(function (p, k) {
        if (!p.photo) return;
        var lic = p.photo.license ? (p.photo.licenseUrl ? '<a href="' + esc(p.photo.licenseUrl) + '"' + ext + ">" + esc(p.photo.license) + "</a>" : esc(p.photo.license)) : "";
        rows.push("<li><strong>" + esc(L(it.name)) + (k ? " (" + (k + 1) + ")" : "") + '</strong>: <a href="' + esc(p.photo.source) + '"' + ext + ">" + esc(p.photo.by) + "</a>" + (lic ? " · " + lic : "") + "</li>");
      });
    });
    $("photo-credits").innerHTML = rows.join("");
  }

  // slideshow: swipe, arrows, dots; turns by itself until the guest touches it
  function slideIndex(track) { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
  function goSlide(track, k, smooth) {
    var n = track.children.length;
    k = (k + n) % n;
    track.scrollTo({ left: k * track.clientWidth, behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
  }
  function stopSlides() { if (slideTimer) { clearInterval(slideTimer); slideTimer = null; } }
  function startSlides() {
    stopSlides();
    var track = $("gi-track");
    if (!track || track.children.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    slideTimer = setInterval(function () { goSlide(track, slideIndex(track) + 1, true); }, 4000);
  }
  function wireSlides() {
    var track = $("gi-track");
    if (!track || track.children.length < 2) return;
    var it = byId[infoId], photos = photosOf(it), last = 0;
    track.addEventListener("scroll", function () {
      var k = slideIndex(track);
      if (k === last) return;
      last = k;
      var dots = sheet.querySelectorAll(".gi-dots span");
      for (var i = 0; i < dots.length; i++) dots[i].className = i === k ? "is-on" : "";
      var c = $("gi-credit");
      if (c) c.innerHTML = creditHTML(photos[k] && photos[k].photo);
    }, { passive: true });
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (ev) { track.addEventListener(ev, stopSlides, { passive: true }); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goSlide(track, slideIndex(track) + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goSlide(track, slideIndex(track) - 1, true); }
    });
    startSlides();
  }
  sheet.addEventListener("click", function (e) {
    var nav = e.target.closest("button[data-go]");
    if (nav) { stopSlides(); var tr = $("gi-track"); goSlide(tr, slideIndex(tr) + Number(nav.getAttribute("data-go")), true); }
  });

  function openInfo(id, opener) {
    if (!byId[id]) return;
    infoId = id; infoOpener = opener || null;
    $("gi-content").innerHTML = infoHTML(id);
    if (typeof sheet.showModal === "function") { if (!sheet.open) sheet.showModal(); }
    else sheet.setAttribute("open", "");
    sheet.scrollTop = 0;
    wireSlides();
  }
  sheet.addEventListener("click", function (e) { if (e.target === sheet) sheet.close(); });   // tap outside closes
  sheet.addEventListener("close", function () {
    stopSlides();
    infoId = null;
    var back = infoOpener && document.querySelector('button.gift-info[data-info="' + infoOpener.getAttribute("data-info") + '"]');
    if (back) back.focus({ preventScroll: true });
  });

  /* ---------- after "Show me how to give": pay, then confirm ---------- */
  var step = null;   // null while choosing; { kind: "pay" | "done", ... }

  function keyFacts(s) {
    return '<dl class="pay-key"><div class="pay-row"><dt>' + esc(t("g.total")) + "</dt><dd><strong>" + esc(money(s.total)) + "</strong></dd></div></dl>";
  }
  function backLink() {
    return '<p class="result-back"><a class="btn btn--line" href="index.html#' + lang() + '">' + icon("arrow-left") + "<span>" + esc(t("g.back")) + "</span></a></p>";
  }

  function showStep(s, silent) {
    step = s;
    var h = [];
    if (s.kind === "pay") {
      h.push('<h3 class="result-title">' + esc(t("g.payTitle")) + "</h3>");
      h.push('<p class="result-lede">' + esc(s.ref ? t("g.payLede") : t("g.errSave")) + "</p>");
      if (s.held) h.push('<p class="hold-note">' + esc(t("g.hold")) + "</p>");
      h.push(keyFacts(s));
      h.push('<p class="ref-hint">' + esc(t("g.nameHint")) + "</p>");
      h.push('<div class="pay-methods">' + window.SM_PAY.html() + "</div>");
      if (s.ref) {
        h.push('<form class="note-form" id="done-form" novalidate>' +
          "<h4>" + esc(t("g.msgTitle")) + "</h4><p>" + esc(t("g.msgHint")) + "</p>" +
          '<label class="vh" for="f-note">' + esc(t("g.msgTitle")) + "</label>" +
          '<div class="field"><textarea id="f-note" rows="3" maxlength="1000">' + esc(s.note || "") + "</textarea></div>" +
          '<p class="done-hint">' + esc(t("g.doneHint")) + "</p>" +
          '<p class="note-status is-error" role="alert" hidden></p>' +
          '<div class="done-actions"><button class="btn btn--rsvp" type="submit">' + esc(t("g.done")) + "</button>" +
          '<button class="btn-text" type="button" data-act="change">' + icon("arrow-left") + "<span>" + esc(t("g.change")) + "</span></button></div>" +
          "</form>");
      } else {
        h.push(backLink());
      }
    } else {
      h.push('<h3 class="result-title">' + esc(t("g.thanks", { name: s.first })) + "</h3>");
      h.push('<p class="result-lede">' + esc(t("g.registered")) + "</p>");
      h.push(keyFacts(s));
      h.push(backLink());
    }
    result.innerHTML = h.join("");
    $("checkout").hidden = false;
    result.hidden = false;
    form.hidden = true;
    cart.hidden = true;
    if (silent) return;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function releaseHold() {
    var ref = pending && pending.ref;
    if (!connected || !ref) return;
    rpc("cancel_pledge", { p_ref: ref })
      .then(function () { setPending(null); return loadAvailability(); })
      .then(renderPanel)
      .catch(function () {});
  }
  function backToChoosing() {
    step = null;
    result.hidden = true;
    result.innerHTML = "";
    cart.hidden = false;
    renderCart();
  }

  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = !msg;
  }

  // Last step: "I've sent my gift". Only now is the gift registered, with the optional message.
  result.addEventListener("submit", function (e) {
    if (e.target.id !== "done-form") return;
    e.preventDefault();
    var f = e.target, btn = f.querySelector("button[type=submit]"), st = f.querySelector(".note-status");
    var note = f.querySelector("textarea").value.trim();
    step.note = note;
    btn.disabled = true; btn.textContent = t("g.saving");
    var ok = function () {
      basket = {}; saveBasket(); setPending(null);
      var ref = step.ref;
      showStep({ kind: "done", first: step.first, total: step.total });
      renderPanel(); renderBar();
      loadAvailability().then(renderPanel);
      sendEmail({ kind: "gift", ref: ref });   // thank-you email with the summary (best effort)
    };
    var fail = function () {
      btn.disabled = false; btn.textContent = t("g.done");
      st.hidden = false; st.textContent = t("g.errConfirm");
    };
    if (!connected) { ok(); return; }
    rpc("confirm_pledge", { p_ref: step.ref, p_message: note || null })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (body) { return r.ok && body === "confirmed"; }); })
      .then(function (good) { if (good) ok(); else fail(); })
      .catch(fail);
  });

  result.addEventListener("click", function (e) {
    if (!e.target.closest("[data-act=change]")) return;
    releaseHold();
    backToChoosing();
    (guest ? $("pledge-submit") : form.first).focus();
  });

  /* ---------- who is giving ---------- */
  var guest = null, guestKey = null;   // known from the personal link (same key as the RSVP page)
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  var checking = false;   // a remembered guest is being looked up: show neither the fields nor the name yet
  function renderGuest() {
    $("giver").hidden = !guest;
    $("giver-fields").hidden = !!guest || checking;
    $("giver-email").hidden = !!guest || checking;
    if (guest) $("giver-text").textContent = t("g.giving", { name: guest.first_name + " " + guest.last_name, email: guest.email });
  }
  function loadGuest() {
    var k = null;
    // opened from the personal link in the email: remember it on this phone, keep it out of the address bar
    var fromLink = (location.search.match(/[?&]k=([0-9a-f]{32,128})/) || [])[1];
    if (/[?&]k=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    if (fromLink) store("sm-rsvp-k", fromLink);
    try { k = localStorage.getItem("sm-rsvp-k"); } catch (e) {}
    if (!k || !connected) { renderGuest(); return; }
    checking = true; renderGuest();
    var stop = function () { checking = false; renderGuest(); };
    rpc("get_rsvp", { p_k: k })
      .then(function (r) { return r.ok ? r.json() : undefined; })   // server trouble: keep the key, try again next time
      .then(function (g) {
        if (g && g.email) { guest = g; guestKey = k; } else if (g === null) store("sm-rsvp-k", null);
        stop();
      })
      .catch(stop);
  }
  $("giver-reset").addEventListener("click", function () {
    guest = null; guestKey = null;
    store("sm-rsvp-k", null); store("sm-guest", null);
    form.first.value = ""; form.last.value = ""; form.email.value = ""; $("f-news").checked = false;
    renderGuest(); form.first.focus();
  });


  function sendEmail(body) {
    if (!connected) return;
    var h = { "Content-Type": "application/json", apikey: CFG.supabaseKey };
    if (/^eyJ/.test(CFG.supabaseKey)) h.Authorization = "Bearer " + CFG.supabaseKey;
    fetch(CFG.supabaseUrl.replace(/\/+$/, "") + "/functions/v1/send-email", { method: "POST", headers: h, body: JSON.stringify(body) }).catch(function () {});
  }

  /* ---------- events ---------- */
  panel.addEventListener("click", function (e) {
    var ib = e.target.closest("button.gift-info");
    if (ib) { openInfo(ib.getAttribute("data-info"), ib); return; }
    var print = e.target.closest(".gift-print");   // tapping the photo opens the sheet too
    if (print) { var ibtn = print.querySelector("button.gift-info"); openInfo(ibtn.getAttribute("data-info"), ibtn); return; }
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    if (step) { releaseHold(); backToChoosing(); }
    var li = b.closest("[data-id]"), id = li.getAttribute("data-id"), q = basket[id] || 0, act = b.getAttribute("data-act");
    if (act === "toggle") setQty(id, q > 0 ? 0 : 1);
    if (act === "inc") setQty(id, q + 1);
    if (act === "dec") setQty(id, q - 1);
    var fresh = document.createElement("ul");
    fresh.innerHTML = cardHTML(byId[id]);
    li.replaceWith(fresh.firstChild);
    var again = panel.querySelector('[data-id="' + id + '"] button[data-act="' + act + '"]') ||
      panel.querySelector('[data-id="' + id + '"] button:not([disabled])');
    if (again) again.focus();
    renderCart(); renderBar();
  });

  cart.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act=remove]");
    if (!b) return;
    setQty(b.closest("[data-id]").getAttribute("data-id"), 0);
    renderAll();
    var next = cart.querySelector("button.cart-remove");
    if (next) next.focus();
    else $("ideas").focus({ preventScroll: true });   // the basket is empty, so "Your gift" has gone
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = guest ? guest.first_name : form.first.value.trim();
    var last = guest ? guest.last_name : form.last.value.trim();
    var email = guest ? guest.email : form.email.value.trim();
    var lines = basketLines(), tt = totals();
    if (!lines.length) { showError(t("g.errEmpty")); return; }
    if (!guest) {
      form.first.setAttribute("aria-invalid", String(!first));
      form.last.setAttribute("aria-invalid", String(!last));
      if (!first || !last) { showError(t("g.errName")); (first ? form.last : form.first).focus(); return; }
      var badMail = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      form.email.setAttribute("aria-invalid", String(badMail));
      if (badMail) { showError(t("g.errEmail")); form.email.focus(); return; }
    }
    showError("");

    var btn = $("pledge-submit");
    btn.disabled = true; btn.textContent = t("g.saving");
    var done = function () { btn.disabled = false; btn.textContent = t("g.next"); };
    var items = lines.map(function (l) { return { id: l.it.id, qty: l.qty, eur: l.it.eur, name: L(l.it.name) }; });
    var held = lines.some(function (l) { return l.it.limit != null; });
    var go = function (ref) {
      if (ref && connected && held) {
        var hold = {};
        lines.forEach(function (l) { if (l.it.limit != null) hold[l.it.id] = l.qty; });
        setPending({ ref: ref, hold: hold, at: Date.now() });
      }
      showStep({ kind: "pay", first: first, last: last, total: tt.eur, ref: ref, held: held && !!ref });
    };

    if (!connected) { done(); go("DEMO-" + Math.random().toString(36).slice(2, 7).toUpperCase()); return; }

    var previous = pending && pending.ref;
    (previous ? rpc("cancel_pledge", { p_ref: previous }).catch(function () {}) : Promise.resolve())
      .then(function () {
        setPending(null);
        return rpc("start_pledge", { p_k: guestKey, p_first: first, p_last: last, p_email: email, p_lang: lang(), p_items: items, p_custom: false, p_news: !guest && $("f-news").checked });
      })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) { return { ok: r.ok, body: body }; });
      })
      .then(function (res) {
        done();
        if (res.ok && res.body && res.body.ref) {
          if (res.body.k) { store("sm-rsvp-k", res.body.k); guestKey = res.body.k; }   // a new guest: remember them on this phone
          store("sm-guest", JSON.stringify({ first: first, last: last }));
          go(res.body.ref); loadAvailability().then(renderPanel); return;
        }
        var m = (res.body && res.body.message) || "";
        if (m.indexOf("taken:") === 0) {
          var id = m.slice(6), it = byId[id];
          return loadAvailability().then(function () {
            pruneBasket(); renderAll();
            showError(t("g.errTaken", { name: it ? L(it.name) : id }));
          });
        }
        if (m.indexOf("bad_email") > -1) { showError(t("g.errEmail")); return; }
        go(null);
      })
      .catch(function () { done(); go(null); });
  });

  ["first", "last", "email"].forEach(function (n) {
    form[n].addEventListener("input", function () {
      if (form[n].value.trim()) form[n].removeAttribute("aria-invalid");
    });
  });

  // Hide the basket bar while the checkout is on screen.
  var checkoutInView = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      checkoutInView = entries[0].isIntersecting;
      renderBar();
    }, { rootMargin: "0px 0px -30% 0px" }).observe($("checkout"));
  }

  document.addEventListener("sm:lang", function () {
    renderAll(); renderGuest(); renderCredits();
    if (infoId && sheet.open) $("gi-content").innerHTML = infoHTML(infoId);
    if (step) {
      var f = $("f-note");
      if (f) step.note = f.value;
      showStep(step, true);
    }
  });

  /* ---------- start ---------- */
  document.querySelectorAll("svg[data-icon]").forEach(function (s) {
    s.innerHTML = (ICONS[s.getAttribute("data-icon")] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join("");
  });
  if (!connected) $("demo-note").hidden = false;
  try {   // name from the RSVP page, if this guest already replied on this phone
    var known = JSON.parse(localStorage.getItem("sm-guest") || "null");
    if (known && !form.first.value) { form.first.value = known.first || ""; form.last.value = known.last || ""; }
  } catch (e) {}
  loadGuest();
  renderCredits();
  pruneBasket();
  renderAll();
  loadAvailability().then(renderAll);
})();
