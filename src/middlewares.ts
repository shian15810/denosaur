type Next<Context> = (context: Context) => Promise<void>;

type Middleware<Context> = (
  context: Context,
  next: Next<Context>,
) => Promise<void>;

const next = async <Context>(
  context: Context,
  middlewares: Middleware<Context>[],
): Promise<void> => {
  const [middleware, ...nexts] = middlewares;
  if (middleware === undefined) return;
  return middleware(context, (ctx) => next(ctx, nexts));
};

class Middlewares<Context extends { [context: string]: unknown }> {
  #context: Context;
  #middlewares: Middleware<Context>[] = [];

  constructor(context: Context) {
    this.#context = context;
  }

  use = (middleware: Middleware<Context>): void => {
    this.#middlewares = [...this.#middlewares, middleware];
  };

  run = (): Promise<void> => next(this.#context, this.#middlewares);
}

export { Next };
export default Middlewares;
