import * as init from "./init/mod.ts";
import * as types from "./types.ts";

class DenoX {
  #database: types.Database = {};
  #registry: types.Registry = {};
  #inited = false;

  init = async (modules: string[]): Promise<void> => {
    if (this.#inited) return;

    this.#database = await init.getDatabase();
    this.#registry = init.toRegistry(this.#database, modules);
    this.#registry = await init.initRegistry(this.#registry);
    console.log(this.#registry);
    this.#inited = true;
  };
}

export default DenoX;
