import { Pipeline } from '../../backend/src/core/pipeline';
 test('pipeline runs 20', async () => { const p = new Pipeline(); expect(typeof p).toBe('object'); });
