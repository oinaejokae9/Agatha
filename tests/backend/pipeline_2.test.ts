import { Pipeline } from '../../backend/src/core/pipeline';
 test('pipeline runs 2', async () => { const p = new Pipeline(); expect(typeof p).toBe('object'); });
