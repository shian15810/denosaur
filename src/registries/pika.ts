type Dependencies = { [module: string]: string };

type Registry = {};

class Pika {
  #dependencies: Dependencies = {};
  #registry: Registry = {};
  #inited = false;

  init = async (dependencies: Dependencies): Promise<void> => {
    await Promise.resolve();

    if (this.#inited) return;

    this.#dependencies = dependencies;
    this.#inited = true;
  };
}

export default Pika;
