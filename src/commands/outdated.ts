import Meta from "../meta.ts";
import Middlewares, * as middleware from "../middlewares.ts";
import Registries, * as registry from "../registries/mod.ts";

type Context = { meta: Meta; registries: Registries };

const metaMiddleware = async (
  context: Context,
  next: middleware.Next<Context>,
): Promise<void> => {
  const { meta } = context;
  await meta.init();
  if (meta.root === undefined) return;
  return next(context);
};

const registriesMiddleware = async (
  context: Context,
  next: middleware.Next<Context>,
): Promise<void> => {
  const { meta, registries } = context;
  if (meta.denosaur?.dependencies === undefined) return;
  const dependencies = Object.entries(meta.denosaur.dependencies).reduce(
    (deps: { [reg: string]: { [mod: string]: string } }, [dep, rng]) => {
      const [reg, mod] = dep.split(":");
      if (reg === undefined || mod === undefined) return deps;
      return { ...deps, [reg]: { ...(deps[reg] ?? {}), [mod]: rng } };
    },
    {},
  );
  await Promise.all(
    Object.keys(dependencies)
      .filter(registry.isRegistryName)
      .map((reg) => registries[reg].init(dependencies[reg])),
  );
  return next(context);
};

const outdated = (): Promise<void> => {
  const context = { meta: new Meta(), registries: new Registries() };
  const middlewares = new Middlewares(context);
  middlewares.use(metaMiddleware);
  middlewares.use(registriesMiddleware);
  return middlewares.run();
};

export default outdated;
