import { aggregateMedian, aggregateTrimmedMean, detectOutliers, DataPoint } from '../../backend/src/core/aggregator';

test('median works for odd and even', () => {
  const odd: DataPoint[] = [1, 3, 2].map((v, i) => ({ source: `s${i}`, value: v, timestamp: i }));
  const even: DataPoint[] = [1, 2, 3, 4].map((v, i) => ({ source: `s${i}`, value: v, timestamp: i }));
  expect(aggregateMedian(odd)).toBe(2);
  expect(aggregateMedian(even)).toBe(2.5);
});

test('trimmed mean reduces outlier impact', () => {
  const arr: DataPoint[] = [100, 101, 102, 1000].map((v, i) => ({ source: `s${i}`, value: v, timestamp: i }));
  const mean = aggregateTrimmedMean(arr, 0.25);
  expect(mean).toBeGreaterThan(100);
  expect(mean).toBeLessThan(200);
});

test('outlier detection splits data', () => {
  const arr: DataPoint[] = [100, 101, 102, 1000].map((v, i) => ({ source: `s${i}`, value: v, timestamp: i }));
  const { inliers, outliers } = detectOutliers(arr);
  expect(inliers.length).toBe(3);
  expect(outliers.length).toBe(1);
});
