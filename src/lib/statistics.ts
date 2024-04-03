const asc = (arr: number[]) => arr.sort((a, b) => a - b);

export function quantileOnSorted(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (rest > 0) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function quantile(arr: number[], q: number) {
  const sorted = asc(arr);
  return quantileOnSorted(sorted, q);
}

export interface Stats {
  min: number;
  p1: number;
  p5: number;
  p10: number;
  mode: number;
  mean: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  stddev: number;
  sum: number;
  valueCount: number;
}

export function getStats(data: number[]): Stats {
  const sorted = asc(data);
  const sum = data.reduce((a, b) => a + b, 0);
  return {
    min: sorted[0],
    p1: quantileOnSorted(sorted, 0.01),
    p5: quantileOnSorted(sorted, 0.05),
    p10: quantileOnSorted(sorted, 0.1),
    mode: quantileOnSorted(sorted, 0.5),
    mean: sum / data.length,
    p90: quantileOnSorted(sorted, 0.9),
    p95: quantileOnSorted(sorted, 0.95),
    p99: quantileOnSorted(sorted, 0.99),
    max: sorted[sorted.length - 1],
    stddev: 0, // TODO
    sum,
    valueCount: data.length,
  };
}
