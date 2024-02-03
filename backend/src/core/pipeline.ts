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
// refine step 6
// refine step 7
// refine step 8
// refine step 9
// refine step 10
// refine step 11
// refine step 12
// refine step 13
// refine step 14
// refine step 15
// refine step 16
// refine step 17
// refine step 18
// refine step 19
// refine step 20
// refine step 21
// refine step 22
