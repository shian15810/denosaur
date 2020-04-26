import DenoStd from "./deno_std.ts";
import DenoX from "./deno_x.ts";
import Pika from "./pika.ts";
import Unpkg from "./unpkg.ts";
import { unique } from "../../utils.ts";

enum Vendor {
  DenoStd = "deno_std",
  DenoX = "deno_x",
  Pika = "pika",
  Unpkg = "unpkg",
}

const isVendor = (vendor: string): vendor is Vendor =>
  Object.values<string>(Vendor).includes(vendor);

class Vendors {
  #denoStd = new DenoStd();
  #denoX = new DenoX();
  #pika = new Pika();
  #unpkg = new Unpkg();

  get [Vendor.DenoStd](): DenoStd {
    return this.#denoStd;
  }
  get [Vendor.DenoX](): DenoX {
    return this.#denoX;
  }
  get [Vendor.Pika](): Pika {
    return this.#pika;
  }
  get [Vendor.Unpkg](): Unpkg {
    return this.#unpkg;
  }

  init = (vendors: Vendor[]): Promise<void[]> =>
    Promise.all(unique(vendors).map((vendor) => this[vendor].init()));
}

export { isVendor, Vendor };
export default Vendors;
