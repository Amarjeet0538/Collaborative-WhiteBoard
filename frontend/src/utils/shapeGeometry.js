const bbox = (start, end) => {
  const minX = Math.min(start[0], end[0]);
  const maxX = Math.max(start[0], end[0]);
  const minY = Math.min(start[1], end[1]);
  const maxY = Math.max(start[1], end[1]);
  return { minX, maxX, minY, maxY };
};

const rectanglePoints = (minX, minY, maxX, maxY) => [
  [minX, minY],
  [maxX, minY],
  [maxX, maxY],
  [minX, maxY],
  [minX, minY],
];

const trianglePoints = (minX, minY, maxX, maxY) => {
  const midX = minX + (maxX - minX) / 2;
  return [
    [midX, minY],
    [maxX, maxY],
    [minX, maxY],
    [midX, minY],
  ];
};

const diamondPoints = (minX, minY, maxX, maxY) => {
  const midX = minX + (maxX - minX) / 2;
  const midY = minY + (maxY - minY) / 2;
  return [
    [midX, minY],
    [maxX, midY],
    [midX, maxY],
    [minX, midY],
    [midX, minY],
  ];
};

const circlePoints = (minX, minY, maxX, maxY) => {
  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;
  const rx = Math.max((maxX - minX) / 2, 1);
  const ry = Math.max((maxY - minY) / 2, 1);
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * 2 * Math.PI;
    points.push([cx + rx * Math.cos(theta), cy + ry * Math.sin(theta)]);
  }
  return points;
};

const starPoints = (minX, minY, maxX, maxY) => {
  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;
  const outerR = Math.max(Math.min(maxX - minX, maxY - minY) / 2, 1);
  const innerR = outerR * 0.4;
  const spikes = 5;
  const step = Math.PI / spikes;
  const points = [];
  let rot = -Math.PI / 2;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    points.push([cx + Math.cos(rot) * r, cy + Math.sin(rot) * r]);
    rot += step;
  }
  points.push(points[0]);
  return points;
};

// Arrow is one continuous path: shaft -> barb -> tip -> barb,
// since strokes in this app render as a single connected polyline.
const arrowPoints = (start, end) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const headLen = Math.min(len * 0.3, 24);
  const headAngle = Math.PI / 7;

  const rotate = (vx, vy, angle) => [
    vx * Math.cos(angle) - vy * Math.sin(angle),
    vx * Math.sin(angle) + vy * Math.cos(angle),
  ];

  const [bx1, by1] = rotate(-ux, -uy, headAngle);
  const [bx2, by2] = rotate(-ux, -uy, -headAngle);

  return [
    start,
    end,
    [end[0] + bx1 * headLen, end[1] + by1 * headLen],
    end,
    [end[0] + bx2 * headLen, end[1] + by2 * headLen],
  ];
};

export const generateShapePoints = (shapeType, start, end) => {
  const { minX, minY, maxX, maxY } = bbox(start, end);

  switch (shapeType) {
    case "rectangle":
      return rectanglePoints(minX, minY, maxX, maxY);
    case "square": {
      const size = Math.max(maxX - minX, maxY - minY);
      const dirX = end[0] >= start[0] ? 1 : -1;
      const dirY = end[1] >= start[1] ? 1 : -1;
      const ex = start[0] + dirX * size;
      const ey = start[1] + dirY * size;
      return rectanglePoints(
        Math.min(start[0], ex),
        Math.min(start[1], ey),
        Math.max(start[0], ex),
        Math.max(start[1], ey),
      );
    }
    case "circle":
      return circlePoints(minX, minY, maxX, maxY);
    case "triangle":
      return trianglePoints(minX, minY, maxX, maxY);
    case "diamond":
      return diamondPoints(minX, minY, maxX, maxY);
    case "star":
      return starPoints(minX, minY, maxX, maxY);
    case "line":
      return [start, end];
    case "arrow":
      return arrowPoints(start, end);
    default:
      return rectanglePoints(minX, minY, maxX, maxY);
  }
};
