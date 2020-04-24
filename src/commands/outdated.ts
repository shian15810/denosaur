import * as deno from '../deno.ts';
import Meta from '../meta.ts';
import Middlewares, * as middleware from '../middlewares.ts';
import Registries, * as registry from '../registries/mod.ts';

type Context = { meta: Meta; registries: Registries; dependencies: string[] };

const dependenciesMiddleware = (
  context: Context,
  next: middleware.Next<Context>,
): Promise<void> => {
  const { meta, dependencies: deps } = context;
  const _dependencies = Object.keys(meta.denosaur._dependencies);
  const dependencies =
    deps.length === 0
      ? _dependencies
      : _dependencies.filter((dep) => deps.includes(dep));
  return next({ ...context, dependencies });
};

const registriesMiddleware = async (
  context: Context,
  next: middleware.Next<Context>,
): Promise<void> => {
  const { meta, registries, dependencies } = context;
  await Promise.all(dependencies.map((dep) => {
    const deps = dep.split(":");
    if (deps.length !== 2 && deps.includes("")) return;
    const [reg, mod] = deps;
    if (!registry.isRegistryName(reg)) return;

  }));
  return next(context);
};

const outdated = (): Promise<void> => {
  const [, ...dependencies] = deno.args._;
  const context = {
    meta: new Meta(),
    registries: new Registries(),
    dependencies,
  };
  const middlewares = new Middlewares(context);
  middlewares.use(dependenciesMiddleware);
  middlewares.use(registriesMiddleware);
  return middlewares.run();
};

export default outdated;
