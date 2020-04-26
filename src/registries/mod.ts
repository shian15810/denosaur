import Pika from "./pika.ts";

enum Registry {
  Pika = "pika",
}
const isRegistry = (registry: string): registry is Registry =>
  Object.values<string>(Registry).includes(registry);

class Registries {
  #pika = new Pika();
  get [Registry.Pika](): Pika {
    return this.#pika;
  }
}

export { isRegistry };
export default Registries;
