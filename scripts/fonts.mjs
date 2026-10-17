// Decodes text-encoded font files (app/fonts/*.woff2.b64) into real .woff2 before dev/build,
// so binary fonts can travel through text-only commits. Runs as predev/prebuild.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = new URL("../app/fonts/", import.meta.url);
for (const f of readdirSync(dir).filter((n) => n.endsWith(".woff2.b64"))) {
  const out = new URL(f.replace(/\.b64$/, ""), dir);
  writeFileSync(out, Buffer.from(readFileSync(new URL(f, dir), "utf8").replace(/\s+/g, ""), "base64"));
  console.log("font:", f.replace(/\.b64$/, ""));
}
