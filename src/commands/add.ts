import Meta from "../meta.ts";
import Middlewares, { Next } from "../middlewares.ts";
import Registries, { isRegistry } from "../registries/mod.ts";

type Context = { inputs: string[]; meta: Meta; registries: Registries };

const registries = async (
  context: Context,
  next: Next<Context>,
): Promise<void> => {
  const versions = await Promise.all(
    context.inputs.map((input) => {
      const [dependency, version] = input.split("@");
      const dependencies = dependency.split(":");
      if (dependencies.length !== 2 && dependencies.includes("")) return;
      const [registry, module] = dependencies;
      if (!isRegistry(registry)) return;
      return context.registries[registry].resolve(module, version ?? "latest");
    }),
  );
  console.log(versions);
  return next(context);
};

const add = (inputs: string[]): Promise<void> => {
  const middlewares = new Middlewares({
    inputs,
    meta: new Meta(),
    registries: new Registries(),
  });
  middlewares.use(registries);
  return middlewares.run();
};

export default add;
