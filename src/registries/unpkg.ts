type Registry = {};

type Dependencies = { [module: string]: string };

class Unpkg {
  #registry: Registry = {};
  #dependencies: Dependencies = {};
  #inited = false;

  init = async (dependencies: Dependencies): Promise<void> => {
    await Promise.resolve();

    if (this.#inited) return;

    this.#dependencies = dependencies;
    this.#inited = true;
  };
}

export default Unpkg;
