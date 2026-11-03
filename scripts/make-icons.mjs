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

      // Almond-shaped eye outline.
      const u = (x - half) / scale;
      const v = (y - half) / scale;
      const eyeHalfWidth = 0.30;
      const eyeHalfHeight = 0.155;
      if (Math.abs(u) < eyeHalfWidth) {
        const curve = 1 - (u / eyeHalfWidth) ** 2;
        const edge = eyeHalfHeight * curve;
        const t = Math.abs(v) / edge;
        if (t > 0.74 && t <= 1) color = WHITE;
      }

      // Pupil.
      if (Math.hypot(x - half, y - half) <= scale * 0.085) color = LIME;

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
