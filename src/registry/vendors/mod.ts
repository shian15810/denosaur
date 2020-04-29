import DenoStd from "./deno_std.ts";
import DenoX from "./deno_x.ts";
import Pika from "./pika.ts";
import Unpkg from "./unpkg.ts";

enum VendorName {
  /* eslint-disable no-shadow */
  DenoStd = "deno_std",
  DenoX = "deno_x",
  Pika = "pika",
  Unpkg = "unpkg",
  /* eslint-enable no-shadow */
}

const isVendorName = (vendor: string): vendor is VendorName =>
  Object.values<string>(VendorName).includes(vendor);

class Vendors {
  #denoStd = new DenoStd();
  #denoX = new DenoX();
  #pika = new Pika();
  #unpkg = new Unpkg();

  get [VendorName.DenoStd](): DenoStd {
    return this.#denoStd;
  }
  get [VendorName.DenoX](): DenoX {
    return this.#denoX;
  }
  get [VendorName.Pika](): Pika {
    return this.#pika;
  }
  get [VendorName.Unpkg](): Unpkg {
    return this.#unpkg;
  }
}

export { isVendorName, VendorName };
export default Vendors;
