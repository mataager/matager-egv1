/**
 * noFlashScript: Injected into the <head> to synchronously apply the user's
 * theme before the first frame paints, preventing theme flashing (FOUC).
 */
export const THEME_STORAGE_KEY = "matager-theme";

export const noFlashScript = `
(function() {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = "dark";
    if (stored === "light" || stored === "dark") {
      theme = stored;
    } else {
      var mql = window.matchMedia("(prefers-color-scheme: light)");
      if (mql.matches) {
        theme = "light";
      }
    }
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  }
})();
`;
