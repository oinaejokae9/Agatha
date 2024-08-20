export type DataPoint = { source: string; value: number; timestamp: number };

function assertNonEmpty<T>(arr: T[], msg: string): asserts arr is [T, ...T[]] {
  if (arr.length === 0) throw new Error(msg);
}

export function aggregateMedian(inputs: DataPoint[]): number {
  assertNonEmpty(inputs, 'no datapoints');
  const values = inputs.map((i) => i.value).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

export function aggregateTrimmedMean(inputs: DataPoint[], trim = 0.1): number {
  assertNonEmpty(inputs, 'no datapoints');
  const values = inputs.map((i) => i.value).sort((a, b) => a - b);
  const k = Math.max(0, Math.min(Math.floor(values.length * trim), Math.floor((values.length - 1) / 2)));
  const slice = values.slice(k, values.length - k);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}

export function detectOutliers(inputs: DataPoint[]): { inliers: DataPoint[]; outliers: DataPoint[] } {
  assertNonEmpty(inputs, 'no datapoints');
  const values = inputs.map((i) => i.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const threshold = 3 * std;
  const inliers: DataPoint[] = [];
  const outliers: DataPoint[] = [];
  for (const dp of inputs) {
    if (Math.abs(dp.value - mean) > threshold) outliers.push(dp);
    else inliers.push(dp);
  }
  return { inliers, outliers };
}
