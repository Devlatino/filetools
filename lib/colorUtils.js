/**
 * Color conversion utilities (client-side only).
 * Used by the Color Picker tool. No npm dependencies.
 */

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHex({ r, g, b }) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h;
  let s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb({ h, s, l }) {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;
  let r, g, b;
  if (sn === 0) {
    r = g = b = ln;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToCmyk({ r, g, b }) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function cmykToRgb({ c, m, y, k }) {
  const kn = k / 100;
  const r = 255 * (1 - c / 100) * (1 - kn);
  const g = 255 * (1 - m / 100) * (1 - kn);
  const b = 255 * (1 - y / 100) * (1 - kn);
  return {
    r: Math.round(Math.max(0, Math.min(255, r))),
    g: Math.round(Math.max(0, Math.min(255, g))),
    b: Math.round(Math.max(0, Math.min(255, b))),
  };
}

export function getContrastRatio(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
  const whiteContrast = (1 + 0.05) / (L + 0.05);
  const blackContrast = (L + 0.05) / (0 + 0.05);
  return { onWhite: whiteContrast, onBlack: blackContrast, L };
}

export function generateHarmonics(hex) {
  const rgb = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(rgb);
  const rotate = (deg) => rgbToHex(hslToRgb({ h: (h + deg + 360) % 360, s, l }));
  return {
    complementary: [rotate(180)],
    analogous: [rotate(-30), hex, rotate(30)],
    triadic: [hex, rotate(120), rotate(240)],
    splitComplementary: [hex, rotate(150), rotate(210)],
    tetradic: [hex, rotate(90), rotate(180), rotate(270)],
  };
}

export function generateShades(hex) {
  const { h, s } = rgbToHsl(hexToRgb(hex));
  return [10, 20, 30, 40, 50, 60, 70, 80, 90].map((l) =>
    rgbToHex(hslToRgb({ h, s, l }))
  );
}

/** Parse HEX string (with or without #). Returns null if invalid. */
export function parseHex(input) {
  const s = (input || "").trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return "#" + s.toLowerCase();
}

/** Parse "r, g, b" or "r g b" (0-255). Returns null if invalid. */
export function parseRgb(input) {
  const parts = (input || "").trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 3) return null;
  const r = parseInt(parts[0], 10);
  const g = parseInt(parts[1], 10);
  const b = parseInt(parts[2], 10);
  if ([r, g, b].some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return { r, g, b };
}

/** Parse "h, s%, l%" or "h s% l%" (h 0-360, s/l 0-100). Returns null if invalid. */
export function parseHsl(input) {
  const parts = (input || "").trim().replace(/%/g, "").split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 3) return null;
  const h = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  const l = parseInt(parts[2], 10);
  if ([h, s, l].some((n) => isNaN(n))) return null;
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return { h, s, l };
}

/** Parse "c, m, y, k" or "c% m% y% k%" (0-100). Returns null if invalid. */
export function parseCmyk(input) {
  const parts = (input || "").trim().replace(/%/g, "").split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 4) return null;
  const c = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  const k = parseInt(parts[3], 10);
  if ([c, m, y, k].some((n) => isNaN(n) || n < 0 || n > 100)) return null;
  return { c, m, y, k };
}
