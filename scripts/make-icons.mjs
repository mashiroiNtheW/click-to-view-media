// Generates the extension icons (16/32/48/128 px) without external tools.
// Run with: node scripts/make-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "icons");

const INK = [18, 22, 32];
const WHITE = [255, 255, 255];
const LIME = [214, 255, 63];
const SAMPLES = 4;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const body = Buffer.concat([name, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0; // no filter
    pixels.copy(raw, row + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function insideRoundedRect(x, y, left, top, width, height, radius) {
  const qx = Math.abs(x - left - width / 2) - width / 2 + radius;
  const qy = Math.abs(y - top - height / 2) - height / 2 + radius;
  const distance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) - radius;
  return distance <= 0;
}

function renderIcon(size) {
  const scale = size * SAMPLES;
  const big = Buffer.alloc(scale * scale * 4);

  const radius = scale * 0.22;
  const half = scale / 2;
  const inner = half - radius;

  for (let py = 0; py < scale; py++) {
    for (let px = 0; px < scale; px++) {
      const x = px + 0.5;
      const y = py + 0.5;

      // Rounded-square background.
      const dx = Math.max(Math.abs(x - half) - inner, 0);
      const dy = Math.max(Math.abs(y - half) - inner, 0);
      const outside = Math.hypot(dx, dy) - radius;
      if (outside > 0) continue;

      let color = INK;

      // Pixel mosaic: hidden media, with one tile revealed in lime.
      const tile = scale * 0.16;
      const gap = scale * 0.055;
      const total = tile * 3 + gap * 2;
      const start = (scale - total) / 2;
      const tileRadius = scale * 0.025;

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const left = start + col * (tile + gap);
          const top = start + row * (tile + gap);
          if (!insideRoundedRect(x, y, left, top, tile, tile, tileRadius)) continue;
          if (row === 1 && col === 1) {
            color = LIME;
          } else {
            const edge = row === 1 || col === 1;
            color = mix(INK, WHITE, edge ? 0.88 : 0.62);
          }
        }
      }

      const index = (py * scale + px) * 4;
      big[index] = color[0];
      big[index + 1] = color[1];
      big[index + 2] = color[2];
      big[index + 3] = 255;
    }
  }

  // Downsample with premultiplied averaging.
  const out = Buffer.alloc(size * size * 4);
  const area = SAMPLES * SAMPLES;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const index = ((y * SAMPLES + sy) * scale + (x * SAMPLES + sx)) * 4;
          const alpha = big[index + 3] / 255;
          r += big[index] * alpha;
          g += big[index + 1] * alpha;
          b += big[index + 2] * alpha;
          a += big[index + 3];
        }
      }
      const index = (y * size + x) * 4;
      const alpha = a / area;
      if (alpha > 0) {
        const factor = 255 / alpha / area;
        out[index] = Math.min(255, Math.round(r * factor));
        out[index + 1] = Math.min(255, Math.round(g * factor));
        out[index + 2] = Math.min(255, Math.round(b * factor));
      }
      out[index + 3] = Math.round(alpha);
    }
  }
  return out;
}

mkdirSync(outDir, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  const png = encodePng(size, renderIcon(size));
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`icons/icon-${size}.png`);
}
