# Click to View Media

**Images and video stay blurred until you click. Click again to hide. YouTube ads get muted and skipped.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-1f56ff?style=flat-square)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Firefox Android](https://img.shields.io/badge/Firefox%20Android-142%2B-ff7139?style=flat-square&logo=firefoxbrowser&logoColor=white)](https://www.mozilla.org/firefox/browsers/mobile/android/)
[![No data collection](https://img.shields.io/badge/Data%20collection-none-2ea043?style=flat-square&labelColor=121620)](#permissions--privacy)

Click to View Media treats every page like someone is reading over your shoulder. Images, video, and likely CSS background images start blurred and dimmed. One click reveals the exact item you clicked — everything else stays hidden. Click it again when you're done.

Built for Chrome and Firefox for Android Beta. Everything runs locally: no account, no server, no telemetry.

- **Landing page:** https://mashirointhew.github.io/click-to-view-media/
- **Source:** https://github.com/mashiroiNtheW/click-to-view-media

---

## Features

| Feature | What it does |
|---|---|
| **Per-item toggle** | Every image and video is independent. Revealing one never reveals the rest of the page. Click the same item again to blur it. |
| **Adjustable blur** | Set blur from **18px to 100px** in the popup. The value is saved and applied to media already on the page. |
| **Broad media coverage** | `<img>`, `<video>`, `<input type="image">`, SVG `<image>`, chat emotes and emoji (including CSS-background emotes), and heuristic CSS `background-image` elements such as avatars, banners, thumbnails, and `role="img"`. |
| **Dynamic pages** | Lazy-loaded media, single-page navigation, and open shadow roots are picked up as they appear. New media is blurred in the same tick it is inserted, so it never flashes unblurred; heavier background scans are batched with `requestAnimationFrame`. |
| **YouTube ads** | Ads are muted when they start, your previous mute/volume state is restored afterwards, and Skip is clicked as soon as it appears. Works on desktop YouTube and `m.youtube.com`. |
| **Local by design** | No network calls and no data collection. The extension stores only your blur preference. |

---

## Install on Chrome

1. Download the repository ZIP:
   https://github.com/mashiroiNtheW/click-to-view-media/archive/refs/heads/main.zip
2. Unzip it somewhere permanent — Chrome reads the extension from that folder.
3. Open `chrome://extensions` and turn on **Developer mode**.
4. Click **Load unpacked** and select the folder that contains `manifest.json`.
5. Pin the extension, open its popup, and choose your blur intensity. Refresh open tabs to apply it everywhere.

The same folder also works in other Chromium browsers that support MV3 unpacked extensions, such as Edge and Brave.

---

## Install on Firefox for Android (Beta) — local only

This build is **not published or signed on AMO**. It installs temporarily over USB with [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/). That makes it a development install, not a store install.

### Requirements

- Firefox **Beta** for Android, version **142 or newer**
- Node.js **18 or newer** on your computer
- A USB cable
- **Developer options** and **USB debugging** enabled on the phone
- `adb` available on your `PATH`

### Steps

```bash
# 1. Install the build tools (once)
npm install

# 2. Build the Firefox version into dist/firefox
npm run build:firefox

# 3. Confirm the phone is visible
adb devices

# 4. Install and launch the temporary add-on
npm run run:android
```

`run:android` targets `org.mozilla.firefox_beta` and keeps running in the terminal while you test. Leave it open.

Then, in Firefox on the phone:

1. Open the menu.
2. Go to **Extensions**.
3. Tap **Click to View Media** to open the blur popup.

### Good to know

- The web-ext install is **temporary**. Firefox removes the add-on when the browser process ends. Re-run `npm run run:android` to load it again.
- A permanent Android install would require an AMO-signed XPI. This project deliberately does not produce one.
- If more than one device is connected, append `--adb-device=<serial>` to the `web-ext` command.
- If web-ext cannot find Firefox Beta, confirm the APK name is `org.mozilla.firefox_beta` or pass `--firefox-apk=org.mozilla.firefox_beta`.
- On Firefox, the blur value is stored in `browser.storage.local`, so it stays on that device. Chrome continues to use `storage.sync`.

---

## Usage

- **Reveal:** click or tap a blurred image or video. Only that item is revealed.
- **Hide:** click or tap the revealed item again. It returns to its original blur.
- **Blur amount:** open the toolbar popup (Chrome) or the Extensions menu (Firefox Android) and move the slider. Changes apply immediately to open pages.
- **YouTube:** ad audio is muted automatically while an ad is playing, previous volume is restored when it ends, and the Skip button is clicked when available.

Because the toggle consumes the click, a revealed image wrapped in a link will re-blur instead of navigating. This is intentional: the extension is a privacy toggle, not a link opener.

---

## Build, lint, and package

```bash
npm install
npm run build:firefox     # copy shared files + Firefox manifest into dist/firefox
npm run lint:firefox      # web-ext lint (runs the build first)
npm run package:firefox   # unsigned zip in web-ext-artifacts/
npm run run:android       # build + install on Firefox Android Beta over USB
npm run icons             # regenerate icons/icon-{16,32,48,128}.png
```

### Project structure

```
content.js              shared content script (blur, toggle, YouTube ads)
popup.html              shared popup UI, responsive for Android
popup.js                shared popup logic and storage adapter
manifest.json           Chrome MV3 manifest
manifest.firefox.json   Firefox MV3 manifest (gecko id, Android minimum)
icons/                  generated 16/32/48/128 px icons
scripts/                Firefox build and icon generation scripts
index.html              GitHub Pages landing page
dist/firefox/           generated Firefox build (git ignored)
web-ext-artifacts/      generated zips (git ignored)
```

The Chrome and Firefox builds share the same `content.js`, `popup.html`, and `popup.js`. Only the manifest differs. Both manifests must have the same version; the build script fails if they drift.

---

## Permissions & privacy

- **`storage`** — saves the blur value only.
- **`<all_urls>` host permission** — required for the content script to blur media on any page you visit.
- **No data collection.** `manifest.firefox.json` declares `browser_specific_settings.gecko.data_collection_permissions.required: ["none"]`.
- **No network requests** are made by the extension. Nothing is sent anywhere.

YouTube ad handling is best-effort and depends on YouTube's current player markup. It may need updating when YouTube changes its player.

---

## Limitations

- CSS `background-image` detection is heuristic. Complex compositions, canvas-rendered media, and closed shadow roots may not be covered.
- Sites that aggressively re-render media may need a refresh before the blur applies.
- Clicking a revealed video toggles it back to blurred; native video controls are affected by the same click.
- Mobile YouTube player markup changes more often than desktop, so ad skipping is less reliable there.
- The Firefox Android install is temporary by design (see above).

---

## Version

**1.4.0** — Chrome MV3 · Firefox for Android Beta 142+ · local-only Firefox build.

Not affiliated with YouTube or Google.
