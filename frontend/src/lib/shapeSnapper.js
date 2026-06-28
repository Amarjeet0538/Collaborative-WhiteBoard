/**
 * shapeSnapper.js
 *
 * - Registers $1 templates for every supported shape
 * - recognizeShape(points)  → { shape, score }
 * - buildShapeStroke(shape, originalStroke) → new stroke with perfect points[]
 *
 * Points in your app are stored as [x, y] arrays.
 * $1 needs { X, Y } objects internally — we convert at the boundary.
 */

import { DollarRecognizer } from "./dollar.js";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert your [x,y] array format → $1 {X,Y} objects */
const toXY = (pts) => pts.map(([x, y]) => ({ X: x, Y: y }));

/** Convert $1 {X,Y} objects → your [x,y] array format */
const toArr = (pts) => pts.map(({ X, Y }) => [X, Y]);

/** Generate N evenly-spaced points around an ellipse */
function ellipsePoints(cx, cy, rx, ry, n = 64) {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return { X: cx + rx * Math.cos(a), Y: cy + ry * Math.sin(a) };
  });
}

/** Generate N points along a straight line */
function linePoints(x1, y1, x2, y2, n = 32) {
  return Array.from({ length: n }, (_, i) => ({
    X: x1 + ((x2 - x1) * i) / (n - 1),
    Y: y1 + ((y2 - y1) * i) / (n - 1),
  }));
}

/** Interpolate extra points between polygon corners so $1 has enough data */
function polyPoints(corners, pointsPerSide = 16) {
  const pts = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    for (let j = 0; j < pointsPerSide; j++) {
      const t = j / pointsPerSide;
      pts.push({ X: a.X + (b.X - a.X) * t, Y: a.Y + (b.Y - a.Y) * t });
    }
  }
  return pts;
}

// ── Template definitions (drawn in a 250×250 box centred at 125,125) ───────
// These are the reference strokes $1 learns from.

const C = 125; // centre
const R = 100; // radius / half-side

const TEMPLATES = {
  circle: ellipsePoints(C, C, R, R, 64),

  square: polyPoints([
    { X: C - R, Y: C - R },
    { X: C + R, Y: C - R },
    { X: C + R, Y: C + R },
    { X: C - R, Y: C + R },
  ]),

  rectangle: polyPoints([
    { X: C - R, Y: C - R * 0.6 },
    { X: C + R, Y: C - R * 0.6 },
    { X: C + R, Y: C + R * 0.6 },
    { X: C - R, Y: C + R * 0.6 },
  ]),

  triangle: polyPoints([
    { X: C, Y: C - R },
    { X: C + R, Y: C + R },
    { X: C - R, Y: C + R },
  ]),

  rhombus: polyPoints([
    { X: C, Y: C - R },
    { X: C + R, Y: C },
    { X: C, Y: C + R },
    { X: C - R, Y: C },
  ]),

  line: linePoints(C - R, C, C + R, C, 32),

  // Arrow: horizontal line then V-head at the right end
  arrow: [
    ...linePoints(C - R, C, C + R, C, 24),
    ...linePoints(C + R, C, C + R - 30, C - 30, 8),
    ...linePoints(C + R, C, C + R - 30, C + 30, 8),
  ],

  // Plus: horizontal bar then vertical bar (one continuous stroke)
  plus: [
    ...linePoints(C - R, C, C + R, C, 24),
    ...linePoints(C, C - R, C, C + R, 24),
  ],

  // 5-pointed star
  star: (() => {
    const outer = R,
      inner = R * 0.4,
      n = 5;
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI * i) / n - Math.PI / 2;
      pts.push({ X: C + r * Math.cos(a), Y: C + r * Math.sin(a) });
    }
    pts.push(pts[0]); // close
    return pts;
  })(),
};

// ── Build the recognizer once ───────────────────────────────────────────────

const recognizer = new DollarRecognizer();
Object.entries(TEMPLATES).forEach(([name, pts]) => {
  recognizer.AddGesture(name, pts);
});

// ── Public: recognizeShape ─────────────────────────────────────────────────

/**
 * @param {Array<[number, number]>} points  — your stroke.points array
 * @returns {{ shape: string, score: number }}
 */
export function recognizeShape(points) {
  if (!points || points.length < 4) return { shape: "unknown", score: 0 };
  const result = recognizer.Recognize(toXY(points));
  return { shape: result.name, score: result.score };
}

// ── Public: buildShapeStroke ───────────────────────────────────────────────

/**
 * Generates a new stroke object with perfect geometry, preserving all
 * metadata from the original stroke (id, color, size, tool, createdAt).
 *
 * @param {string} shape
 * @param {{ id, points, color, size, tool, createdAt }} originalStroke
 * @returns {{ id, points, color, size, tool, createdAt }}
 */
export function buildShapeStroke(shape, originalStroke) {
  const pts = originalStroke.points;
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const w = maxX - minX,
    h = maxY - minY;
  const cx = minX + w / 2,
    cy = minY + h / 2;
  const PAD = 4; // small inset so the snapped shape sits inside the bbox

  let newPoints;

  switch (shape) {
    case "circle": {
      const rx = Math.max(w / 2 - PAD, 8);
      const ry = Math.max(h / 2 - PAD, 8);
      newPoints = toArr(ellipsePoints(cx, cy, rx, ry, 64));
      // close the circle
      newPoints.push(newPoints[0]);
      break;
    }

    case "square": {
      const side = Math.min(w, h) / 2 - PAD;
      newPoints = toArr(
        polyPoints([
          { X: cx - side, Y: cy - side },
          { X: cx + side, Y: cy - side },
          { X: cx + side, Y: cy + side },
          { X: cx - side, Y: cy + side },
        ]),
      );
      newPoints.push(newPoints[0]);
      break;
    }

    case "rectangle": {
      const rx2 = w / 2 - PAD,
        ry2 = h / 2 - PAD;
      newPoints = toArr(
        polyPoints([
          { X: cx - rx2, Y: cy - ry2 },
          { X: cx + rx2, Y: cy - ry2 },
          { X: cx + rx2, Y: cy + ry2 },
          { X: cx - rx2, Y: cy + ry2 },
        ]),
      );
      newPoints.push(newPoints[0]);
      break;
    }

    case "triangle": {
      newPoints = toArr(
        polyPoints([
          { X: cx, Y: minY + PAD },
          { X: maxX - PAD, Y: maxY - PAD },
          { X: minX + PAD, Y: maxY - PAD },
        ]),
      );
      newPoints.push(newPoints[0]);
      break;
    }

    case "rhombus": {
      newPoints = toArr(
        polyPoints([
          { X: cx, Y: minY + PAD },
          { X: maxX - PAD, Y: cy },
          { X: cx, Y: maxY - PAD },
          { X: minX + PAD, Y: cy },
        ]),
      );
      newPoints.push(newPoints[0]);
      break;
    }

    case "line": {
      const p0 = pts[0];
      const pN = pts[pts.length - 1];
      newPoints = toArr(linePoints(p0[0], p0[1], pN[0], pN[1], 32));
      break;
    }

    case "arrow": {
      const p0 = pts[0];
      const pN = pts[pts.length - 1];
      const dx = pN[0] - p0[0],
        dy = pN[1] - p0[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      const headLen = Math.min(30, len * 0.25);
      const ang = Math.PI / 6;
      const shaft = toArr(linePoints(p0[0], p0[1], pN[0], pN[1], 28));
      const head1 = toArr(
        linePoints(
          pN[0],
          pN[1],
          pN[0] - headLen * (ux * Math.cos(ang) - uy * Math.sin(ang)),
          pN[1] - headLen * (uy * Math.cos(ang) + ux * Math.sin(ang)),
          6,
        ),
      );
      const head2 = toArr(
        linePoints(
          pN[0],
          pN[1],
          pN[0] - headLen * (ux * Math.cos(-ang) - uy * Math.sin(-ang)),
          pN[1] - headLen * (uy * Math.cos(-ang) + ux * Math.sin(-ang)),
          6,
        ),
      );
      newPoints = [...shaft, ...head1, pN, ...head2];
      break;
    }

    case "plus": {
      const armX = w / 2 - PAD,
        armY = h / 2 - PAD;
      const thick = Math.min(armX, armY) * 0.2;
      // Trace the + as a continuous closed path
      newPoints = toArr([
        { X: cx - thick, Y: cy - armY },
        { X: cx + thick, Y: cy - armY },
        { X: cx + thick, Y: cy - thick },
        { X: cx + armX, Y: cy - thick },
        { X: cx + armX, Y: cy + thick },
        { X: cx + thick, Y: cy + thick },
        { X: cx + thick, Y: cy + armY },
        { X: cx - thick, Y: cy + armY },
        { X: cx - thick, Y: cy + thick },
        { X: cx - armX, Y: cy + thick },
        { X: cx - armX, Y: cy - thick },
        { X: cx - thick, Y: cy - thick },
      ]);
      newPoints.push(newPoints[0]);
      break;
    }

    case "star": {
      const outerR = Math.min(w, h) / 2 - PAD;
      const innerR = outerR * 0.4;
      const n = 5;
      const starPts = [];
      for (let i = 0; i < n * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI * i) / n - Math.PI / 2;
        starPts.push({ X: cx + r * Math.cos(a), Y: cy + r * Math.sin(a) });
      }
      starPts.push(starPts[0]);
      newPoints = toArr(starPts);
      break;
    }

    default:
      // Unknown shape — return original unchanged
      return { ...originalStroke };
  }

  return {
    ...originalStroke,
    points: newPoints,
  };
}
