/* Dark-mode toggle for the portfolio.
   - No saved choice: follow the visitor's system preference (prefers-color-scheme).
   - The toggle in the nav saves the choice in localStorage, so it sticks across pages.
   - The button always shows the opposite-mode icon: moon in light mode, sun in dark mode. */
(function () {
  var KEY = "theme";
  function systemTheme() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }
  function savedTheme() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }
  function syncButton(theme) {
    var button = document.getElementById("theme-toggle");
    if (!button) return;
    var dark = theme === "dark";
    button.textContent = dark ? "\u2600" : "\u263e";
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    syncButton(theme);
  }
  apply(savedTheme() || systemTheme());
  document.addEventListener("DOMContentLoaded", function () {
    syncButton(document.documentElement.getAttribute("data-theme") || "light");
  });
  document.addEventListener("click", function (event) {
    var button = event.target && event.target.closest ? event.target.closest("#theme-toggle") : null;
    if (!button) return;
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  });
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (event) {
      if (!savedTheme()) apply(event.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) {}
})();
