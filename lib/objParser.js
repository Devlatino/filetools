/**
 * Parse OBJ text and return vertices and face indices (0-based).
 * Supports: v x y z, f 1 2 3, f 1/1/1 2/2/2 3/3/3, f 1//1 2//2 3//3.
 * Quads are split into two triangles: [0,1,2] and [0,2,3].
 * @param {string} text
 * @returns {{ vertices: [number,number,number][], faces: number[][] }} faces are 0-based indices, each triple = one triangle
 */
export function parseOBJ(text) {
  const vertices = [];
  const faces = [];

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("v ")) {
      const parts = trimmed.slice(2).trim().split(/\s+/);
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        vertices.push([x, y, z]);
      }
      continue;
    }
    if (trimmed.startsWith("f ")) {
      const parts = trimmed.slice(2).trim().split(/\s+/);
      const indices = [];
      for (const p of parts) {
        const first = p.split("/")[0];
        const idx = parseInt(first, 10);
        if (Number.isInteger(idx) && idx !== 0) {
          indices.push(idx > 0 ? idx - 1 : vertices.length + idx);
        }
      }
      if (indices.length === 3) {
        faces.push(indices[0], indices[1], indices[2]);
      } else if (indices.length === 4) {
        faces.push(indices[0], indices[1], indices[2], indices[0], indices[2], indices[3]);
      }
    }
  }

  return { vertices, faces };
}

/**
 * Build Float32Array positions and normals for Three.js from parsed OBJ.
 * Normals are computed per triangle (cross product).
 */
export function objToBufferGeometry(parsed) {
  const { vertices, faces } = parsed;
  const numTriangles = faces.length / 3;
  const positions = new Float32Array(numTriangles * 9);
  const normals = new Float32Array(numTriangles * 9);

  for (let i = 0; i < numTriangles; i++) {
    const i0 = faces[i * 3];
    const i1 = faces[i * 3 + 1];
    const i2 = faces[i * 3 + 2];
    const v0 = vertices[i0];
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
    const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    const base = i * 9;
    positions[base] = v0[0];
    positions[base + 1] = v0[1];
    positions[base + 2] = v0[2];
    positions[base + 3] = v1[0];
    positions[base + 4] = v1[1];
    positions[base + 5] = v1[2];
    positions[base + 6] = v2[0];
    positions[base + 7] = v2[1];
    positions[base + 8] = v2[2];
    normals[base] = nx;
    normals[base + 1] = ny;
    normals[base + 2] = nz;
    normals[base + 3] = nx;
    normals[base + 4] = ny;
    normals[base + 5] = nz;
    normals[base + 6] = nx;
    normals[base + 7] = ny;
    normals[base + 8] = nz;
  }

  return { positions, normals, numTriangles };
}

/**
 * Compute bounding box from positions (Float32Array, 9 floats per triangle).
 */
function boundsFromPositions(positions) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

/**
 * Build STL binary from parsed OBJ (vertices + faces).
 * 80-byte header, Uint32 num triangles, then per triangle: normal Float32x3, v1,v2,v3 Float32x3, attribute Uint16.
 */
export function buildSTLBinary(parsed) {
  const { vertices, faces } = parsed;
  const numTriangles = faces.length / 3;
  const headerSize = 80;
  const triangleSize = 12 + 12 + 12 + 12 + 2;
  const totalSize = headerSize + 4 + numTriangles * 50;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  let offset = 0;
  for (let i = 0; i < headerSize; i++) view.setUint8(offset++, 0);
  view.setUint32(offset, numTriangles, true);
  offset += 4;

  for (let i = 0; i < numTriangles; i++) {
    const i0 = faces[i * 3];
    const i1 = faces[i * 3 + 1];
    const i2 = faces[i * 3 + 2];
    const v0 = vertices[i0];
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
    const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    view.setFloat32(offset, nx, true);
    offset += 4;
    view.setFloat32(offset, ny, true);
    offset += 4;
    view.setFloat32(offset, nz, true);
    offset += 4;
    view.setFloat32(offset, v0[0], true);
    offset += 4;
    view.setFloat32(offset, v0[1], true);
    offset += 4;
    view.setFloat32(offset, v0[2], true);
    offset += 4;
    view.setFloat32(offset, v1[0], true);
    offset += 4;
    view.setFloat32(offset, v1[1], true);
    offset += 4;
    view.setFloat32(offset, v1[2], true);
    offset += 4;
    view.setFloat32(offset, v2[0], true);
    offset += 4;
    view.setFloat32(offset, v2[1], true);
    offset += 4;
    view.setFloat32(offset, v2[2], true);
    offset += 4;
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

export function getBoundsFromPositions(positions) {
  return boundsFromPositions(positions);
}
