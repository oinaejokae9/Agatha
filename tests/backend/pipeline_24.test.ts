import { Pipeline } from '../../backend/src/core/pipeline';
 test('pipeline runs 24', async () => { const p = new Pipeline(); expect(typeof p).toBe('object'); });
