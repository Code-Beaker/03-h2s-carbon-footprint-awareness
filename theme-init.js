(function () {
  const savedTheme = localStorage.getItem("theme");
  const activeTheme = savedTheme || "dark";
  document.documentElement.setAttribute("data-theme", activeTheme);
  document.documentElement.style.colorScheme = activeTheme;
})();
