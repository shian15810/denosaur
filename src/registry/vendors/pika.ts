import { Vendor } from "./types.ts";

class Pika implements Vendor {
  resolve = (module: string, rangeOrAlias: string): string => "";
}

export default Pika;
