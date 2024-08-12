export type TaskResult<T> = { ok: true; value: T } | { ok: false; error: Error };

export type Task<T> = {
  id: string;
  run: () => Promise<T>;
  retries?: number;
  retryDelayMs?: number;
};

export class Pipeline {
  private tasks: Task<unknown>[] = [];
  private concurrency: number;

  constructor(concurrency: number = 2) {
    this.concurrency = Math.max(1, concurrency);
  }

  add<T>(task: Task<T>): void {
    this.tasks.push(task);
  }

  async runAll(): Promise<TaskResult<unknown>[]> {
    const results: TaskResult<unknown>[] = [];
    const queue = [...this.tasks];

    const workers: Promise<void>[] = [];
    for (let i = 0; i < this.concurrency; i++) {
      workers.push(
        (async () => {
          while (queue.length > 0) {
            const task = queue.shift();
            if (!task) break;
            const { run, retries = 0, retryDelayMs = 200 } = task;
            let attempts = 0;
            while (true) {
              try {
                const value = await run();
                results.push({ ok: true, value });
                break;
              } catch (err) {
                if (attempts < retries) {
                  attempts += 1;
                  await new Promise((r) => setTimeout(r, retryDelayMs));
                  continue;
                }
                results.push({ ok: false, error: err as Error });
                break;
              }
            }
          }
        })()
      );
    }

    await Promise.all(workers);
    return results;
  }
}
