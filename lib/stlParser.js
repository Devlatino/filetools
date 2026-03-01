/**
 * Parse STL file (ASCII or binary) and return geometry data for Three.js BufferGeometry.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {{ positions: Float32Array, normals: Float32Array, numTriangles: number, bounds: { min: [number,number,number], max: [number,number,number] } }}
 */
export function parseSTL(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const isBinary = isSTLBinary(view);
  if (isBinary) {
    return parseSTLBinary(view);
  }
  return parseSTLASCII(new TextDecoder("utf-8").decode(arrayBuffer));
}

function isSTLBinary(view) {
  if (view.byteLength < 84) return true;
  const numTriangles = view.getUint32(80, true);
  const expectedSize = 84 + numTriangles * 50;
  if (view.byteLength !== expectedSize) return false;
  const header = new Uint8Array(view.buffer, view.byteOffset, 80);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(header);
  return /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text) || text.trim().length === 0;
}

function parseSTLBinary(view) {
  const numTriangles = view.getUint32(80, true);
  const positions = new Float32Array(numTriangles * 9);
  const normals = new Float32Array(numTriangles * 9);
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < numTriangles; i++) {
    const offset = 84 + i * 50;
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    const v1x = view.getFloat32(offset + 12, true);
    const v1y = view.getFloat32(offset + 16, true);
    const v1z = view.getFloat32(offset + 20, true);
    const v2x = view.getFloat32(offset + 24, true);
    const v2y = view.getFloat32(offset + 28, true);
    const v2z = view.getFloat32(offset + 32, true);
    const v3x = view.getFloat32(offset + 36, true);
    const v3y = view.getFloat32(offset + 40, true);
    const v3z = view.getFloat32(offset + 44, true);

    const base = i * 9;
    normals[base] = nx; normals[base + 1] = ny; normals[base + 2] = nz;
    normals[base + 3] = nx; normals[base + 4] = ny; normals[base + 5] = nz;
    normals[base + 6] = nx; normals[base + 7] = ny; normals[base + 8] = nz;
    positions[base] = v1x; positions[base + 1] = v1y; positions[base + 2] = v1z;
    positions[base + 3] = v2x; positions[base + 4] = v2y; positions[base + 5] = v2z;
    positions[base + 6] = v3x; positions[base + 7] = v3y; positions[base + 8] = v3z;

    [v1x, v2x, v3x].forEach((x) => { if (x < minX) minX = x; if (x > maxX) maxX = x; });
    [v1y, v2y, v3y].forEach((y) => { if (y < minY) minY = y; if (y > maxY) maxY = y; });
    [v1z, v2z, v3z].forEach((z) => { if (z < minZ) minZ = z; if (z > maxZ) maxZ = z; });
  }

  return {
    positions,
    normals,
    numTriangles,
    bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
  };
}

function parseSTLASCII(text) {
  const positions = [];
  const normals = [];
  const lines = text.split(/\r?\n/);
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("facet normal")) {
      const nn = line.replace("facet normal", "").trim().split(/\s+/).map(Number);
      const nx = nn[0], ny = nn[1], nz = nn[2];
      const verts = [];
      for (let j = 0; j < 3; j++) {
        i++;
        const vLine = lines[i]?.trim();
        if (vLine?.startsWith("vertex")) {
          const vv = vLine.replace("vertex", "").trim().split(/\s+/).map(Number);
          verts.push(vv[0], vv[1], vv[2]);
          if (vv[0] < minX) minX = vv[0]; if (vv[0] > maxX) maxX = vv[0];
          if (vv[1] < minY) minY = vv[1]; if (vv[1] > maxY) maxY = vv[1];
          if (vv[2] < minZ) minZ = vv[2]; if (vv[2] > maxZ) maxZ = vv[2];
        }
      }
      if (verts.length === 9) {
        positions.push(...verts);
        normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
      }
    }
  }

  const numTriangles = positions.length / 9;
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    numTriangles,
    bounds: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
  };
}
