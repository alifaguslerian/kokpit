export interface WorkerBindings {
  DB: D1Database;
}

export interface WorkerVariables {
  userId: string;
}

export interface WorkerEnv {
  Bindings: WorkerBindings;
  Variables: WorkerVariables;
}
