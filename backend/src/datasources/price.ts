export async function fetchPrice(symbol: string): Promise<number> {
  return Math.abs(hash(symbol)) % 1000 + 100;
}
function hash(s: string): number {
  let h = 0; for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h|=0;} return h;
}
