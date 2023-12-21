export type Task = { id: string; run: () => Promise<void> };
export class Pipeline {
  private tasks: Task[] = [];
  add(task: Task) { this.tasks.push(task); }
  async runAll() { for (const t of this.tasks) { await t.run(); } }
}
// step 0
// refine step 1
// refine step 2
// refine step 3
// refine step 4
// refine step 5
