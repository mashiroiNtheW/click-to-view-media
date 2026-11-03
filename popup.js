(() => {
  "use strict";

  const DEFAULT_BLUR_PX = 18;
  const MIN_BLUR_PX = 18;
  const MAX_BLUR_PX = 100;
  const slider = document.getElementById("blur");
  const valueLabel = document.getElementById("blur-value");
  const resetButton = document.getElementById("reset");
  let saveTimer = null;

  const isFirefoxApi = typeof browser !== "undefined" && !!browser.runtime;
  const extensionApi = isFirefoxApi
    ? browser
    : (typeof chrome !== "undefined" && chrome.storage ? chrome : null);
  let storageArea = null;
  if (extensionApi && extensionApi.storage) {
    if (isFirefoxApi) {
      storageArea = extensionApi.storage.local || extensionApi.storage.sync;
    } else {
      storageArea = extensionApi.storage.sync || extensionApi.storage.local;
    }
  }

  function normalizeBlurPx(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_BLUR_PX;
    return Math.min(MAX_BLUR_PX, Math.max(MIN_BLUR_PX, Math.round(number)));
  }

  function render(value) {
    const px = normalizeBlurPx(value);
    slider.value = String(px);
    valueLabel.textContent = `${px}px`;
  }

  function storageGet(defaults) {
    if (!storageArea) return Promise.resolve(defaults);
    return new Promise(resolve => {
      let settled = false;
      const done = value => {
        if (settled) return;
        settled = true;
        resolve(value || defaults);
      };
      try {
        if (isFirefoxApi) {
          storageArea.get(defaults).then(done, () => done(defaults));
        } else {
          storageArea.get(defaults, done);
        }
      } catch (_) {
        done(defaults);
      }
    });
  }

  function storageSet(value) {
    if (!storageArea) return;
    try {
      if (isFirefoxApi) storageArea.set(value).catch(() => {});
      else storageArea.set(value, () => {});
    } catch (_) {}
  }

  function save(value) {
    storageSet({ blurPx: normalizeBlurPx(value) });
  }

  storageGet({ blurPx: DEFAULT_BLUR_PX }).then(data => render(data.blurPx));

  slider.addEventListener("input", () => {
    const px = normalizeBlurPx(slider.value);
    render(px);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(px), 150);
  });

  slider.addEventListener("change", () => {
    clearTimeout(saveTimer);
    save(Number(slider.value));
  });

  resetButton.addEventListener("click", () => {
    clearTimeout(saveTimer);
    render(DEFAULT_BLUR_PX);
    save(DEFAULT_BLUR_PX);
  });
})();
