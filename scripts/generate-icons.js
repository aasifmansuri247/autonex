import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function generatePNG(width, height, pixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', idatData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Icon drawing function: AutoNex emblem with cyan-to-purple gradient on dark background
function iconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = w / 2;

  // Background
  let r = 7, g = 11, b = 24, a = 255; // #070b18

  // Safe radius for emblem
  const scale = isMaskable ? 0.35 : 0.42;
  const radius = w * scale;

  // Outer glowing ring
  if (dist > radius * 0.88 && dist < radius * 1.05) {
    const angle = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI); // 0 to 1
    // Gradient from cyan (#16d9ff: 22, 217, 255) to purple (#7c3aed: 124, 58, 237)
    r = Math.round(22 + (124 - 22) * angle);
    g = Math.round(217 + (58 - 217) * angle);
    b = Math.round(255 + (237 - 255) * angle);
  } else if (dist <= radius * 0.88) {
    // Inner badge
    r = 13; g = 19; b = 37; // #0d1325
    // Inner letter / symbol "A" / "N" stylized
    const normX = dx / (radius * 0.7);
    const normY = dy / (radius * 0.7);
    // Draw stylized "A" / lightning node
    const inHexagon = Math.abs(normX) * 0.866 + Math.abs(normY) * 0.5 < 0.85 && Math.abs(normY) < 0.85;
    if (inHexagon) {
      const angle = (normX + 1) / 2;
      r = Math.round(22 + (124 - 22) * angle);
      g = Math.round(217 + (58 - 217) * angle);
      b = Math.round(255 + (237 - 255) * angle);
      if (Math.abs(normX) < 0.25 && Math.abs(normY) < 0.35) {
        r = 13; g = 19; b = 37;
      }
    }
  }

  return [r, g, b, a];
}

// Logo banner drawing function for AutoNex banner
function logoPixel(x, y, w, h) {
  const normX = x / w;
  const normY = y / h;
  // Transparent or dark background
  let r = 7, g = 11, b = 24, a = 0; // transparent
  // Draw an emblem on the left and text-like blocks on right
  const emblemCenter = h * 0.5;
  const edx = x - h * 0.5;
  const edy = y - emblemCenter;
  const edist = Math.sqrt(edx * edx + edy * edy);
  if (edist < h * 0.38) {
    a = 255;
    const angle = (normX + normY) / 2;
    r = Math.round(22 + (124 - 22) * angle);
    g = Math.round(217 + (58 - 217) * angle);
    b = Math.round(255 + (237 - 255) * angle);
  }
  return [r, g, b, a];
}

const publicDir = path.resolve('public');
const assetsDir = path.resolve('public/assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, (x, y, w, h) => iconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, (x, y, w, h) => iconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, (x, y, w, h) => iconPixel(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, (x, y, w, h) => iconPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(assetsDir, 'autonex-logo.png'), generatePNG(280, 120, logoPixel));

console.log('Successfully generated PWA and asset icons!');
