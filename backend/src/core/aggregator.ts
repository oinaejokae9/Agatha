export type DataPoint = { source: string; value: number; timestamp: number };
export function aggregateMedian(inputs: DataPoint[]): number {
  const values = inputs.map(i => i.value).sort((a,b)=>a-b);
  const mid = Math.floor(values.length/2);
  return values.length % 2 ? values[mid] : (values[mid-1] + values[mid]) / 2;
}
