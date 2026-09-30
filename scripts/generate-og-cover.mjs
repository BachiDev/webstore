// Generates public/og-cover.png (1200x630) for link previews.
// Run from the repo root: node scripts/generate-og-cover.mjs (requires sharp, a Next.js dependency).
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="25%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#09090b" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect x="96" y="150" width="10" height="330" rx="5" fill="#8b5cf6" />
  <text x="140" y="290" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="bold" fill="#ffffff">Webstore Demo</text>
  <text x="140" y="365" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#a78bfa">Next.js + Firebase + Stripe</text>
  <text x="140" y="425" font-family="Consolas, monospace" font-size="32" fill="#a1a1aa">Test mode - no real charges</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og-cover.png");
console.log("og-cover.png written");
