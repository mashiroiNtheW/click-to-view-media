(() => {
  "use strict";

  const DEFAULT_BLUR_PX = 18;
  const MIN_BLUR_PX = 18;
  const MAX_BLUR_PX = 100;
  const slider = document.getElementById("blur");
  const valueLabel = document.getElementById("blur-value");
  const resetButton = document.getElementById("reset");
  let saveTimer = null;

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

  function save(value) {
    const px = normalizeBlurPx(value);
    chrome.storage.sync.set({ blurPx: px });
  }

  chrome.storage.sync.get({ blurPx: DEFAULT_BLUR_PX }, data => render(data.blurPx));

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
