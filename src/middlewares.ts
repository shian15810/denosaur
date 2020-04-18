export type Next<Context> = (context: Context) => Promise<void>;

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

class Middlewares<Context> {
  middlewares: Middleware<Context>[] = [];

  use = (middleware: Middleware<Context>): void => {
    this.middlewares = [...this.middlewares, middleware];
  };

  run = (context: Context): Promise<void> => next(context, this.middlewares);
}

export default Middlewares;
