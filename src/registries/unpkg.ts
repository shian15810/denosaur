type Registry = {};

class Unpkg {
  #registry: Registry = {};

  #inited = false;
  init = async (): Promise<this> => {
    await Promise.resolve();

    if (this.#inited) return this;

    this.#inited = true;
    return this;
  };
}

const unpkg = (): Promise<Unpkg> => new Unpkg().init();

export default unpkg;
