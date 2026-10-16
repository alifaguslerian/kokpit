export interface WorkerBindings {
  DB: D1Database;
}

export interface WorkerEnv {
  Bindings: WorkerBindings;
}
