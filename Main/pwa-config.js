(function () {
  const ORIENTATION_PROFILES = Object.freeze({
    portrait: {
      manifest: "manifest-portrait.webmanifest",
      orientation: "portrait"
    },
    landscape: {
      manifest: "manifest-landscape.webmanifest",
      orientation: "landscape"
    },
    any: {
      manifest: "manifest-any.webmanifest",
      orientation: "any"
    }
  });

  const DEFAULT_PROFILE = "portrait";
  const PROFILE_STORAGE_KEY = "mainPwaOrientationProfile";
  const PROFILE_QUERY_PARAM = "pwaOrientation";

  const normalizeProfile = (value) => {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(ORIENTATION_PROFILES, normalized)
      ? normalized
      : null;
  };

  const readProfileFromQuery = () => {
    try {
      const query = new URLSearchParams(window.location.search);
      return normalizeProfile(query.get(PROFILE_QUERY_PARAM));
    } catch (error) {
      return null;
    }
  };

  const readProfileFromStorage = () => {
    try {
      return normalizeProfile(window.localStorage.getItem(PROFILE_STORAGE_KEY));
    } catch (error) {
      return null;
    }
  };

  const selectedProfile =
    readProfileFromQuery() ?? readProfileFromStorage() ?? DEFAULT_PROFILE;

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, selectedProfile);
  } catch (error) {
    // Ignore storage errors.
  }

  window.MainPwaConfig = Object.freeze({
    DEFAULT_PROFILE,
    PROFILE_STORAGE_KEY,
    PROFILE_QUERY_PARAM,
    ORIENTATION_PROFILES,
    selectedProfile
  });
})();
