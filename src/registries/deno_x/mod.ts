import * as init from "./init.ts";
import * as types from "./types.ts";

class DenoX {
  #database: types.Database = {};
  #dependencies: types.Dependencies = {};
  #registry: types.Registry = {};
  #inited = false;

  init = async (dependencies: types.Dependencies): Promise<void> => {
    if (this.#inited) return;

    this.#database = await init.getDatabase();
    this.#dependencies = init.validateDependencies(dependencies);
    this.#registry = init.toRegistry(
      this.#database,
      Object.keys(this.#dependencies),
    );
    this.#registry = await init.initRegistry(this.#registry);
    this.#inited = true;
  };
}

export default DenoX;
