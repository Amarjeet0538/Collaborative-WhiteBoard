// frontend/src/utils/shapeRecognizer.js

/**
 * Generates perfect geometric coordinates matching the [x, y] format used by the canvas.
 */
const generateGeometry = {
  line: (firstPoint, lastPoint) => [
    [firstPoint[0], firstPoint[1]],
    [lastPoint[0], lastPoint[1]],
  ],

  rectangle: (minX, minY, maxX, maxY) => [
    [minX, minY], // Top-Left
    [maxX, minY], // Top-Right
    [maxX, maxY], // Bottom-Right
    [minX, maxY], // Bottom-Left
    [minX, minY], // Close path back to Top-Left
  ],

  triangle: (minX, minY, maxX, maxY) => {
    const midX = minX + (maxX - minX) / 2;
    return [
      [midX, minY], // Top Apex
      [maxX, maxY], // Bottom-Right
      [minX, maxY], // Bottom-Left
      [midX, minY], // Close path back to Top Apex
    ];
  },

  circle: (minX, minY, maxX, maxY) => {
    const points = [];
    const cx = minX + (maxX - minX) / 2;
    const cy = minY + (maxY - minY) / 2;

    // Maintain standard bounding box scale or make it uniform (perfect circle radius)
    const rx = (maxX - minX) / 2;
    const ry = (maxY - minY) / 2;
    const r = Math.max(rx, ry); // Snaps to a balanced circle uniform radius

    // Generate 64 coordinate steps to build a perfectly smooth vector circle
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * 2 * Math.PI;
      points.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
    }
    return points;
  },
};

/**
 * Parses user raw stroke coordinate data and snaps it to idealized shapes
 * if it meets recognition criteria.
 * @param {Array<Array<number>>} points - Array of [x, y] coordinates
 * @returns {Array<Array<number>>} Snapped geometric point array
 */
export const recognizeAndSnap = (points) => {
  // Discard recognition for accidental small taps/clicks
  if (!points || points.length < 8) return points;

  // 1. Compute bounding box coordinates
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  points.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // Guard against zero-division for single straight axes
  if (width === 0 || height === 0) return points;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  // 2. Measure proximity closure (Distance between drawing start and end)
  const closureDistance = Math.hypot(
    firstPoint[0] - lastPoint[0],
    firstPoint[1] - lastPoint[1],
  );
  const boxDiagonal = Math.hypot(width, height);

  // If the user didn't bring the pen back near the start point, it's an open line
  const isClosedShape = closureDistance < boxDiagonal * 0.35;

  if (!isClosedShape) {
    return generateGeometry.line(firstPoint, lastPoint);
  }

  // 3. Evaluate Closed Geometries via Aspect Ratio & Fill Density
  const aspectRatio = Math.max(width, height) / Math.min(width, height);

  // Measure perimeter point footprint density against standard shapes
  // Count how many points lie close to the center vs margins to split Triangles from Circles
  let centerHits = 0;
  const cx = minX + width / 2;
  const cy = minY + height / 2;
  const innerCoreRadius = Math.min(width, height) * 0.2;

  points.forEach(([x, y]) => {
    if (Math.hypot(x - cx, y - cy) < innerCoreRadius) {
      centerHits++;
    }
  });

  // Triangles cut directly through the upper quadrant space, creating distinct path behaviors
  const centerDensity = centerHits / points.length;

  if (centerDensity > 0.12) {
    return generateGeometry.triangle(minX, minY, maxX, maxY);
  }

  // Standard square aspect boundaries vs elongated strips
  if (aspectRatio < 1.25) {
    return generateGeometry.circle(minX, minY, maxX, maxY);
  } else {
    return generateGeometry.rectangle(minX, minY, maxX, maxY);
  }
};
