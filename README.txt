Click to View Media — Chrome extension

What it does
- Blurs and dims <img> images and <video> elements until you click them.
- Also blurs <input type="image">, SVG <image>, and elements that show an image
  through CSS background-image (best effort).
- Stops autoplay on videos it can access and adds controls after reveal.
- Also catches images/videos added dynamically while browsing, including media
  inside open shadow roots.
- Click the extension icon to adjust blur intensity (18-100 px). The setting is
  saved and applies to every page, including media already hidden on the page.
- On YouTube, automatically mutes ads when they start playing and restores your
  previous volume/mute state when the ad ends.
- On YouTube, automatically clicks the "Skip Ad" button as soon as it appears.

Install in Chrome
1. Unzip click-to-view-media.zip.
2. Open chrome://extensions
3. Turn on Developer mode.
4. Click "Load unpacked".
5. Select the unzipped folder named click-to-view-media.

Notes / limitations
- This version targets ordinary HTML image and video elements. It may not block CSS background images, canvas-rendered media, or media inside some closed shadow roots.
- Some websites may replace or re-render media in ways that require refreshing the page.
- Click an item once to reveal it; click again normally to interact with the page.
- The extension runs on all sites because of the <all_urls> match pattern. You can disable it for specific sites from Chrome's extension controls.
- YouTube ad handling is best-effort and depends on YouTube's current player markup
  (the ad-showing class and Skip button selectors). It may need updating if YouTube
  changes its player.
- CSS background-image detection is heuristic: it checks likely image containers
  (avatars, banners, profiles, photos, thumbnails, role="img") that have no visible
  text or child elements. Complex image compositions may still get through.
