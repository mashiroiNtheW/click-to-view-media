import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist", "firefox");

const chromeManifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const firefoxManifest = JSON.parse(readFileSync(join(root, "manifest.firefox.json"), "utf8"));

if (chromeManifest.version !== firefoxManifest.version) {
  throw new Error(
    `Version mismatch: manifest.json is ${chromeManifest.version} but ` +
    `manifest.firefox.json is ${firefoxManifest.version}.`
  );
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of ["content.js", "popup.html", "popup.js"]) {
  cpSync(join(root, file), join(outDir, file));
}
cpSync(join(root, "icons"), join(outDir, "icons"), { recursive: true });

// The Firefox build uses the Firefox manifest as its manifest.json.
firefoxManifest.version = chromeManifest.version;
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(firefoxManifest, null, 2) + "\n");

console.log(`Firefox build ready: ${outDir} (v${chromeManifest.version})`);
