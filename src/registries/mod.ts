import DenoStd from "./deno_std/mod.ts";
import DenoX from "./deno_x/mod.ts";
import Pika from "./pika.ts";
import Unpkg from "./unpkg.ts";

enum RegistryName {
  "DenoStd" = "deno_std",
  "DenoX" = "deno_x",
  "Pika" = "pika",
  "Unpkg" = "unpkg",
}

const isRegistryName = (registry: string): registry is RegistryName =>
  Object.values<string>(RegistryName).includes(registry);

class Registries {
  #denoStd = new DenoStd();
  #denoX = new DenoX();
  #pika = new Pika();
  #unpkg = new Unpkg();

  get [RegistryName.DenoStd](): DenoStd {
    return this.#denoStd;
  }
  get [RegistryName.DenoX](): DenoX {
    return this.#denoX;
  }
  get [RegistryName.Pika](): Pika {
    return this.#pika;
  }
  get [RegistryName.Unpkg](): Unpkg {
    return this.#unpkg;
  }
}

export { isRegistryName };
export default Registries;
