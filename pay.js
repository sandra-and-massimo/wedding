/* Payment details (from gift-config.js) with "Copy" buttons.
   Used by the honeymoon page after choosing ideas, and by the main page's
   "no ideas needed" box (#direct), which only shows them: nothing is saved or emailed. */
(function () {
  "use strict";

  var PAY = (window.SM_GIFT_CONFIG || {}).payment || {};
  var ICONS = window.SM_ICONS || {};
  function t(k) { return window.SM.t(k); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icon(name) {
    return '<svg class="ic" viewBox="0 0 256 256" aria-hidden="true">' +
      (ICONS[name] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join("") + "</svg>";
  }

  function row(label, value) {
    if (!value) return "";
    var isLink = /^https?:\/\//i.test(value);
    var placeholder = /^PASTE HERE/i.test(value);
    return '<div class="pay-row">' + (label ? "<dt>" + esc(label) + "</dt>" : "") + "<dd>" +
      (isLink ? '<a href="' + esc(value) + '" target="_blank" rel="noopener">' + esc(value) + "</a>" : '<span class="pay-value' + (placeholder ? " is-placeholder" : "") + '">' + esc(value) + "</span>") +
      '<button type="button" class="copy" data-copy="' + esc(value) + '">' + icon("copy") + "<span>" + esc(t("g.copy")) + "</span></button></dd></div>";
  }

  // Bank transfer, Revolut and PayPal; whatever is empty in gift-config.js is left out.
  function html() {
    var bank = row(t("g.holder"), PAY.holder) + row(t("g.iban"), PAY.iban) + row(t("g.bic"), PAY.bic);
    var out = "";
    if (bank) out += '<section class="pay"><h4>' + esc(t("g.bank")) + "</h4><dl>" + bank + "</dl></section>";
    if (PAY.revolut) out += '<section class="pay"><h4>' + esc(t("g.revolut")) + "</h4><dl>" + row("", PAY.revolut) + "</dl></section>";
    if (PAY.paypal) out += '<section class="pay"><h4>' + esc(t("g.paypal")) + "</h4><dl>" + row("", PAY.paypal) + '</dl><p class="pay-note">' + esc(t("g.paypalNote")) + "</p></section>";
    return out;
  }

  window.SM_PAY = { html: html };

  document.addEventListener("click", function (e) {
    var c = e.target.closest("button.copy");
    if (!c) return;
    var label = c.querySelector("span");
    var done = function () {
      label.textContent = t("g.copied");
      setTimeout(function () { label.textContent = t("g.copy"); }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(c.getAttribute("data-copy")).then(done, function () {});
  });

  // The main page's box: fill it now and again when the language changes.
  var box = document.getElementById("direct-methods");
  if (box) {
    var fill = function () { box.innerHTML = html(); };
    fill();
    document.addEventListener("sm:lang", fill);
    document.querySelectorAll("#direct svg[data-icon]").forEach(function (s) {
      s.innerHTML = (ICONS[s.getAttribute("data-icon")] || []).map(function (d) { return '<path d="' + d + '"/>'; }).join("");
    });
  }
})();
