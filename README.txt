Click to View Media — Chrome extension and Firefox for Android (local build)

What it does
- Blurs and dims <img> images and <video> elements. Click an item to reveal it,
  click it again to blur it again.
- Also blurs <input type="image">, SVG <image>, and elements that show an image
  through CSS background-image (best effort).
- Stops autoplay on videos it can access and adds controls after reveal.
- Also catches images/videos added dynamically while browsing, including media
  inside open shadow roots.
- Click the extension icon to adjust blur intensity (18-100 px). The setting is
  saved and applies to every page, including media already hidden on the page.
- On YouTube (desktop and m.youtube.com), automatically mutes ads when they start
  playing and restores your previous volume/mute state when the ad ends.
- On YouTube, automatically clicks the "Skip Ad" button as soon as it appears.

Install in Chrome
1. Unzip click-to-view-media.zip.
2. Open chrome://extensions
3. Turn on Developer mode.
4. Click "Load unpacked".
5. Select the unzipped folder named click-to-view-media.

Firefox for Android (Beta) — local install
This build is for local development only. It is not published or signed on AMO.

You need:
- Firefox Beta for Android, version 142 or newer.
- Node.js 18 or newer on your computer.
- A USB cable, plus Developer options and USB debugging enabled on the phone.

Steps:
1. Install dependencies once:
     npm install
2. Build the Firefox version into dist/firefox:
     npm run build:firefox
3. Connect the phone, then confirm the computer can see it:
     adb devices
   Authorize the USB debugging prompt on the phone if it appears.
4. Install and launch the temporary add-on:
     npm run run:android
   This runs web-ext against Firefox Beta (org.mozilla.firefox_beta) and opens
   the browser on the phone. Keep the terminal running while you test.
5. In Firefox on the phone, open the menu, go to Extensions, and tap
   "Click to View Media" to open the blur setting popup.

Notes:
- The web-ext install is temporary. Firefox removes the add-on when the browser
  process ends. Re-run npm run run:android to load it again.
- A permanent install on Android would require an AMO-signed XPI, which this
  local-only build deliberately does not produce.
- If adb sees more than one device, add --adb-device=<serial> to the end of the
  web-ext command. If web-ext cannot find Firefox Beta, check that the APK name
  is org.mozilla.firefox_beta with --firefox-apk=org.mozilla.firefox_beta.
- On Firefox, the blur setting is stored with storage.local, so it stays on that
  device. Chrome continues to use storage.sync.
- To check the build without a phone:
     npm run lint:firefox
  To create an unsigned zip for inspection:
     npm run package:firefox

Notes / limitations
- This version targets ordinary HTML image and video elements. It may not block CSS background images, canvas-rendered media, or media inside some closed shadow roots.
- Some websites may replace or re-render media in ways that require refreshing the page.
- Click an item to reveal it, and click that same item again to blur it. Each item toggles independently, so revealing one image never reveals the rest of the page. On touch screens, use a tap.
- The extension runs on all sites because of the <all_urls> match pattern. You can disable it for specific sites from the browser's extension controls.
- YouTube ad handling is best-effort and depends on YouTube's current player markup
  (the ad-showing class and Skip button selectors). It may need updating if YouTube
  changes its player, and mobile player markup changes more often than desktop.
- CSS background-image detection is heuristic: it checks likely image containers
  (avatars, banners, profiles, photos, thumbnails, role="img") that have no visible
  text or child elements. Complex image compositions may still get through.
