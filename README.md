![Hero](preview.png)

# SBRANO, street burger Torino (demo concept)

Portfolio demo by Michel Branche (michelbranche.it). Fictional brand.

Stack: Next.js 15 App Router, TypeScript, Tailwind v4, GSAP + ScrollTrigger + @gsap/react, Lenis, Motion.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Vercel: import the repo, no config needed.

- Fonts: Lunar Blob (SIL OFL), Excon (ITF FFL, web files unmodified), self-hosted via next/font/local in `app/fonts`.
- Images: `public/assets` (WebP, see `public/assets/MANIFEST.md`).
- Cart: React context + localStorage (`components/cart`).
- Binary assets added without git LFS/auth are stored as `*.b64` and decoded at `predev`/`prebuild` by `scripts/fonts.mjs` (outputs are gitignored).
