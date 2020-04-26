import Pika from "./pika.ts";
import { Vendor } from "./types.ts";
import Unpkg from "./unpkg.ts";

enum VendorName {
  Pika = "pika",
  Unpkg = "unpkg",
}

const isVendorName = (vendor: string): vendor is VendorName =>
  Object.values<string>(VendorName).includes(vendor);

type Vendors = { [vendor in VendorName]: Vendor };
const vendors = (): Vendors => ({
  [VendorName.Pika]: new Pika(),
  [VendorName.Unpkg]: new Unpkg(),
});

export { isVendorName, VendorName };
export default vendors;
