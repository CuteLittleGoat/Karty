(function () {
  const MANIFEST_PATH = "manifest-any.webmanifest";
  const params = new URLSearchParams(window.location.search);
  const isAdminEntry = params.get("admin") === "1";

  const applyManifest = (manifestPath) => {
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.href = manifestPath;
      return;
    }

    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = manifestPath;
    document.head.appendChild(manifestLink);
  };

  if (!isAdminEntry) {
    applyManifest(MANIFEST_PATH);
  }

  window.MainPwaConfig = Object.freeze({
    manifest: isAdminEntry ? null : MANIFEST_PATH,
    isAdminEntry
  });
})();
