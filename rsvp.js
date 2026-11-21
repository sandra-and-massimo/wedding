(function () {
  "use strict";

  var CFG = window.SM_GIFT_CONFIG || {};
  var ICONS = window.SM_ICONS || {};
  var SM = window.SM;
  var root = document.documentElement;
  var connected = !!(CFG.supabaseUrl && CFG.supabaseKey);
  // The personal link (?k=...) is what opens a reply; it never expires.
  var BASE = (CFG.supabaseUrl || "").replace(/\/+$/, "");
  function headers() {
    var h = { "Content-Type": "application/json", apikey: CFG.supabaseKey };
    if (/^eyJ/.test(CFG.supabaseKey)) h.Authorization = "Bearer " + CFG.supabaseKey;
    return h;
  }
  // Same shape as supabase-js: resolves to { data, error }.
  var client = connected ? {
    rpc: function (fn, args) {
      return fetch(BASE + "/rest/v1/rpc/" + fn, { method: "POST", headers: headers(), body: JSON.stringify(args || {}) })
        .then(function (r) {
          return r.json().catch(function () { return null; }).then(function (b) {
            return r.ok ? { data: b, error: null } : { data: null, error: { message: (b && b.message) || "http " + r.status } };
          });
        });
    }
  } : null;
  var KEY = "sm-rsvp-k";

  var $ = function (id) { return document.getElementById(id); };
  var form = $("rsvp"), errBox = $("rsvp-error"), result = $("rsvp-result"), submitBtn = $("rsvp-submit");
  var people = [];            // [{ name, child, age }]
  var seats = 1, seatsTouched = false;
  var mode = "new";           // "new" (first reply) or "edit" (opened with the personal link)
  var editKey = null, editEmail = null;
  var firstReply = false;     // known from a gift, but no reply yet: name and email are already filled in
  var lastResult = null;

  /* ---------- helpers ---------- */
  function lang() { return root.lang || "en"; }
  function t(k, v) { return SM.t(k, v); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icon(name, cls) {
    return '<svg class="' + (cls || "ic") + '" viewBox="0 0 256 256" aria-hidden="true">' +
      (ICONS[name] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join("") + "</svg>";
  }
  function radio(name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : null; }
  function setRadio(name, value) {
    form.querySelectorAll('input[name="' + name + '"]').forEach(function (r) { r.checked = r.value === value; });
  }
  function validEmail(s) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s); }
  function showError(msg) { errBox.textContent = msg || ""; errBox.hidden = !msg; }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function rememberGuest(first, last) { store("sm-guest", JSON.stringify({ first: first, last: last })); }

  /* ---------- the form ---------- */
  function renderPeople() {
    $("people").innerHTML = people.map(function (p, i) {
      return '<li class="person" data-i="' + i + '">' +
        '<div class="field person-name"><label for="p-name-' + i + '">' + esc(t("r.companionName")) + "</label>" +
        '<input id="p-name-' + i + '" class="p-name" maxlength="80" autocomplete="off" value="' + esc(p.name) + '"></div>' +
        '<label class="check"><input type="checkbox" class="p-child"' + (p.child ? " checked" : "") + "><span>" + esc(t("r.child")) + "</span></label>" +
        '<div class="field person-age"' + (p.child ? "" : " hidden") + '><label for="p-age-' + i + '">' + esc(t("r.age")) + "</label>" +
        '<input id="p-age-' + i + '" class="p-age" type="number" inputmode="numeric" min="0" max="17" value="' + (p.age == null ? "" : p.age) + '"></div>' +
        '<button type="button" class="cart-remove person-remove" aria-label="' + esc(t("r.removePerson")) + '">' + icon("x") + "</button></li>";
    }).join("");
  }
  function renderSeats() {
    $("seats").textContent = seats;
    var b = $("seats-block").querySelectorAll("button");
    b[0].disabled = seats <= 1; b[1].disabled = seats >= 30;
    b[0].setAttribute("aria-label", t("r.seatLess")); b[1].setAttribute("aria-label", t("r.seatMore"));
  }
  function renderVisibility() {
    var coming = radio("attending") === "yes";
    $("coming").hidden = !coming;
    $("seats-block").hidden = !(coming && radio("shuttle") === "yes");
  }
  function renderMode() {
    var edit = mode === "edit";
    $("email-field").hidden = edit;
    $("signed-as").hidden = !edit;
    if (edit) $("signed-as-text").textContent = firstReply
      ? t("r.replyingAs", { name: (form.first.value + " " + form.last.value).trim(), email: editEmail })
      : t("r.signedIn", { email: editEmail });
    submitBtn.textContent = t(edit && !firstReply ? "r.save" : "r.send");
  }
  function renderAll() { renderPeople(); renderSeats(); renderVisibility(); renderMode(); }

  function fill(r) {
    form.first.value = r.first_name || "";
    form.last.value = r.last_name || "";
    setRadio("attending", r.attending === true ? "yes" : r.attending === false ? "no" : null);
    people = (r.companions || []).map(function (c) { return { name: c.name || "", child: !!c.child, age: c.age == null ? null : c.age }; });
    setRadio("shuttle", r.shuttle === true ? "yes" : r.shuttle === false ? "no" : null);
    seats = r.shuttle_seats || Math.max(1, 1 + people.length); seatsTouched = !!r.shuttle_seats;
    $("r-intol").value = r.intolerances || "";
    $("r-news").checked = !!r.news;
    $("r-notes").value = [r.notes, r.message].filter(Boolean).join("\n\n");
    renderAll();
  }

  function collect() {
    var attending = radio("attending"), shuttle = radio("shuttle");
    return {
      email: form.email.value.trim(),
      first_name: form.first.value.trim(),
      last_name: form.last.value.trim(),
      attending: attending === "yes" ? true : attending === "no" ? false : null,
      companions: attending === "yes" ? people.map(function (p) { return { name: p.name.trim(), child: !!p.child, age: p.child ? p.age : null }; }) : [],
      shuttle: attending === "yes" && shuttle ? shuttle === "yes" : null,
      shuttle_seats: attending === "yes" && shuttle === "yes" ? seats : null,
      intolerances: attending === "yes" ? $("r-intol").value.trim() : "",
      notes: $("r-notes").value.trim(),
      message: "",
      news: $("r-news").checked,
      lang: lang()
    };
  }

  function validate(p) {
    form.first.setAttribute("aria-invalid", String(!p.first_name));
    form.last.setAttribute("aria-invalid", String(!p.last_name));
    if (!p.first_name || !p.last_name) return ["r.errName", p.first_name ? form.last : form.first];
    if (mode === "new") {
      var badMail = !validEmail(p.email);
      form.email.setAttribute("aria-invalid", String(badMail));
      if (badMail) return ["r.errEmail", form.email];
    }
    if (p.attending === null) return ["r.errAttending", form.querySelector('input[name="attending"]')];
    for (var i = 0; i < p.companions.length; i++) {
      var c = p.companions[i];
      if (!c.name) return ["r.errCompanion", $("p-name-" + i)];
      if (c.child && (c.age === null || c.age === "" || isNaN(c.age) || c.age < 0 || c.age > 17)) return ["r.errAge", $("p-age-" + i)];
    }
    return null;
  }

  var SQL_ERRORS = { name_required: "r.errName", bad_email: "r.errEmail", attending_required: "r.errAttending",
    bad_companions: "r.errCompanion", bad_age: "r.errAge", bad_seats: "r.errSeats", bad_link: "r.linkErr" };
  function sqlError(err) {
    var m = (err && err.message) || "";
    for (var k in SQL_ERRORS) if (m.indexOf(k) > -1) return t(SQL_ERRORS[k]);
    return t("r.errSave");
  }

  /* ---------- result screen ---------- */
  function showResult(r, silent) {
    lastResult = r;
    var h = [];
    if (r.kind !== "exists") h.push('<h3 class="result-title">' + esc(t("r.thanks", { name: r.first })) + "</h3>");
    h.push('<p class="result-lede">' + esc(t(r.kind === "exists" ? "r.exists" : r.kind === "saved" && !r.fresh ? "r.saved" : "r.received")) + "</p>");
    if (r.kind !== "saved") {
      var mail;
      if (r.mailed) mail = "<p>" + esc(t("r.emailSent", { email: r.email })) + "</p><p><strong>" + esc(t("r.spam")) + "</strong></p>";
      else mail = "<p>" + esc(t(r.wait ? "r.wait" : r.kind === "exists" ? "r.mailFailExists" : "r.mailFailSaved")) + "</p>" +
        '<p><button type="button" class="btn btn--line resend" data-act="resend">' + esc(t("r.resend")) + "</button></p>" +
        (r.detail ? '<p class="mail-detail">' + esc(t("r.detail", { detail: r.detail })) + "</p>" : "");
      h.push('<div class="mail-note' + (r.mailed ? "" : " is-error") + '">' + icon("envelope-simple", "ic mail-ic") + mail + "</div>");
    }
    if (r.kind !== "exists") {
      h.push('<div class="next-gift"><h4>' + esc(t("giftcta.title")) + "</h4><p>" + esc(t("giftcta.text")) + "</p>" +
        '<a class="btn btn--navy" href="honeymoon.html#' + lang() + '">' + esc(t("giftcta.button")) + "</a></div>");
    }
    h.push('<p class="result-actions">' +
      (editKey ? '<button type="button" class="btn-text" data-act="edit">' + icon("arrow-left") + "<span>" + esc(t("r.edit")) + "</span></button>" : "") +
      '<a class="btn btn--line" href="index.html#' + lang() + '">' + icon("arrow-left") + "<span>" + esc(t("r.back")) + "</span></a></p>");
    result.innerHTML = h.join("");
    result.hidden = false;
    form.hidden = true;
    $("reply-title").hidden = true;
    if (silent) return;
    result.focus({ preventScroll: true });
    $("reply").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
  function backToForm() {
    lastResult = null;
    result.hidden = true; result.innerHTML = "";
    form.hidden = false; $("reply-title").hidden = false;
    renderAll();
    form.first.focus();
  }

  /* ---------- Supabase ---------- */
  // Asks the send-email function to email the personal link (in the guest's language).
  function sendLink(email) {
    if (!client) return Promise.resolve({ ok: true });
    return fetch(BASE + "/functions/v1/send-email", { method: "POST", headers: headers(), body: JSON.stringify({ kind: "rsvp", email: email }) })
      .then(function (r) {
        if (r.ok) return { ok: true };
        return r.json().catch(function () { return {}; }).then(function (b) {
          return { ok: false, wait: r.status === 429, detail: r.status + " " + ((b && b.error) || "") };
        });
      })
      .catch(function (e) { return { ok: false, detail: String(e && e.message || e) }; });
  }

  function openWithKey(k, fromLink) {
    return client.rpc("get_rsvp", { p_k: k }).then(function (res) {
      if (res.error || !res.data) {
        if (!res.error) store(KEY, null);   // forget only a link that doesn't exist, not a failed connection
        if (fromLink) $("link-error").hidden = false;
        return;
      }
      editKey = k; editEmail = res.data.email; mode = "edit";
      firstReply = res.data.attending == null;
      store(KEY, k);
      fill(res.data);
      rememberGuest(res.data.first_name, res.data.last_name);
    });
  }

  /* ---------- events ---------- */
  form.addEventListener("change", function (e) {
    var el = e.target;
    if (el.name === "attending" || el.name === "shuttle") {
      if (el.name === "shuttle" && el.value === "yes" && !seatsTouched) { seats = Math.max(1, 1 + people.length); renderSeats(); }
      renderVisibility();
    }
    var li = el.closest(".person");
    if (li && el.classList.contains("p-child")) {
      var i = +li.getAttribute("data-i");
      people[i].child = el.checked;
      li.querySelector(".person-age").hidden = !el.checked;
      if (el.checked) li.querySelector(".p-age").focus();
    }
  });
  form.addEventListener("input", function (e) {
    var el = e.target, li = el.closest(".person");
    if (li) {
      var i = +li.getAttribute("data-i");
      if (el.classList.contains("p-name")) people[i].name = el.value;
      if (el.classList.contains("p-age")) people[i].age = el.value === "" ? null : parseInt(el.value, 10);
    }
    if (el.getAttribute("aria-invalid") === "true" && el.value.trim()) el.removeAttribute("aria-invalid");
  });
  $("add-person").addEventListener("click", function () {
    people.push({ name: "", child: false, age: null });
    if (!seatsTouched) seats = Math.max(1, 1 + people.length);
    renderPeople(); renderSeats();
    $("p-name-" + (people.length - 1)).focus();
  });
  $("people").addEventListener("click", function (e) {
    var b = e.target.closest(".person-remove");
    if (!b) return;
    people.splice(+b.closest(".person").getAttribute("data-i"), 1);
    if (!seatsTouched) seats = Math.max(1, 1 + people.length);
    renderPeople(); renderSeats();
    $("add-person").focus();
  });
  $("seats-block").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-seat]");
    if (!b) return;
    seats = Math.min(30, Math.max(1, seats + +b.getAttribute("data-seat")));
    seatsTouched = true;
    renderSeats();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var p = collect();
    var bad = validate(p);
    if (bad) { showError(t(bad[0])); if (bad[1]) bad[1].focus(); return; }
    showError("");
    submitBtn.disabled = true; submitBtn.textContent = t("r.sending");
    var done = function () { submitBtn.disabled = false; renderMode(); };

    if (!client) {                       // demo mode
      done(); rememberGuest(p.first_name, p.last_name);
      showResult({ kind: mode === "edit" ? "saved" : "created", first: p.first_name, email: p.email, mailed: true });
      return;
    }

    if (mode === "edit") {
      client.rpc("save_rsvp", { p_k: editKey, p: p }).then(function (res) {
        done();
        if (res.error) { showError(sqlError(res.error)); return; }
        rememberGuest(p.first_name, p.last_name);
        showResult({ kind: "saved", first: p.first_name, fresh: firstReply });
        firstReply = false;
      }, function () { done(); showError(t("r.errSave")); });
      return;
    }

    client.rpc("submit_rsvp", { p: p }).then(function (res) {
      if (res.error) { done(); showError(sqlError(res.error)); return; }
      var created = res.data && res.data.status === "created";
      if (created) rememberGuest(p.first_name, p.last_name);
      if (created && res.data.k) {
        editKey = res.data.k; editEmail = p.email.toLowerCase(); mode = "edit";
        store(KEY, editKey);             // this phone can come back without the email
      }
      return sendLink(p.email).then(function (mail) {
        done();
        showResult({ kind: created ? "created" : "exists", first: p.first_name, email: p.email,
          mailed: mail.ok, wait: mail.wait, detail: mail.detail });
      });
    }, function () { done(); showError(t("r.errSave")); });
  });

  result.addEventListener("click", function (e) {
    if (e.target.closest("[data-act=edit]")) backToForm();
    var again = e.target.closest("[data-act=resend]");
    if (again && lastResult) {
      again.disabled = true; again.textContent = t("r.sending");
      sendLink(lastResult.email).then(function (mail) {
        lastResult.mailed = mail.ok; lastResult.wait = mail.wait; lastResult.detail = mail.detail;
        showResult(lastResult, true);
        var note = result.querySelector(".mail-note");
        if (note) { note.setAttribute("tabindex", "-1"); note.focus(); }
      });
    }
  });

  // "Not you?": forget this reply on this phone and start a new one.
  $("sign-out").addEventListener("click", function () {
    store(KEY, null);
    mode = "new"; editKey = null; editEmail = null; firstReply = false; people = []; seats = 1; seatsTouched = false;
    form.reset(); renderAll(); form.first.focus();
  });

  document.addEventListener("sm:lang", function () {
    renderAll();
    if (lastResult) showResult(lastResult, true);
  });

  /* ---------- start ---------- */
  document.querySelectorAll("svg[data-icon]").forEach(function (s) {
    s.innerHTML = (ICONS[s.getAttribute("data-icon")] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join("");
  });
  renderAll();
  if (!client) { $("demo-note").hidden = false; return; }

  var hadKey = /[?&]k=/.test(location.search);
  var fromLink = (location.search.match(/[?&]k=([0-9a-f]{32,128})/) || [])[1];
  if (hadKey) {
    // keep the key out of the address bar (screenshots, sharing); it's remembered on this phone
    history.replaceState(null, "", location.pathname + location.hash);
  }
  var k = fromLink || read(KEY);
  if (k) openWithKey(k, hadKey);
  else if (hadKey) $("link-error").hidden = false;
})();
