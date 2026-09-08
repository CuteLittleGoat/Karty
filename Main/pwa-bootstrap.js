(function () {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  let isRefreshing = false;

  const forceReload = () => {
    if (isRefreshing) {
      return;
    }
    isRefreshing = true;
    window.location.reload();
  };

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("service-worker.js?v=2026-09-08.3").then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", forceReload);
})();
