/**
 * Build lithophane mesh from image data and params, then output as STL binary.
 * Luminance L = 0.299*R + 0.587*G + 0.114*B, t = L/255.
 * Height = minThickness + (1 - t) * (maxThickness - minThickness).
 * Mesh: front grid (variable Z), back plane (Z=0), 4 sides.
 */

/**
 * @param {ImageData} imageData
 * @param {{ widthMm: number, minThickness: number, maxThickness: number, resolution: number }} opts
 * @param {(percent: number) => void} onProgress
 * @returns {{ positions: Float32Array, normals: Float32Array, bounds: { min: [number,number,number], max: [number,number,number] } }}
 */
export function imageToLithophaneGeometry(imageData, opts, onProgress) {
  const { widthMm, minThickness, maxThickness, resolution } = opts;
  const w = imageData.width;
  const h = imageData.data.length / (4 * w);
  const data = imageData.data;

  const longSide = Math.max(w, h);
  const resX = Math.max(2, Math.round((resolution * w) / longSide));
  const resY = Math.max(2, Math.round((resolution * h) / longSide));
  const aspect = h / w;
  const heightMm = widthMm * aspect;
  const stepX = widthMm / (resX - 1);
  const stepY = heightMm / (resY - 1);

  const heightMap = [];
  for (let j = 0; j < resY; j++) {
    if (onProgress && j % Math.max(1, Math.floor(resY / 10)) === 0) {
      onProgress(Math.round((j / resY) * 100));
    }
    const row = [];
    for (let i = 0; i < resX; i++) {
      const sx = (i / (resX - 1)) * (w - 1);
      const sy = (j / (resY - 1)) * (h - 1);
      const ix = Math.floor(sx);
      const iy = Math.floor(sy);
      const fx = sx - ix;
      const fy = sy - iy;
      const i00 = 4 * (iy * w + ix);
      const i10 = 4 * (iy * w + Math.min(ix + 1, w - 1));
      const i01 = 4 * (Math.min(iy + 1, h - 1) * w + ix);
      const i11 = 4 * (Math.min(iy + 1, h - 1) * w + Math.min(ix + 1, w - 1));
      const l00 = 0.299 * data[i00] + 0.587 * data[i00 + 1] + 0.114 * data[i00 + 2];
      const l10 = 0.299 * data[i10] + 0.587 * data[i10 + 1] + 0.114 * data[i10 + 2];
      const l01 = 0.299 * data[i01] + 0.587 * data[i01 + 1] + 0.114 * data[i01 + 2];
      const l11 = 0.299 * data[i11] + 0.587 * data[i11 + 1] + 0.114 * data[i11 + 2];
      const t = (l00 * (1 - fx) * (1 - fy) + l10 * fx * (1 - fy) + l01 * (1 - fx) * fy + l11 * fx * fy) / 255;
      const z = minThickness + (1 - t) * (maxThickness - minThickness);
      row.push(z);
    }
    heightMap.push(row);
  }
  if (onProgress) onProgress(100);

  const positions = [];
  const normals = [];
  const halfW = widthMm / 2;
  const halfH = heightMm / 2;

  function addTriangle(v0, v1, v2, n) {
    positions.push(v0[0], v0[1], v0[2], v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
    normals.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }
  function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
    return [v[0] / len, v[1] / len, v[2] / len];
  }

  for (let j = 0; j < resY - 1; j++) {
    for (let i = 0; i < resX - 1; i++) {
      const x0 = -halfW + i * stepX;
      const x1 = -halfW + (i + 1) * stepX;
      const y0 = halfH - j * stepY;
      const y1 = halfH - (j + 1) * stepY;
      const z00 = heightMap[j][i];
      const z10 = heightMap[j][i + 1];
      const z01 = heightMap[j + 1][i];
      const z11 = heightMap[j + 1][i + 1];
      const p00 = [x0, y0, z00];
      const p10 = [x1, y0, z10];
      const p01 = [x0, y1, z01];
      const p11 = [x1, y1, z11];
      const e1 = [x1 - x0, 0, z10 - z00];
      const e2 = [0, y1 - y0, z01 - z00];
      let n = normalize(cross(e1, e2));
      if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
      addTriangle(p00, p10, p01, n);
      const e1b = [x1 - x0, 0, z11 - z01];
      const e2b = [0, y1 - y0, z11 - z10];
      let nb = normalize(cross(e1b, e2b));
      if (nb[2] < 0) nb = [-nb[0], -nb[1], -nb[2]];
      addTriangle(p01, p10, p11, nb);
    }
  }

  const zBack = 0;
  const pBack = [
    [-halfW, halfH, zBack],
    [halfW, halfH, zBack],
    [-halfW, -halfH, zBack],
    [halfW, -halfH, zBack],
  ];
  const nBack = [0, 0, -1];
  addTriangle(pBack[0], pBack[2], pBack[1], nBack);
  addTriangle(pBack[1], pBack[2], pBack[3], nBack);

  const left = [-halfW, halfH, zBack];
  const right = [halfW, halfH, zBack];
  const bottomLeft = [-halfW, -halfH, zBack];
  const bottomRight = [halfW, -halfH, zBack];
  const topLeft = [-halfW, halfH, heightMap[0][0]];
  const topRight = [halfW, halfH, heightMap[0][resX - 1]];
  const botLeft = [-halfW, -halfH, heightMap[resY - 1][0]];
  const botRight = [halfW, -halfH, heightMap[resY - 1][resX - 1]];

  const nLeft = [-1, 0, 0];
  addTriangle(left, bottomLeft, topLeft, nLeft);
  addTriangle(bottomLeft, botLeft, topLeft, nLeft);
  const nRight = [1, 0, 0];
  addTriangle(right, topRight, bottomRight, nRight);
  addTriangle(bottomRight, topRight, botRight, nRight);
  const nTop = [0, 1, 0];
  addTriangle(left, topLeft, right, nTop);
  addTriangle(right, topLeft, topRight, nTop);
  const nBottom = [0, -1, 0];
  addTriangle(bottomLeft, bottomRight, botLeft, nBottom);
  addTriangle(bottomRight, botRight, botLeft, nBottom);

  const posArr = new Float32Array(positions);
  const normArr = new Float32Array(normals);
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < posArr.length; i += 3) {
    const x = posArr[i], y = posArr[i + 1], z = posArr[i + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return {
    positions: posArr,
    normals: normArr,
    bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
  };
}

/**
 * Write STL binary from positions/normals (interleaved per triangle: 9 floats positions, 9 floats normals per tri).
 */
export function lithophaneGeometryToSTLBinary(positions, normals) {
  const numTriangles = positions.length / 9;
  const headerSize = 80;
  const totalSize = headerSize + 4 + numTriangles * 50;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < headerSize; i++) view.setUint8(offset++, 0);
  view.setUint32(offset, numTriangles, true);
  offset += 4;
  for (let i = 0; i < numTriangles; i++) {
    const nBase = i * 9;
    view.setFloat32(offset, normals[nBase], true);
    offset += 4;
    view.setFloat32(offset, normals[nBase + 1], true);
    offset += 4;
    view.setFloat32(offset, normals[nBase + 2], true);
    offset += 4;
    const pBase = i * 9;
    view.setFloat32(offset, positions[pBase], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 1], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 2], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 3], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 4], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 5], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 6], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 7], true);
    offset += 4;
    view.setFloat32(offset, positions[pBase + 8], true);
    offset += 4;
    view.setUint16(offset, 0, true);
    offset += 2;
  }
  return buffer;
}
