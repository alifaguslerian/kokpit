export type WorkerBindings = Pick<Cloudflare.Env, 'DB' | 'R2'>;

export interface WorkerVariables {
  userId: string;
}

export interface WorkerEnv {
  Bindings: WorkerBindings;
  Variables: WorkerVariables;
}
