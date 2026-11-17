// Picks the Theme from the visitor's own date. Runs as an inline script in
// <head>, before first paint, so the page never flashes the wrong Theme (the
// server's date would be frozen at build time anyway).
//
//   Christmas: 1 Nov – 6 Jan
//   Standard:  the rest of the year (Birthday comes later)
//
// Preview any Theme with ?theme=christmas or ?theme=standard.
export const themeScript = `(function () {
  var d = new Date(), m = d.getMonth(), day = d.getDate();
  var theme = m === 10 || (m === 0 && day <= 6) ? "christmas" : "standard";
  var preview = new URLSearchParams(location.search).get("theme");
  if (preview === "christmas" || preview === "standard") theme = preview;
  document.documentElement.dataset.theme = theme;
})();`;
