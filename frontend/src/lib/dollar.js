const NumPoints = 64;
const SquareSize = 250.0;
const Origin = { X: 0, Y: 0 };
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = (Math.PI * 45) / 180;
const AnglePrecision = (Math.PI * 2) / 180;
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0));

function Point(x, y) {
  return { X: x, Y: y };
}

function Resample(points, n) {
  let I = PathLength(points) / (n - 1);
  let D = 0.0;
  const newpoints = [{ X: points[0].X, Y: points[0].Y }];
  for (let i = 1; i < points.length; i++) {
    const d = Distance(points[i - 1], points[i]);
    if (D + d >= I) {
      const qx =
        points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
      const qy =
        points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
      const q = { X: qx, Y: qy };
      newpoints.push(q);
      points.splice(i, 0, q);
      D = 0.0;
    } else {
      D += d;
    }
  }
  if (newpoints.length === n - 1) {
    newpoints.push({
      X: points[points.length - 1].X,
      Y: points[points.length - 1].Y,
    });
  }
  return newpoints;
}

function IndicativeAngle(points) {
  const c = Centroid(points);
  return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}

function RotateBy(points, radians) {
  const c = Centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => ({
    X: (p.X - c.X) * cos - (p.Y - c.Y) * sin + c.X,
    Y: (p.X - c.X) * sin + (p.Y - c.Y) * cos + c.Y,
  }));
}

function ScaleTo(points, size) {
  const B = BoundingBox(points);
  return points.map((p) => ({
    X: p.X * (size / B.width),
    Y: p.Y * (size / B.height),
  }));
}

function TranslateTo(points, pt) {
  const c = Centroid(points);
  return points.map((p) => ({
    X: p.X + pt.X - c.X,
    Y: p.Y + pt.Y - c.Y,
  }));
}

function Vectorize(points) {
  let sum = 0.0;
  const vector = [];
  for (const p of points) {
    vector.push(p.X);
    vector.push(p.Y);
    sum += p.X * p.X + p.Y * p.Y;
  }
  const magnitude = Math.sqrt(sum);
  return vector.map((v) => v / magnitude);
}

function OptimalCosineDistance(v1, v2) {
  let a = 0.0,
    b = 0.0;
  for (let i = 0; i < v1.length; i += 2) {
    a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
    b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
  }
  const angle = Math.atan(b / a);
  return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}

function DistanceAtBestAngle(points, T, a, b, threshold) {
  let x1 = Phi * a + (1.0 - Phi) * b;
  let f1 = DistanceAtAngle(points, T, x1);
  let x2 = (1.0 - Phi) * a + Phi * b;
  let f2 = DistanceAtAngle(points, T, x2);
  while (Math.abs(b - a) > threshold) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = Phi * a + (1.0 - Phi) * b;
      f1 = DistanceAtAngle(points, T, x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1.0 - Phi) * a + Phi * b;
      f2 = DistanceAtAngle(points, T, x2);
    }
  }
  return Math.min(f1, f2);
}

function DistanceAtAngle(points, T, radians) {
  const newpoints = RotateBy(points, radians);
  return PathDistance(newpoints, T.points);
}

function Centroid(points) {
  let x = 0.0,
    y = 0.0;
  for (const p of points) {
    x += p.X;
    y += p.Y;
  }
  return { X: x / points.length, Y: y / points.length };
}

function BoundingBox(points) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.X);
    maxX = Math.max(maxX, p.X);
    minY = Math.min(minY, p.Y);
    maxY = Math.max(maxY, p.Y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function PathDistance(pts1, pts2) {
  let d = 0.0;
  for (let i = 0; i < pts1.length; i++) d += Distance(pts1[i], pts2[i]);
  return d / pts1.length;
}

function PathLength(points) {
  let d = 0.0;
  for (let i = 1; i < points.length; i++)
    d += Distance(points[i - 1], points[i]);
  return d;
}

function Distance(p1, p2) {
  return Math.sqrt((p2.X - p1.X) ** 2 + (p2.Y - p1.Y) ** 2);
}

// ── Public API ────────────────────────────────────────────────────────────────

export class DollarRecognizer {
  constructor() {
    this.Unistrokes = [];
  }

  AddGesture(name, points) {
    this.Unistrokes.push(this._makeUnistroke(name, points));
    const num = this.Unistrokes.filter((u) => u.name === name).length;
    return num;
  }

  _makeUnistroke(name, points) {
    let pts = Resample(points, NumPoints);
    const radians = IndicativeAngle(pts);
    pts = RotateBy(pts, -radians);
    pts = ScaleTo(pts, SquareSize);
    pts = TranslateTo(pts, Origin);
    const vector = Vectorize(pts);
    return { name, points: pts, vector };
  }

  Recognize(points, useProtractor = true) {
    let pts = Resample([...points], NumPoints);
    const radians = IndicativeAngle(pts);
    pts = RotateBy(pts, -radians);
    pts = ScaleTo(pts, SquareSize);
    pts = TranslateTo(pts, Origin);
    const vector = Vectorize(pts);

    let bestScore = Infinity;
    let bestTemplate = null;

    for (const t of this.Unistrokes) {
      let d;
      if (useProtractor) {
        d = OptimalCosineDistance(t.vector, vector);
      } else {
        d = DistanceAtBestAngle(
          pts,
          t,
          -AngleRange,
          AngleRange,
          AnglePrecision,
        );
      }
      if (d < bestScore) {
        bestScore = d;
        bestTemplate = t;
      }
    }

    if (!bestTemplate) return { name: "unknown", score: 0 };

    // Convert distance to 0–1 score (1 = perfect match)
    const score = useProtractor
      ? 1.0 - bestScore
      : 1.0 - bestScore / HalfDiagonal;

    return { name: bestTemplate.name, score: Math.max(0, Math.min(1, score)) };
  }
}
