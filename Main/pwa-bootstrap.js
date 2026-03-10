(function () {
  const config = window.MainPwaConfig;
  if (!config) {
    return;
  }

  const profile =
    config.ORIENTATION_PROFILES[config.selectedProfile] ||
    config.ORIENTATION_PROFILES[config.DEFAULT_PROFILE];

  const manifestLink = document.getElementById("pwaManifestLink");
  if (manifestLink && profile?.manifest) {
    manifestLink.setAttribute("href", profile.manifest);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("service-worker.js");
    });
  }
})();
