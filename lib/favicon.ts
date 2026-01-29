export function updateFavicon(isDark: boolean) {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = isDark ? "/favicon-dark.ico" : "/favicon-light.ico";
  }
}

export function initFaviconSwitcher() {
  // Check initial theme
  const isDark =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  updateFavicon(isDark);

  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const isDark = document.documentElement.classList.contains("dark");
        updateFavicon(isDark);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      updateFavicon(e.matches);
    });
}
