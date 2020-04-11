type Registry = {};

class Pika {
  #registry: Registry = {};

  #inited = false;
  init = async (): Promise<this> => {
    if (this.#inited) return this;

    this.#inited = true;
    return this;
  };
}

const pika = (): Promise<Pika> => new Pika().init();

export default pika;
