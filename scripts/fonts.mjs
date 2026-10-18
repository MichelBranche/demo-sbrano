// Decodes text-encoded binaries (*.b64) into real files before dev/build, so fonts and sticker images
// can travel through text-only commits. Runs as predev/prebuild. Covers app/fonts and public/assets/{stickers,promo,menu,ingredients}.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
for (const rel of ["../app/fonts/", "../public/assets/stickers/", "../public/assets/promo/", "../public/assets/menu/", "../public/assets/ingredients/", "../public/assets/ingredients/breads/", "../public/assets/doodles/", "../public/assets/mascot/"]) {
  const dir = new URL(rel, import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".b64"))) {
    writeFileSync(new URL(f.replace(/\.b64$/, ""), dir), Buffer.from(readFileSync(new URL(f, dir), "utf8").replace(/\s+/g, ""), "base64"));
    console.log("decoded:", rel.slice(3) + f.replace(/\.b64$/, ""));
  }
}
