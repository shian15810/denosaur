import DenoStd from "./deno_std.ts";
import DenoX from "./deno_x.ts";
import Pika from "./pika.ts";
import { Vendor } from "./types.ts";
import Unpkg from "./unpkg.ts";

enum VendorName {
  DenoStd = "deno_std",
  DenoX = "deno_x",
  Pika = "pika",
  Unpkg = "unpkg",
}

const isVendorName = (vendor: string): vendor is VendorName =>
  Object.values<string>(VendorName).includes(vendor);

type Vendors = { [vendor in VendorName]: Vendor };
const vendors = async (): Promise<Vendors> => ({
  [VendorName.DenoStd]: await new DenoStd().init(),
  [VendorName.DenoX]: await new DenoX().init(),
  [VendorName.Pika]: new Pika(),
  [VendorName.Unpkg]: new Unpkg(),
});

export { isVendorName, VendorName };
export default vendors;
