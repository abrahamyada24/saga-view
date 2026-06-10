import type { Frame, StudioPhoto } from "@/lib/studio-store";

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function portraitSvg(index: number, name: string, colors: [string, string]) {
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${colors[0]}"/>
          <stop offset="1" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#bg)"/>
      <circle cx="450" cy="390" r="150" fill="rgba(255,255,255,0.82)"/>
      <path d="M210 1060c34-242 156-376 240-376s206 134 240 376" fill="rgba(255,255,255,0.72)"/>
      <rect x="54" y="54" width="792" height="1092" rx="28" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="18"/>
      <text x="450" y="112" text-anchor="middle" font-size="42" font-family="Inter, Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.92)">PHOTO ${String(index).padStart(2, "0")}</text>
      <text x="450" y="1110" text-anchor="middle" font-size="38" font-family="Inter, Arial, sans-serif" font-weight="600" fill="rgba(255,255,255,0.92)">${name}</text>
    </svg>
  `);
}

export const DEMO_SESSION_PHOTOS: StudioPhoto[] = [
  ["Alya", ["#6D8B74", "#E3CAA5"]],
  ["Rafi", ["#355C7D", "#F8B195"]],
  ["Nadia", ["#8E7AB5", "#B5C0D0"]],
  ["Bima", ["#557C55", "#F2FFE9"]],
  ["Salsa", ["#7D5A50", "#F1D1B5"]],
  ["Dika", ["#394867", "#9BA4B5"]],
  ["Maya", ["#A2678A", "#FFD1DA"]],
  ["Reno", ["#2D9596", "#F1FADA"]],
].map(([name, colors], i) => ({
  id: `DEMO_${String(i + 1).padStart(4, "0")}`,
  name: `demo-photo-${String(i + 1).padStart(2, "0")}-${name}.png`,
  fileName: `demo-photo-${String(i + 1).padStart(2, "0")}-${name}.png`,
  relativePath: `Demo-Session/${String(i + 1).padStart(2, "0")}-${name}.png`,
  url: portraitSvg(i + 1, String(name), colors as [string, string]),
  source: "local",
}));

export const DEMO_FRAME: Frame = {
  id: "demo-proof-frame",
  name: "Proof Frame 4 Slot",
  category: "Basic",
  slots: 4,
  premium: false,
  price: 0,
  active: true,
  image: svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect x="0" y="0" width="900" height="1200" fill="none"/>
      <rect x="28" y="28" width="844" height="1144" rx="34" fill="none" stroke="#202124" stroke-width="38"/>
      <rect x="70" y="70" width="760" height="1060" rx="22" fill="none" stroke="#F2D16B" stroke-width="16"/>
      <rect x="105" y="138" width="310.5" height="360" rx="20" fill="none" stroke="#FFFFFF" stroke-width="12"/>
      <rect x="484.5" y="138" width="310.5" height="360" rx="20" fill="none" stroke="#FFFFFF" stroke-width="12"/>
      <rect x="105" y="570" width="310.5" height="360" rx="20" fill="none" stroke="#FFFFFF" stroke-width="12"/>
      <rect x="484.5" y="570" width="310.5" height="360" rx="20" fill="none" stroke="#FFFFFF" stroke-width="12"/>
      <text x="450" y="1044" text-anchor="middle" font-size="48" font-family="Inter, Arial, sans-serif" font-weight="800" fill="#202124">SELF PHOTO</text>
      <text x="450" y="1098" text-anchor="middle" font-size="26" font-family="Inter, Arial, sans-serif" letter-spacing="6" fill="#202124">PROOF EXPORT</text>
    </svg>
  `),
  slotRects: [
    { x: 11.67, y: 11.5, w: 34.5, h: 30 },
    { x: 53.83, y: 11.5, w: 34.5, h: 30 },
    { x: 11.67, y: 47.5, w: 34.5, h: 30 },
    { x: 53.83, y: 47.5, w: 34.5, h: 30 },
  ],
};

export const DEMO_SESSION_NAME = "Demo-Export-Local";
