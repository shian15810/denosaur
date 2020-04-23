type Registry = {};

class Pika {
  #registry: Registry = {};
  #inited = false;

  init = async (modules: string[]): Promise<void> => {
    await Promise.resolve();

    if (this.#inited) return;

    this.#inited = true;
  };
}

export default Pika;
