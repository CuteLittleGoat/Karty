(function () {
  const APP_VERSION = "2026-04-02.1";
  const RELOAD_GUARD_KEY = "mainPwaControllerChangeReloaded";

  const forceReload = () => {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY) === APP_VERSION) {
      return;
    }
    sessionStorage.setItem(RELOAD_GUARD_KEY, APP_VERSION);
    window.location.reload();
  };

  const triggerWaitingWorkerActivation = (registration) => {
    if (!registration.waiting) {
      return;
    }
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  const bindUpdateFlow = (registration) => {
    if (!registration) {
      return;
    }

    triggerWaitingWorkerActivation(registration);

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;
      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
          triggerWaitingWorkerActivation(registration);
        }
      });
    });
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker
        .register(`service-worker.js?v=${APP_VERSION}`)
        .then((registration) => {
          bindUpdateFlow(registration);
          void registration.update();
        });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      forceReload();
    });
  }
})();
