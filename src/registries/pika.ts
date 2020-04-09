type Database = { [module: string]: string[] };
type Registry = { [module: string]: string[] };

class Pika {
  #database: Database = {};
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
