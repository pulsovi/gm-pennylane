import { hashString } from './hash.js';

declare type HEX = string;
declare type RGB = [red: number, green: number, blue: number];
declare type HSL = [hue: number, saturation: number, lightness: number];

/**
 * WCAG implementation : https://colorjs.io/docs/contrast#wcag-21
 *
 * @since 0.1.7
 */
export function contrastScore (hex1: HEX, hex2: HEX) {
  // Convertir les couleurs hexadécimales en valeurs RGB
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Calculer la luminance relative pour chaque couleur
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);

  // Calculer le ratio de contraste
  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);

  // Normaliser le score entre 0 et 1
  return (ratio - 1) / 20;
}

export function hexToRgb (hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function relativeLuminance (rgb) {
  const [r, g, b] = rgb.map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHex([r, g, b]: RGB): HEX {
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`;
}

function hslToRgb([h, s, l]: [h: number, s: number, l: number]): [r: number, g: number, b:  number] {
  // Assurez-vous que h, s et l sont dans les bonnes plages
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (300 <= h && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

export function textToColor (text: string): HEX {
  // Calculer le hachage du texte
  const hashValue = hashString(text);

  // Utiliser le hachage pour générer une teinte (0-360)
  const hue = Math.abs(hashValue % 360);

  // Fixer la saturation et la luminosité pour des couleurs vives
  const saturation = 70; // Pourcentage
  const lightness = 50; // Pourcentage

  // Retourner la couleur au format HSL
  return hslToHex([hue, saturation, lightness]);
}

function hslToHex (hsl: HSL): HEX {
  return rgbToHex(hslToRgb(hsl));
}
